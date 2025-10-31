import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { emailService } from '../services/emailService';
import { addPoints, POINTS_REWARDS } from './loyaltyController';
import { generateQRCodeString } from '../services/qrService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface BookingRequest {
  showtimeId: string;
  seatNumbers: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userId?: string;
  paymentMethod: 'ESEWA' | 'KHALTI' | 'CASH';
}

/**
 * Test email functionality
 */
export const testEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    console.log('🧪 Testing email functionality...');
    const result = await emailService.sendTestEmail(email);
    
    if (result) {
      return res.json({
        success: true,
        message: 'Test email sent successfully!',
        data: { email }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (req: Request, res: Response) => {
  try {
    console.log('📋 Creating booking with data:', req.body);
    
    const {
      showtimeId,
      seatNumbers,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod
    }: BookingRequest = req.body;

    // Get user ID from token if available
    let userId: string | undefined;
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch {
        // Token invalid, continue with userId from body or null
      }
    }

    // Fallback to userId from request body
    if (!userId) {
      userId = req.body.userId;
    }

    // Validate request
    console.log('🔍 Validation check:', {
      showtimeId: !!showtimeId,
      seatNumbers: seatNumbers?.length || 0,
      customerName: !!customerName,
      customerEmail: !!customerEmail,
      customerPhone: !!customerPhone
    });

    if (!showtimeId || !seatNumbers?.length) {
      console.error('❌ Validation failed: Missing showtimeId or seatNumbers');
      return res.status(400).json({
        success: false,
        message: 'Showtime ID and seat numbers are required'
      });
    }

    if (!customerName || !customerEmail || !customerPhone) {
      console.error('❌ Validation failed: Missing customer information');
      return res.status(400).json({
        success: false,
        message: 'Customer information is required'
      });
    }

    // Get showtime details
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        screen: {
          include: {
            theater: true
          }
        },
        movie: true
      }
    });

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    // Find the selected seats for this screen
    const selectedSeats = await prisma.seat.findMany({
      where: {
        screenId: showtime.screenId,
        seatNumber: { in: seatNumbers }
      },
      include: {
        category: true
      }
    });

    if (selectedSeats.length !== seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Some seats not found'
      });
    }

    // Check if seats are available (not booked or held)
    const existingBookings = await prisma.booking.findMany({
      where: {
        showtimeId: showtimeId,
        bookingStatus: 'CONFIRMED',
        seats: {
          hasSome: seatNumbers
        }
      }
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some seats are already booked'
      });
    }

    // Check if seats are currently held
    const activeHolds = await prisma.seatHold.findMany({
      where: {
        seatId: {
          in: selectedSeats.map((seat: any) => seat.id)
        },
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (activeHolds.length > 0) {
      // If holds exist but not for the current user, reject
      if (userId && !activeHolds.every(hold => hold.userId === userId)) {
        return res.status(400).json({
          success: false,
          message: 'Some seats are currently held by another user'
        });
      }
    }

    // Calculate total amount
    const totalAmount = selectedSeats.reduce((sum: number, seat: any) => sum + seat.price, 0);

    // Generate booking reference
    const bookingReference = `SS${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create booking using transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.booking.create({
        data: {
          bookingType: 'MOVIE',
          showtimeId: showtimeId,
          userId: userId || 'system',
          customerName,
          customerEmail,
          customerPhone,
          seats: seatNumbers,
          seatCount: seatNumbers.length,
          ticketPrice: totalAmount,
          totalAmount,
          paymentMethod,
          // Complete all payments immediately for dummy payment flow
          paymentStatus: 'COMPLETED',
          bookingStatus: 'CONFIRMED',
          bookingReference,
          ...(userId ? { bookingSource: 'SHOWSEWA' as any } : { bookingSource: 'POS_SYSTEM' as any })
        }
      });

      // Step 6: Clear any existing holds for these seats
      await tx.seatHold.deleteMany({
        where: {
          seatId: {
            in: selectedSeats.map((seat: any) => seat.id)
          }
        }
      });

      // Step 7: Update seat status to BOOKED
      await tx.seat.updateMany({
        where: {
          id: {
            in: selectedSeats.map((seat: any) => seat.id)
          }
        },
        data: {
          status: 'BOOKED',
          bookingId: newBooking.id,
          updatedAt: new Date()
        }
      });

      // Step 8: Update showtime available seats count
      await tx.showtime.update({
        where: { id: showtimeId },
        data: {
          availableSeats: {
            decrement: seatNumbers.length
          }
        }
      });

      return { booking: newBooking, seats: selectedSeats };
    }, {
      isolationLevel: 'ReadCommitted', // BookMyShow-style: Read committed isolation prevents dirty reads
      maxWait: 5000, // Max 5 seconds to acquire lock
      timeout: 10000, // Max 10 seconds for transaction
    });

    // Extract booking and seats from transaction result
    const bookingResult = booking;

    // Get booking with related data
    const bookingWithDetails = await prisma.booking.findUnique({
      where: { id: bookingResult.booking.id },
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
        }
      }
    });

    console.log('✅ Booking created successfully:', bookingWithDetails?.id);

    // Handle post-booking tasks (non-blocking)
    if (bookingWithDetails) {
      // Send confirmation email (async, don't wait)
      if (bookingWithDetails.paymentStatus === 'COMPLETED') {
        // Generate QR code for the booking
        generateQRCodeString(bookingWithDetails.id).then((qrString) => {
          if (qrString) {
            console.log('✅ QR code generated for booking:', bookingWithDetails.id);
          } else {
            console.warn('⚠️ Failed to generate QR code for booking:', bookingWithDetails.id);
          }
        }).catch((qrError) => {
          console.error('Failed to generate QR code:', qrError);
        });

        emailService.sendBookingConfirmation({
          bookingReference: bookingWithDetails.bookingReference,
          customerName: bookingWithDetails.customerName,
          customerEmail: bookingWithDetails.customerEmail,
          movieTitle: bookingWithDetails.showtime?.movie.title || 'Unknown Movie',
          theaterName: bookingWithDetails.showtime?.screen.theater.name || 'Unknown Theater',
          showDate: bookingWithDetails.showtime?.showDate.toLocaleDateString() || '',
          showTime: bookingWithDetails.showtime?.showTime || '',
          seats: bookingWithDetails.seats,
          totalAmount: bookingWithDetails.totalAmount
        }).catch((emailError) => {
          console.error('Failed to send booking confirmation email:', emailError);
        });

        // Award loyalty points for completed booking (async, don't wait)
        if (userId && userId !== 'system') {
          prisma.booking.count({
            where: {
              userId,
              paymentStatus: 'COMPLETED'
            }
          }).then(async (userBookings) => {
            const pointsToAward = userBookings === 1 ? POINTS_REWARDS.FIRST_BOOKING : POINTS_REWARDS.BOOKING;
            const action = userBookings === 1 ? 'FIRST_BOOKING' : 'BOOKING';

            try {
              const pointsResult = await addPoints(
                userId,
                pointsToAward,
                action,
                `Booking for ${bookingWithDetails.showtime?.movie.title || 'movie'}`
              );

              if (pointsResult?.success && pointsResult?.tieredUp) {
                console.log(`🎉 User ${userId} tiered up to ${pointsResult.newTier}!`);
              }
            } catch (pointsError) {
              console.error('Failed to award loyalty points:', pointsError);
            }
          }).catch((error) => {
            console.error('Failed to count user bookings:', error);
          });
        }
      }
    }

    // Generate QR code for immediate response
    let qrString: string | null = null;
    try {
      qrString = await generateQRCodeString(bookingWithDetails!.id);
    } catch (qrError) {
      console.error('Failed to generate QR code synchronously:', qrError);
    }

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: {
          id: bookingWithDetails!.id,
          bookingReference: bookingWithDetails!.bookingReference,
          customerName: bookingWithDetails!.customerName,
          customerEmail: bookingWithDetails!.customerEmail,
          seats: bookingWithDetails!.seats,
          totalAmount: bookingWithDetails!.totalAmount,
          paymentMethod: bookingWithDetails!.paymentMethod,
          paymentStatus: bookingWithDetails!.paymentStatus,
          bookingStatus: bookingWithDetails!.bookingStatus,
          showtime: bookingWithDetails!.showtime,
          qrCode: qrString,
          createdAt: bookingWithDetails!.createdAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isValidationError = errorMessage.includes('validation') || errorMessage.includes('required');
    const isDatabaseError = errorMessage.includes('database') || errorMessage.includes('connection');
    
    return res.status(500).json({
      success: false,
      message: isValidationError ? 'Invalid booking data provided' : 
               isDatabaseError ? 'Database error occurred' : 
               'Failed to create booking. Please try again.',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: req.body })
    });
  }
};

/**
 * Get booking by reference
 */
export const getBookingByReference = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { bookingReference: reference },
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
        }
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
      message: 'Booking retrieved successfully',
      data: {
        booking: {
          id: booking.id,
          bookingReference: booking.bookingReference,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          seats: booking.seats,
          totalAmount: booking.totalAmount,
          paymentMethod: booking.paymentMethod,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,
          showtime: booking.showtime,
          createdAt: booking.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, transactionId } = req.body;

    if (!paymentStatus || !['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment status is required'
      });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus,
        bookingStatus: paymentStatus === 'COMPLETED' ? 'CONFIRMED' : 'PENDING',
        transactionId: transactionId || null
      }
    });

    return res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        booking: {
          id: booking.id,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,
          transactionId: booking.transactionId
        }
      }
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user's bookings
 */
export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: { createdAt: 'desc' },
      include: {
        showtime: {
          include: {
            movie: {
              select: {
                title: true,
                posterUrl: true
              }
            },
            screen: {
              include: {
                theater: {
                  select: {
                    name: true,
                    city: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transform the data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      movieTitle: booking.showtime?.movie?.title || 'Unknown Movie',
      theaterName: booking.showtime?.screen?.theater?.name || 'Unknown Theater',
      showDate: booking.showtime?.showDate || new Date(),
      showTime: booking.showtime?.showTime || 'Unknown Time',
      seats: booking.seats || [],
      totalAmount: booking.totalAmount,
      status: booking.bookingStatus,
      createdAt: booking.createdAt
    }));

    return res.json({
      success: true,
      data: {
        bookings: transformedBookings
      }
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
