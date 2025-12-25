import { Request, Response } from 'express';
import { NepPayments } from 'neppayments';
import prisma from '../lib/prisma';
import { emailService } from '../services/emailService';
import { generateQRCodeString } from '../services/qrService';
import { addPoints, POINTS_REWARDS } from './loyaltyController';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Lazy initialization function for NepPayments
// Only initializes if at least one payment gateway is configured
// Returns null if no gateways are configured (payment features will be disabled)
let paymentsInstance: NepPayments | null = null;

function getPaymentsInstance(): NepPayments | null {
  if (paymentsInstance !== null) {
    return paymentsInstance;
  }

  const khaltiConfig = process.env.KHALTI_SECRET_KEY ? {
    secretKey: process.env.KHALTI_SECRET_KEY,
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'production' | 'sandbox',
  } : undefined;

  const esewaConfig = process.env.ESEWA_MERCHANT_ID ? {
    productCode: process.env.ESEWA_MERCHANT_ID,
    secretKey: process.env.ESEWA_SECRET || '',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'production' | 'sandbox',
    successUrl: `${FRONTEND_URL}/payment/success`,
    failureUrl: `${FRONTEND_URL}/payment/failure`,
  } : undefined;

  // Only initialize if at least one gateway is configured
  if (!khaltiConfig && !esewaConfig) {
    // Return null instead of throwing - allows server to start without payment config
    console.warn('⚠️  Payment gateways not configured. Payment features will be disabled. Set KHALTI_SECRET_KEY or ESEWA_MERCHANT_ID to enable payments.');
    return null;
  }

  try {
    paymentsInstance = new NepPayments({
      khalti: khaltiConfig,
      esewa: esewaConfig,
    });
    return paymentsInstance;
  } catch (error) {
    console.error('Failed to initialize payment gateways:', error);
    return null;
  }
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Initiate payment for a booking
 */
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and payment method are required'
      });
    }

    if (!['KHALTI', 'ESEWA'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Use KHALTI or ESEWA'
      });
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        showtime: {
          include: {
            movie: true,
            screen: {
              include: {
                theater: true
              }
            }
          }
        },
        event: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.paymentStatus === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      });
    }

    const amount = booking.totalAmount;
    const amountInPaisa = Math.round(amount * 100); // Convert to paisa

    // Customer info
    const customerInfo = {
      name: booking.customerName,
      email: booking.customerEmail,
      phone: booking.customerPhone || '9800000000',
    };

    let paymentResponse;

    if (paymentMethod === 'KHALTI') {
      // Initiate Khalti payment
      if (!process.env.KHALTI_SECRET_KEY) {
        return res.status(503).json({
          success: false,
          message: 'Khalti payment is not configured. Please set KHALTI_SECRET_KEY environment variable.'
        });
      }

      const payments = getPaymentsInstance();
      if (!payments || !payments.khalti) {
        return res.status(503).json({
          success: false,
          message: 'Khalti payment is not available. Payment gateway configuration is missing.'
        });
      }

      const khaltiPayment = await payments.khalti.createPayment({
        amount: amountInPaisa,
        purchase_order_id: booking.bookingReference,
        purchase_order_name: booking.showtime 
          ? `Movie: ${booking.showtime.movie.title}` 
          : `Event: ${booking.event?.title || 'Booking'}`,
        return_url: `${FRONTEND_URL}/payment/success?bookingId=${bookingId}`,
        website_url: FRONTEND_URL,
        customer_info: customerInfo,
      });

      paymentResponse = {
        paymentUrl: khaltiPayment.payment_url,
        pidx: khaltiPayment.pidx,
        paymentMethod: 'KHALTI'
      };
    } else if (paymentMethod === 'ESEWA') {
      // Initiate eSewa payment
      if (!process.env.ESEWA_MERCHANT_ID) {
        return res.status(503).json({
          success: false,
          message: 'eSewa payment is not configured. Please set ESEWA_MERCHANT_ID environment variable.'
        });
      }

      const payments = getPaymentsInstance();
      if (!payments || !payments.esewa) {
        return res.status(503).json({
          success: false,
          message: 'eSewa payment is not available. Payment gateway configuration is missing.'
        });
      }

      const transactionUuid = `ESEWA_${booking.bookingReference}_${Date.now()}`;
      const esewaPayment = await payments.esewa.createPayment({
        amount: Math.round(amount), // eSewa uses rupees, not paisa
        tax_amount: 0,
        total_amount: Math.round(amount),
        transaction_uuid: transactionUuid,
        product_code: process.env.ESEWA_MERCHANT_ID,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${FRONTEND_URL}/payment/success?bookingId=${bookingId}&transaction_uuid=${transactionUuid}`,
        failure_url: `${FRONTEND_URL}/payment/failure?bookingId=${bookingId}`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
      });

      // eSewa returns form HTML - we'll return it to frontend to submit
      const esewaFormHtml = 'form_html' in esewaPayment ? (esewaPayment as { form_html: string }).form_html : null;
      paymentResponse = {
        paymentUrl: null, // eSewa doesn't use redirect URLs
        paymentMethod: 'ESEWA',
        transactionUuid: transactionUuid,
        formHtml: esewaFormHtml
      };
    }

    // Update booking with payment method and transaction ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentMethod: paymentMethod as any,
        transactionId: paymentResponse.pidx || paymentResponse.transactionUuid || null
      }
    });

    return res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: paymentResponse
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Verify payment (callback from payment gateway)
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId, pidx, paymentMethod } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and payment method are required'
      });
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        showtime: {
          include: {
            movie: true,
            screen: {
              include: {
                theater: true
              }
            }
          }
        },
        event: true,
        user: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.paymentStatus === 'COMPLETED') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: { booking }
      });
    }

    let verificationResult;

    if (paymentMethod === 'KHALTI') {
      if (!pidx) {
        return res.status(400).json({
          success: false,
          message: 'PIDX is required for Khalti verification'
        });
      }

      const payments = getPaymentsInstance();
      if (!payments || !payments.khalti) {
        return res.status(503).json({
          success: false,
          message: 'Khalti payment is not available. Payment gateway configuration is missing.'
        });
      }

      verificationResult = await payments.khalti.verifyPayment({
        pidx: pidx
      });

      if (verificationResult.status !== 'Completed') {
        // Payment failed or pending
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'FAILED',
            transactionId: pidx
          }
        });

        return res.status(400).json({
          success: false,
          message: `Payment ${verificationResult.status.toLowerCase()}`,
          data: { status: verificationResult.status }
        });
      }
    } else if (paymentMethod === 'ESEWA') {
      // eSewa verification - eSewa sends data in query params
      const { transaction_uuid, total_amount } = req.body;

      if (!transaction_uuid || !total_amount || !process.env.ESEWA_MERCHANT_ID) {
        return res.status(400).json({
          success: false,
          message: 'eSewa verification parameters missing'
        });
      }

      // Verify amount matches (eSewa uses rupees, not paisa)
      const expectedAmount = Math.round(booking.totalAmount);
      if (Number.parseFloat(total_amount) !== expectedAmount) {
        return res.status(400).json({
          success: false,
          message: 'Amount mismatch'
        });
      }

      const payments = getPaymentsInstance();
      if (!payments || !payments.esewa) {
        return res.status(503).json({
          success: false,
          message: 'eSewa payment is not available. Payment gateway configuration is missing.'
        });
      }

      // Verify with eSewa
      verificationResult = await payments.esewa.verifyPayment({
        product_code: process.env.ESEWA_MERCHANT_ID,
        transaction_uuid: transaction_uuid,
        total_amount: Number.parseFloat(total_amount),
      });

      if (!verificationResult.success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'FAILED',
            transactionId: transaction_uuid
          }
        });

        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
    }

    // Payment verified successfully - update booking
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updated = await tx.booking.update({
        where: { id: bookingId },
      data: {
        paymentStatus: 'COMPLETED',
        bookingStatus: 'CONFIRMED',
        transactionId: pidx || req.body.transaction_uuid || req.body.refId || null
      },
        include: {
          showtime: {
            include: {
              movie: true,
              screen: {
                include: {
                  theater: true
                }
              }
            }
          },
          event: true
        }
      });

      // If it's a movie booking, update seats
      if (updated.showtimeId) {
        // Update seat status to BOOKED
        await tx.seat.updateMany({
          where: {
            showtimeId: updated.showtimeId,
            seatNumber: { in: updated.seats }
          },
          data: {
            status: 'BOOKED',
            bookingId: updated.id,
            updatedAt: new Date()
          }
        });

        // Update showtime available seats
        await tx.showtime.update({
          where: { id: updated.showtimeId },
          data: {
            availableSeats: {
              decrement: updated.seatCount
            }
          }
        });
      }

      return updated;
    });

    // Generate QR code
    generateQRCodeString(updatedBooking.id).catch((error) => {
      console.error('Failed to generate QR code:', error);
    });

    // Send confirmation email
    if (updatedBooking.showtime) {
      emailService.sendBookingConfirmation({
        bookingReference: updatedBooking.bookingReference,
        customerName: updatedBooking.customerName,
        customerEmail: updatedBooking.customerEmail,
        movieTitle: updatedBooking.showtime.movie.title,
        theaterName: updatedBooking.showtime.screen.theater.name,
        showDate: updatedBooking.showtime.showDate.toLocaleDateString(),
        showTime: updatedBooking.showtime.showTime,
        seats: updatedBooking.seats,
        totalAmount: updatedBooking.totalAmount
      }).catch((error) => {
        console.error('Failed to send booking confirmation email:', error);
      });
    }

    // Award loyalty points
    if (updatedBooking.userId && updatedBooking.userId !== 'system') {
      try {
        const userBookings = await prisma.booking.count({
          where: {
            userId: updatedBooking.userId,
            paymentStatus: 'COMPLETED'
          }
        });

        const pointsToAward = userBookings === 1 
          ? POINTS_REWARDS.FIRST_BOOKING 
          : POINTS_REWARDS.BOOKING;
        
        const action = userBookings === 1 ? 'FIRST_BOOKING' : 'BOOKING';

        await addPoints(
          updatedBooking.userId,
          pointsToAward,
          action,
          `Booking for ${updatedBooking.showtime?.movie.title || 'event'}`
        );
      } catch (pointsError) {
        console.error('Failed to award loyalty points:', pointsError);
      }
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        booking: {
          id: updatedBooking.id,
          bookingReference: updatedBooking.bookingReference,
          paymentStatus: updatedBooking.paymentStatus,
          bookingStatus: updatedBooking.bookingStatus,
          transactionId: updatedBooking.transactionId
        }
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get payment status for a booking
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingReference: true,
        paymentStatus: true,
        bookingStatus: true,
        paymentMethod: true,
        transactionId: true,
        totalAmount: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
