import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface SeatHoldRequest {
  seatIds: string[];
  userId: string;
  showtimeId: string;
}

interface SeatHoldResponse {
  success: boolean;
  message: string;
  data?: {
    holds: Array<{
      id: string;
      seatNumber: string;
      expiresAt: string;
    }>;
    expiresInSeconds: number;
  };
  error?: string;
}

/**
 * Get seats for a specific showtime/screen
 */
export const getSeatsForShowtime = async (req: Request, res: Response) => {
  try {
    const { showtimeId } = req.params;
    
    console.log('Fetching seats for showtime:', showtimeId);

    if (!showtimeId) {
      return res.status(400).json({
        success: false,
        message: 'Showtime ID is required'
      });
    }

    // Get showtime with related data
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        screen: {
          include: {
            theater: true,
            categories: true
          }
        },
        movie: true,
      }
    });

    if (!showtime) {
      console.error('Showtime not found:', showtimeId);
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    console.log('Found showtime:', {
      id: showtime.id,
      movie: showtime.movie?.title,
      screen: showtime.screen?.id,
      theater: showtime.screen?.theater?.name
    });

    // Get all seats for this screen
    const allSeats = await prisma.seat.findMany({
      where: {
        screenId: showtime.screenId
      },
      include: {
        category: true
      },
      orderBy: [
        { row: 'asc' },
        { column: 'asc' }
      ]
    });

    console.log('Found seats for screen:', allSeats.length);

    // Check if no seats exist for this screen
    if (allSeats.length === 0) {
      console.warn('No seats found for screen:', showtime.screenId, '- Auto-generating seats...');
      
      // Auto-generate seats based on screen capacity and categories
      const screen = showtime.screen;
      const capacity = screen.capacity || 200; // Default capacity
      const categories = screen.categories || [];
      
      if (categories.length === 0) {
        // Auto-create default categories if none exist
        console.log('No seat categories found, creating default categories for screen:', showtime.screenId);
        try {
          const premiumCategory = await prisma.seatCategory.create({
            data: {
              screenId: screen.id,
              categoryId: `premium_${screen.id}_auto`,
              name: 'Premium',
              nameNe: 'प्रिमियम',
              price: 800,
              color: '#FFD700',
              features: ['Extra Comfort', 'Premium View'],
              rowMapping: ['A', 'B', 'C']
            }
          });

          const standardCategory = await prisma.seatCategory.create({
            data: {
              screenId: screen.id,
              categoryId: `standard_${screen.id}_auto`,
              name: 'Standard',
              nameNe: 'मानक',
              price: 600,
              color: '#4CAF50',
              features: ['Standard View'],
              rowMapping: ['D', 'E', 'F', 'G', 'H']
            }
          });

          const economyCategory = await prisma.seatCategory.create({
            data: {
              screenId: screen.id,
              categoryId: `economy_${screen.id}_auto`,
              name: 'Economy',
              nameNe: 'अर्थव्यवस्था',
              price: 400,
              color: '#2196F3',
              features: ['Budget Friendly'],
              rowMapping: ['I', 'J', 'K', 'L']
            }
          });

          categories.push(premiumCategory, standardCategory, economyCategory);
          console.log('✅ Created default seat categories for screen:', screen.id);
        } catch (categoryError) {
          console.error('Error creating default categories:', categoryError);
          return res.status(200).json({
            success: false,
            warning: true,
            message: 'No seats configured for this screen. Please contact the theater administrator.',
            data: {
              showtime: {
                id: showtime.id,
                movie: showtime.movie,
                theater: showtime.screen.theater,
                screen: showtime.screen,
                showDate: showtime.showDate,
                showTime: showtime.showTime,
                price: showtime.price,
                language: showtime.language
              },
              seats: [],
              seatCategories: []
            }
          });
        }
      }

      // Generate seats based on categories and capacity
      try {
        const generatedSeats = [];
        let seatNumber = 1;
        const rows = Math.ceil(Math.sqrt(capacity)); // Approximate square layout
        const seatsPerRow = Math.ceil(capacity / rows);
        
        for (let rowIdx = 0; rowIdx < rows && seatNumber <= capacity; rowIdx++) {
          const rowLetter = String.fromCharCode(65 + rowIdx); // A, B, C, etc.
          
          // Distribute categories across rows (premium in front rows)
          let category = categories[0]; // Default to first category
          if (categories.length > 1) {
            if (rowIdx < Math.floor(rows / 3)) {
              category = categories.find((c: any) => c.name.toLowerCase().includes('premium')) || categories[0];
            } else if (rowIdx < Math.floor(rows * 2 / 3)) {
              category = categories.find((c: any) => c.name.toLowerCase().includes('standard')) || categories[1] || categories[0];
            } else {
              category = categories.find((c: any) => c.name.toLowerCase().includes('economy')) || categories[categories.length - 1];
            }
          }
          
          for (let col = 1; col <= seatsPerRow && seatNumber <= capacity; col++) {
            const seat = await prisma.seat.create({
              data: {
                screenId: screen.id,
                categoryId: category.id,
                seatNumber: `${rowLetter}${col}`,
                row: rowLetter,
                column: col,
                price: category.price,
                status: 'AVAILABLE'
              },
              include: {
                category: true
              }
            });
            generatedSeats.push(seat);
            seatNumber++;
          }
        }
        
        console.log(`✅ Auto-generated ${generatedSeats.length} seats for screen ${screen.id}`);
        allSeats.push(...generatedSeats);
      } catch (generateError) {
        console.error('Error auto-generating seats:', generateError);
        // Continue with empty seats and return warning
        return res.status(200).json({
          success: false,
          warning: true,
          message: 'No seats configured for this screen. Please contact the theater administrator.',
          data: {
            showtime: {
              id: showtime.id,
              movie: showtime.movie,
              theater: showtime.screen.theater,
              screen: showtime.screen,
              showDate: showtime.showDate,
              showTime: showtime.showTime,
              price: showtime.price,
              language: showtime.language
            },
            seats: [],
            seatCategories: []
          }
        });
      }
    }

    // Get active seat holds
    const activeHolds = await prisma.seatHold.findMany({
      where: {
        seatId: {
          in: allSeats.map(seat => seat.id)
        },
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        seat: {
          select: {
            id: true,
            seatNumber: true
          }
        }
      }
    });

    // Get booked seats for this showtime
    const bookedSeats = await prisma.booking.findMany({
      where: {
        showtimeId: showtimeId,
        bookingStatus: 'CONFIRMED'
      },
      select: {
        seats: true
      }
    });

    const bookedSeatNumbers = new Set(bookedSeats.flatMap(booking => booking.seats));
    const heldSeatIds = new Set(activeHolds.map(hold => hold.seat.id));

    // Format seat data
    const seats = allSeats.map((seat: any) => {
      const isBooked = bookedSeatNumbers.has(seat.seatNumber);
      const isHeld = heldSeatIds.has(seat.id);
      
      return {
        id: seat.id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        column: seat.column,
        price: seat.price,
        categoryId: seat.categoryId,
        categoryName: seat.category?.name || 'Standard',
        categoryColor: seat.category?.color || '#4CAF50',
        isBooked,
        isHeld,
        isSelected: false
      };
    });

    // Get unique seat categories
    const seatCategories = allSeats.reduce((acc: any[], seat: any) => {
      const category = seat.category;
      if (category && !acc.some(cat => cat.id === category.id)) {
        acc.push({
          id: category.id,
          name: category.name,
          nameNe: category.nameNe,
          price: category.price,
          color: category.color,
          features: category.features
        });
      }
      return acc;
    }, [] as any[]);

    return res.json({
      success: true,
      message: 'Seats retrieved successfully',
      data: {
        showtime: {
          id: showtime.id,
          movie: showtime.movie,
          theater: showtime.screen.theater,
          screen: showtime.screen,
          showDate: showtime.showDate,
          showTime: showtime.showTime,
          price: showtime.price,
          language: showtime.language
        },
        seats,
        seatCategories
      }
    });

  } catch (error) {
    console.error('Error fetching seats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Hold seats temporarily (10 minutes)
 */
export const holdSeats = async (req: Request, res: Response) => {
  try {
    const { seatIds, showtimeId }: { seatIds: string[]; showtimeId: string } = req.body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid seat IDs'
      });
    }

    // Get user ID from token if available, otherwise use provided userId
    let userId: string | undefined;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (error) {
        // Token invalid, continue with userId from body
      }
    }

    // Fallback to userId from request body
    if (!userId) {
      userId = req.body.userId;
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Verify seats exist and are available
    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds }
      }
    });

    if (seats.length !== seatIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some seats not found'
      });
    }

    // Check if seats are already booked or held
    const existingHolds = await prisma.seatHold.findMany({
      where: {
        seatId: { in: seatIds },
        expiresAt: { gt: new Date() }
      }
    });

    if (existingHolds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some seats are already held'
      });
    }

    // Check if seats are booked for this showtime
    const bookedSeats = await prisma.booking.findMany({
      where: {
        showtimeId: showtimeId,
        bookingStatus: 'CONFIRMED',
        seats: {
          hasSome: seats.map(s => s.seatNumber)
        }
      }
    });

    if (bookedSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some seats are already booked'
      });
    }

    // Create seat holds (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.seatHold.createMany({
      data: seatIds.map(seatId => ({
        seatId,
        userId,
        expiresAt
      }))
    });

    // Get the created holds with seat details
    const createdHolds = await prisma.seatHold.findMany({
      where: {
        seatId: { in: seatIds },
        userId,
        expiresAt
      },
      include: {
        seat: {
          select: {
            seatNumber: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Seats held successfully',
      data: {
        holds: createdHolds.map(hold => ({
          id: hold.id,
          seatNumber: hold.seat.seatNumber,
          expiresAt: hold.expiresAt.toISOString()
        })),
        expiresInSeconds: 600 // 10 minutes
      }
    });

  } catch (error) {
    console.error('Error holding seats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Release seat holds
 */
export const releaseSeatHolds = async (req: Request, res: Response) => {
  try {
    const { holdIds } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!holdIds || !Array.isArray(holdIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid hold IDs'
      });
    }

    // Delete the holds
    const result = await prisma.seatHold.deleteMany({
      where: {
        id: { in: holdIds },
        userId: userId // Ensure user can only delete their own holds
      }
    });

    return res.json({
      success: true,
      message: `Released ${result.count} seat holds`
    });

  } catch (error) {
    console.error('Error releasing seat holds:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Clean up expired seat holds (called by cron job)
 */
export const cleanupExpiredHolds = async () => {
  try {
    const result = await prisma.seatHold.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`Cleaned up ${result.count} expired seat holds`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired holds:', error);
    return 0;
  }
};
