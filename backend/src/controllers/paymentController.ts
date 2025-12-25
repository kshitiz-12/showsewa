import { Request, Response } from 'express';
import { NepPayments } from 'neppayments';
import prisma from '../lib/prisma';
import { emailService } from '../services/emailService';
import { generateQRCodeString } from '../services/qrService';
import { addPoints, POINTS_REWARDS } from './loyaltyController';

// Initialize NepPayments with Khalti and eSewa
const payments = new NepPayments({
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY || '',
    environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  },
  esewa: {
    merchantId: process.env.ESEWA_MERCHANT_ID || '',
    environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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
        return res.status(500).json({
          success: false,
          message: 'Khalti is not configured. Please set KHALTI_SECRET_KEY'
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
        return res.status(500).json({
          success: false,
          message: 'eSewa is not configured. Please set ESEWA_MERCHANT_ID'
        });
      }

      const esewaPayment = await payments.esewa.createPayment({
        amount: amountInPaisa,
        product_code: booking.bookingReference,
        product_name: booking.showtime 
          ? `Movie: ${booking.showtime.movie.title}` 
          : `Event: ${booking.event?.title || 'Booking'}`,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${FRONTEND_URL}/payment/success?bookingId=${bookingId}`,
        failure_url: `${FRONTEND_URL}/payment/failure?bookingId=${bookingId}`,
        customer_info: customerInfo,
      });

      paymentResponse = {
        paymentUrl: esewaPayment.payment_url,
        paymentMethod: 'ESEWA'
      };
    }

    // Update booking with payment method and transaction ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentMethod: paymentMethod as any,
        transactionId: paymentResponse.pidx || null
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
      // eSewa verification
      const { oid, amt, refId } = req.body;

      if (!oid || !amt || !refId) {
        return res.status(400).json({
          success: false,
          message: 'eSewa verification parameters missing'
        });
      }

      // Verify amount matches
      const expectedAmount = Math.round(booking.totalAmount * 100);
      if (parseInt(amt) !== expectedAmount) {
        return res.status(400).json({
          success: false,
          message: 'Amount mismatch'
        });
      }

      // Verify with eSewa
      verificationResult = await payments.esewa.verifyPayment({
        oid: oid,
        amt: amt,
        refId: refId
      });

      if (!verificationResult.success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'FAILED',
            transactionId: refId
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
          transactionId: pidx || req.body.refId || null
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
