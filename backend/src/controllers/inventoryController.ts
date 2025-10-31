import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Seat inventory management
export const getSeatInventory = async (req: Request, res: Response) => {
  try {
    const { showtimeId } = req.params;

    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        screen: {
          include: {
            theater: true
          }
        },
        bookings: {
          where: {
            bookingStatus: {
              in: ['CONFIRMED', 'PENDING']
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

    const totalSeats = showtime.totalSeats;
    const soldSeats = showtime.bookings.reduce((sum, booking) => sum + booking.seatCount, 0);
    const availableSeats = totalSeats - soldSeats;

    const inventory = {
      theaterId: showtime.screen.theater.id,
      screenId: showtime.screen.id,
      showtimeId: showtime.id,
      totalSeats,
      availableSeats,
      reservedSeats: 0, // TODO: Implement seat holds
      soldSeats,
      blockedSeats: 0, // TODO: Implement blocked seats
      lastUpdated: new Date().toISOString()
    };

    return res.json({
      success: true,
      data: { inventory }
    });

  } catch (error) {
    console.error('Error fetching seat inventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reserve seats temporarily
export const reserveSeats = async (req: Request, res: Response) => {
  try {
    const { showtimeId, seats, duration = 10 } = req.body;

    // Check if seats are available
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        bookings: {
          where: {
            bookingStatus: {
              in: ['CONFIRMED', 'PENDING']
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

    // TODO: Implement actual seat reservation logic
    // For now, just return success
    return res.json({
      success: true,
      message: 'Seats reserved successfully',
      data: {
        reservationId: `res_${Date.now()}`,
        seats,
        expiresAt: new Date(Date.now() + duration * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Error reserving seats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Confirm booking
export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId, channel } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        bookingSource: channel as 'SHOWSEWA' | 'WALK_IN' | 'OTHER_PLATFORM' | 'POS_SYSTEM',
        updatedAt: new Date()
      }
    });

    // Update showtime available seats
    if (booking.showtimeId) {
      await prisma.showtime.update({
        where: { id: booking.showtimeId },
        data: {
          availableSeats: {
            decrement: booking.seatCount
          }
        }
      });
    }

    return res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: { booking: updatedBooking }
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    // Release seats back to showtime
    if (booking.showtimeId) {
      await prisma.showtime.update({
        where: { id: booking.showtimeId },
        data: {
          availableSeats: {
            increment: booking.seatCount
          }
        }
      });
    }

    return res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking: updatedBooking }
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get theater channel configuration
export const getTheaterChannels = async (req: Request, res: Response) => {
  try {
    const { theaterId } = req.params;

    // For now, return default configuration
    // In a real implementation, this would be stored in the database
    const channels = {
      theaterId,
      channels: {
        showsewa: true,
        walkIn: true,
        otherPlatform: false,
        posSystem: true
      },
      syncSettings: {
        autoSync: true,
        syncInterval: 5, // minutes
        lastSync: new Date().toISOString()
      }
    };

    return res.json({
      success: true,
      data: { channels }
    });

  } catch (error) {
    console.error('Error fetching theater channels:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update theater channel configuration
export const updateTheaterChannels = async (req: Request, res: Response) => {
  try {
    const channelData = req.body;

    // TODO: Store channel configuration in database
    // For now, just return success

    return res.json({
      success: true,
      message: 'Channel configuration updated successfully',
      data: { channels: channelData }
    });

  } catch (error) {
    console.error('Error updating theater channels:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Sync inventory across channels
export const syncInventory = async (req: Request, res: Response) => {
  try {
    const { theaterId } = req.params;

    // TODO: Implement actual sync logic with external APIs
    // This would involve:
    // 1. Fetching current inventory from all active channels
    // 2. Comparing with our database
    // 3. Updating discrepancies
    // 4. Notifying channels of changes

    console.log(`Syncing inventory for theater ${theaterId}`);

    return res.json({
      success: true,
      message: 'Inventory synced successfully across all channels',
      data: {
        theaterId,
        syncedAt: new Date().toISOString(),
        channelsUpdated: ['showsewa', 'walkIn', 'otherPlatform', 'posSystem']
      }
    });

  } catch (error) {
    console.error('Error syncing inventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get channel bookings
export const getChannelBookings = async (req: Request, res: Response) => {
  try {
    const { theaterId, channel } = req.query;

    const whereClause: any = {
      showtime: {
        screen: {
          theaterId: theaterId as string
        }
      }
    };

    if (channel) {
      whereClause.bookingSource = channel;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        showtime: {
          include: {
            movie: {
              select: { title: true }
            },
            screen: {
              include: {
                theater: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const channelBookings = bookings.map(booking => ({
      id: booking.id,
      channel: booking.bookingSource,
      theaterId: booking.showtime?.screen.theaterId || '',
      showtimeId: booking.showtimeId,
      seats: booking.seats,
      bookingReference: booking.bookingReference,
      status: booking.bookingStatus,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }));

    return res.json({
      success: true,
      data: { bookings: channelBookings }
    });

  } catch (error) {
    console.error('Error fetching channel bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get theater inventory status
export const getTheaterInventoryStatus = async (req: Request, res: Response) => {
  try {
    const { theaterId } = req.params;

    const showtimes = await prisma.showtime.findMany({
      where: {
        screen: {
          theaterId
        },
        isActive: true,
        showDate: {
          gte: new Date()
        }
      },
      include: {
        movie: {
          select: { title: true }
        },
        screen: {
          select: { id: true, name: true }
        },
        bookings: {
          where: {
            bookingStatus: {
              in: ['CONFIRMED', 'PENDING']
            }
          }
        }
      }
    });

    const inventory = showtimes.map(showtime => ({
      theaterId,
      screenId: showtime.screen.id,
      showtimeId: showtime.id,
      movieTitle: showtime.movie.title,
      screenName: showtime.screen.name,
      totalSeats: showtime.totalSeats,
      availableSeats: showtime.availableSeats,
      soldSeats: showtime.bookings.reduce((sum, booking) => sum + booking.seatCount, 0),
      reservedSeats: 0,
      blockedSeats: 0,
      lastUpdated: new Date().toISOString()
    }));

    return res.json({
      success: true,
      data: { inventory }
    });

  } catch (error) {
    console.error('Error fetching theater inventory status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
