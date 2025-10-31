import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';

/**
 * This controller handles seat synchronization across multiple booking channels
 */

interface SeatUpdateRequest {
  showtimeId: string;
  seatUpdates: Array<{
    seatNumber: string;
    status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
    bookingSource?: 'SHOWSEWA' | 'WALK_IN' | 'OTHER_PLATFORM' | 'POS_SYSTEM';
    bookingReference?: string;
    timestamp: string;
  }>;
}

/**
 * Bulk update seat status from theater's POS system
 * This endpoint would be called by theater's internal systems
 */
export const bulkUpdateSeats = async (req: AuthRequest, res: Response) => {
  try {
    const { showtimeId, seatUpdates }: SeatUpdateRequest = req.body;
    
    if (!showtimeId || !seatUpdates || seatUpdates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Showtime ID and seat updates are required'
      });
    }

    // Verify showtime exists
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId }
    });

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    const updateResults: any[] = [];
    
    // Process each seat update
    for (const update of seatUpdates) {
      const seat = await prisma.seat.findFirst({
        where: {
          showtimeId: showtimeId,
          seatNumber: update.seatNumber
        }
      });

      if (!seat) {
        updateResults.push({
          seatNumber: update.seatNumber,
          success: false,
          message: 'Seat not found'
        });
        continue;
      }

      // Update seat status
      const updatedSeat = await prisma.seat.update({
        where: { id: seat.id },
        data: {
          status: update.status,
          updatedAt: new Date()
        }
      });

      // If seat is being booked, create a booking record for tracking
      if (update.status === 'BOOKED' && update.bookingSource && update.bookingReference) {
        await prisma.booking.create({
          data: {
            bookingReference: update.bookingReference,
            bookingType: 'MOVIE',
            showtimeId: showtimeId,
            userId: req.user?.id || 'system', // System user for non-ShowSewa bookings
            customerName: update.bookingSource === 'WALK_IN' ? 'Walk-in Customer' : 'External Booking',
            customerEmail: update.bookingSource === 'WALK_IN' ? 'pos@theater.com' : 'external@booking.com',
            customerPhone: '+977-0000000000',
            seats: [update.seatNumber],
            seatCount: 1,
            ticketPrice: updatedSeat.price,
            totalAmount: updatedSeat.price,
            paymentMethod: 'CASH',
            paymentStatus: 'COMPLETED',
            bookingStatus: 'CONFIRMED',
            transactionId: update.bookingReference,
            ...(update.bookingSource && { bookingSource: update.bookingSource as any })
          }
        });
      }

      updateResults.push({
        seatNumber: update.seatNumber,
        success: true,
        status: updatedSeat.status
      });
    }

    // Update showtime available seats count
    const bookedSeatsCount = await prisma.seat.count({
      where: {
        showtimeId: showtimeId,
        status: 'BOOKED'
      }
    });

    await prisma.showtime.update({
      where: { id: showtimeId },
      data: {
        availableSeats: showtime.totalSeats - bookedSeatsCount
      }
    });

    return res.json({
      success: true,
      message: 'Seat updates processed',
      data: {
        updated: updateResults.filter(r => r.success).length,
        failed: updateResults.filter(r => !r.success).length,
        results: updateResults
      }
    });

  } catch (error) {
    console.error('Error updating seats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get real-time seat availability for a showtime
 * Includes bookings from all sources
 */
export const getRealTimeSeatAvailability = async (req: Request, res: Response) => {
  try {
    const { showtimeId } = req.params;

    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        movie: {
          select: { title: true }
        },
        screen: {
          include: {
            theater: {
              select: { name: true, city: true }
            }
          }
        }
      }
    });

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    // Get seats for this screen
    const seats = await prisma.seat.findMany({
      where: { screenId: showtime.screenId },
      include: {
        category: true
      },
      orderBy: [
        { row: 'asc' },
        { column: 'asc' }
      ]
    });

    // Also check SeatHold for temporary holds
    const activeHolds = await prisma.seatHold.findMany({
      where: {
        seatId: { in: seats.map(s => s.id) },
        expiresAt: { gt: new Date() }
      },
      include: {
        seat: true
      }
    });

    const heldSeatIds = new Set(activeHolds.map(h => h.seat.id));

    const seatMap = seats.map(seat => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      row: seat.row,
      column: seat.column,
      price: seat.price,
      status: seat.status,
      isHeld: heldSeatIds.has(seat.id),
      category: {
        id: seat.category.id,
        name: seat.category.name,
        color: seat.category.color
      }
    }));

    return res.json({
      success: true,
      data: {
        showtime: {
          id: showtime.id,
          movie: showtime.movie.title,
          theater: showtime.screen.theater.name,
          city: showtime.screen.theater.city,
          showDate: showtime.showDate,
          showTime: showtime.showTime,
          totalSeats: showtime.totalSeats,
          availableSeats: showtime.availableSeats
        },
        seats: seatMap
      }
    });

  } catch (error) {
    console.error('Error fetching seat availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Theater can mark seats as blocked for maintenance, VIP reservations, etc.
 */
export const blockSeats = async (req: AuthRequest, res: Response) => {
  try {
    const { seatIds, reason } = req.body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Seat IDs are required'
      });
    }

    const updatedSeats = await prisma.seat.updateMany({
      where: {
        id: { in: seatIds }
      },
      data: {
        status: 'BLOCKED',
        updatedAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: `Blocked ${updatedSeats.count} seats`,
      data: {
        blockedCount: updatedSeats.count,
        reason: reason || 'Theater management'
      }
    });

  } catch (error) {
    console.error('Error blocking seats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
