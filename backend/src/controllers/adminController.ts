import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { triggerMovieCleanup, getCleanupStats } from '../services/movieCleanupService';
import { SeatStatus, Prisma } from '@prisma/client';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Fetching dashboard stats...');
    
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful for dashboard stats');
      
      // Test individual table access
      const userCountTest = await prisma.user.count();
      const bookingCountTest = await prisma.booking.count();
      console.log('🔍 Direct query test - Users:', userCountTest, 'Bookings:', bookingCountTest);
    } catch (connectionError) {
      console.warn('⚠️ Database connection issue, will try individual queries:', connectionError);
    }
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total counts with individual error handling
    let totalTheaters = 0, totalMovies = 0, totalBookings = 0, totalUsers = 0, verifiedUsers = 0;
    let todayBookings = 0, thisMonthBookings = 0, recentBookings: any[] = [];

    // Fetch each count independently to prevent total failure
    try {
      const [
        theatersResult,
        moviesResult,
        bookingsResult,
        usersResult,
        verifiedUsersResult,
        todayBookingsResult,
        thisMonthBookingsResult,
        recentBookingsResult
      ] = await Promise.allSettled([
        prisma.theater.count({ where: { isActive: true } }),
        prisma.movie.count({ where: { isActive: true } }),
        prisma.booking.count(),
        prisma.user.count(),
        prisma.user.count({ where: { isVerified: true } }),
        prisma.booking.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.booking.count({ where: { createdAt: { gte: thisMonthStart } } }),
        prisma.booking.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            showtime: {
              include: {
                movie: { select: { title: true } },
                screen: {
                  include: {
                    theater: { select: { name: true } }
                  }
                }
              }
            }
          }
        })
      ]);

      // Extract results with fallback to 0 or []
      totalTheaters = theatersResult.status === 'fulfilled' ? theatersResult.value : 0;
      totalMovies = moviesResult.status === 'fulfilled' ? moviesResult.value : 0;
      totalBookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : 0;
      totalUsers = usersResult.status === 'fulfilled' ? usersResult.value : 0;
      verifiedUsers = verifiedUsersResult.status === 'fulfilled' ? verifiedUsersResult.value : 0;
      todayBookings = todayBookingsResult.status === 'fulfilled' ? todayBookingsResult.value : 0;
      thisMonthBookings = thisMonthBookingsResult.status === 'fulfilled' ? thisMonthBookingsResult.value : 0;
      recentBookings = recentBookingsResult.status === 'fulfilled' ? recentBookingsResult.value : [];

      // Log any failed queries for debugging
      const queryResults = [
        { name: 'theaters', result: theatersResult },
        { name: 'movies', result: moviesResult },
        { name: 'bookings', result: bookingsResult },
        { name: 'users', result: usersResult },
        { name: 'verifiedUsers', result: verifiedUsersResult },
        { name: 'todayBookings', result: todayBookingsResult },
        { name: 'thisMonthBookings', result: thisMonthBookingsResult },
        { name: 'recentBookings', result: recentBookingsResult }
      ];
      
      for (const { name, result } of queryResults) {
        if (result.status === 'rejected') {
          console.warn(`⚠️ Failed to fetch ${name}:`, result.reason?.message || 'Unknown error');
        } else {
          console.log(`✅ Successfully fetched ${name}:`, result.value);
        }
      }

    } catch (countError) {
      console.error('Error in dashboard counts Promise.allSettled:', countError);
      // All values remain at their default of 0 or []
    }

    // Get revenue data with error handling
    let todayRevenue = 0, thisMonthRevenue = 0, bookingStatusBreakdown: any[] = [];

    try {
      const [todayRevenueResult, thisMonthRevenueResult] = await Promise.allSettled([
        prisma.booking.aggregate({
          where: {
            createdAt: { gte: todayStart },
            paymentStatus: 'COMPLETED'
          },
          _sum: { totalAmount: true }
        }),
        prisma.booking.aggregate({
          where: {
            createdAt: { gte: thisMonthStart },
            paymentStatus: 'COMPLETED'
          },
          _sum: { totalAmount: true }
        })
      ]);

      todayRevenue = todayRevenueResult.status === 'fulfilled' ? (todayRevenueResult.value._sum.totalAmount || 0) : 0;
      thisMonthRevenue = thisMonthRevenueResult.status === 'fulfilled' ? (thisMonthRevenueResult.value._sum.totalAmount || 0) : 0;

      if (todayRevenueResult.status === 'rejected') {
        console.warn('⚠️ Failed to fetch today revenue:', todayRevenueResult.reason?.message);
      }
      if (thisMonthRevenueResult.status === 'rejected') {
        console.warn('⚠️ Failed to fetch month revenue:', thisMonthRevenueResult.reason?.message);
      }
    } catch (revenueError) {
      console.error('Error in revenue Promise.allSettled:', revenueError);
    }

    try {
      // Get booking status breakdown
      const breakdownResult = await Promise.race([
        prisma.booking.groupBy({
          by: ['bookingStatus'],
          _count: { id: true }
        }),
        // Add a timeout to prevent hanging
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Booking breakdown query timeout')), 5000)
        )
      ]);
      bookingStatusBreakdown = Array.isArray(breakdownResult) ? breakdownResult : [];
    } catch (breakdownError) {
      console.warn('⚠️ Failed to fetch booking status breakdown:', breakdownError instanceof Error ? breakdownError.message : 'Unknown error');
      bookingStatusBreakdown = [];
    }

    // If we got 0 for users or bookings, try direct queries as fallback
    if (totalUsers === 0) {
      try {
        const directUserCount = await prisma.user.count();
        console.log('🔄 Fallback user count query result:', directUserCount);
        if (directUserCount > 0) {
          totalUsers = directUserCount;
        }
      } catch (fallbackError) {
        console.warn('⚠️ Fallback user count query failed:', fallbackError);
      }
    }

    if (totalBookings === 0) {
      try {
        const directBookingCount = await prisma.booking.count();
        console.log('🔄 Fallback booking count query result:', directBookingCount);
        if (directBookingCount > 0) {
          totalBookings = directBookingCount;
        }
      } catch (fallbackError) {
        console.warn('⚠️ Fallback booking count query failed:', fallbackError);
      }
    }

    console.log('✅ Dashboard stats fetched successfully:', {
      totalTheaters,
      totalMovies,
      totalBookings,
      totalUsers,
      verifiedUsers,
      todayBookings,
      thisMonthBookings,
      todayRevenue,
      thisMonthRevenue,
      recentBookingsCount: recentBookings.length,
      breakdownCount: bookingStatusBreakdown.length
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalTheaters,
          totalMovies,
          totalBookings,
          totalUsers,
          verifiedUsers,
          todayBookings,
          thisMonthBookings,
          todayRevenue,
          thisMonthRevenue
        },
        recentBookings,
        bookingStatusBreakdown
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return default stats instead of 500 error to prevent frontend crashes
    res.json({
      success: true,
      data: {
        stats: {
          totalTheaters: 0,
          totalMovies: 0,
          totalBookings: 0,
          totalUsers: 0,
          verifiedUsers: 0,
          todayBookings: 0,
          thisMonthBookings: 0,
          todayRevenue: 0,
          thisMonthRevenue: 0
        },
        recentBookings: [],
        bookingStatusBreakdown: []
      },
      warning: 'Dashboard data may be incomplete due to database issues'
    });
  }
};



/**
 * Get all theaters with pagination
 */
export const getTheaters = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    console.log('Fetching theaters with pagination:', { page, limit });

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful for getTheaters');
    } catch (connectionError) {
      console.error('Database connection failed for getTheaters:', connectionError);
      return res.status(500).json({
        success: false,
        message: 'Database connection error',
        error: 'Unable to connect to database'
      });
    }

    let theaters: any[] = [];
    let total = 0;

    try {
      [theaters, total] = await Promise.all([
        prisma.theater.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            nameNe: true,
            city: true,
            area: true,
            address: true,
            phone: true,
            email: true,
            description: true,
            amenities: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            // Explicitly exclude _count for now to avoid schema issues
          }
        }),
        prisma.theater.count().catch(() => 0)
      ]);
      
      console.log('Successfully fetched theaters:', theaters.length, 'Total:', total);
    } catch (dbError) {
      console.error('Database error in getTheaters:', dbError);
      console.error('Error details:', {
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined
      });
      
      // Return 500 error with details for debugging
      return res.status(500).json({
        success: false,
        message: 'Database error while fetching theaters',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    }

    return res.json({
      success: true,
      data: {
        theaters,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error in getTheaters:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return 500 error for unexpected issues
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching theaters',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};



/**
 * Create a new theater
 */
export const createTheater = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Creating theater with data:', JSON.stringify(req.body, null, 2));
    console.log('User making request:', req.user ? { id: req.user.id, email: req.user.email, role: req.user.role } : 'No user data');
    
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      console.error('❌ No authenticated user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create theater'
      });
    }
    
    const {
      name,
      nameNe,
      city,
      area,
      address,
      phone,
      email,
      description,
      amenities,
      screenCount = 3, // Default to 3 screens for new theaters
      seatsPerScreen = 200 // Default seats per screen
    } = req.body;

    // Validate required fields
    if (!name || !city || !area || !address) {
      console.log('Validation failed - missing required fields:', { name: !!name, city: !!city, area: !!area, address: !!address });
      return res.status(400).json({
        success: false,
        message: 'Name, city, area, and address are required'
      });
    }

    console.log('Validation passed, proceeding with theater creation...');

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful for theater creation');
    } catch (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed. Please try again.',
        error: 'Unable to connect to database'
      });
    }

    // Create theater first
    console.log('Creating theater record...');
    const theater = await prisma.theater.create({
      data: {
        name,
        nameNe: nameNe || name,
        city,
        area,
        address,
        phone,
        email,
        description,
        amenities: amenities || [],
        ownerId: req.user?.id
      }
    });
    console.log('✅ Theater created:', theater.id);

    // Create screens and seat categories in smaller transactions
    console.log(`Creating ${screenCount} screens with ${seatsPerScreen} seats each...`);
    const screens: any[] = [];
    
    for (let i = 1; i <= screenCount; i++) {
      console.log(`Creating screen ${i}/${screenCount}...`);
      
      // Create screen with categories in one transaction
      const screenResult = await prisma.$transaction(async (tx) => {
        const screen = await tx.screen.create({
          data: {
            theaterId: theater.id,
            screenNumber: i,
            name: `Screen ${i}`,
            capacity: seatsPerScreen,
            screenType: '2D',
            layoutConfig: {
              rows: Math.ceil(seatsPerScreen / 15), // Assume 15 seats per row
              seatsPerRow: 15,
              totalSeats: seatsPerScreen
            }
          }
        });
        console.log(`✅ Screen ${i} created:`, screen.id);

        // Create seat categories for this screen
        const premiumCategory = await tx.seatCategory.create({
          data: {
            screenId: screen.id,
            categoryId: `premium_${screen.id}`,
            name: 'Premium',
            nameNe: 'प्रिमियम',
            price: 800,
            color: '#FFD700',
            features: ['Extra Comfort', 'Premium View'],
            rowMapping: ['A', 'B']
          }
        });

        const standardCategory = await tx.seatCategory.create({
          data: {
            screenId: screen.id,
            categoryId: `standard_${screen.id}`,
            name: 'Standard',
            nameNe: 'मानक',
            price: 600,
            color: '#4CAF50',
            features: ['Comfortable', 'Good View'],
            rowMapping: ['C', 'D', 'E', 'F', 'G', 'H']
          }
        });

        const economyCategory = await tx.seatCategory.create({
          data: {
            screenId: screen.id,
            categoryId: `economy_${screen.id}`,
            name: 'Economy',
            nameNe: 'अर्थव्यवस्था',
            price: 400,
            color: '#2196F3',
            features: ['Budget Friendly'],
            rowMapping: ['I', 'J', 'K', 'L']
          }
        });

        return { screen, categories: { premiumCategory, standardCategory, economyCategory } };
      });

      // Create seats in batches to avoid transaction timeout
      console.log(`Creating seats for screen ${i}...`);
      const seats: Prisma.SeatCreateManyInput[] = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      
      for (let rowIndex = 0; rowIndex < rows.length && rowIndex < Math.ceil(seatsPerScreen / 15); rowIndex++) {
        const row = rows[rowIndex];
        const seatsInRow = Math.min(15, seatsPerScreen - (rowIndex * 15));
        
        for (let seatNum = 1; seatNum <= seatsInRow; seatNum++) {
          let categoryId = screenResult.categories.standardCategory.id;
          let price = 600;

          // Assign categories based on row - Back rows have best view (Premium), front rows are closest to screen (Economy)
          if (rowIndex >= Math.ceil(seatsPerScreen / 15) - 4) {
            // Back rows (I, J, K, L) - Best view, Premium pricing
            categoryId = screenResult.categories.premiumCategory.id;
            price = 800;
          } else if (row === 'A' || row === 'B') {
            // Front rows (A, B) - Closest to screen, Economy pricing
            categoryId = screenResult.categories.economyCategory.id;
            price = 400;
          }

          seats.push({
            screenId: screenResult.screen.id,
            categoryId,
            seatNumber: `${row}${seatNum.toString().padStart(2, '0')}`,
            row,
            column: seatNum,
            price,
            status: SeatStatus.AVAILABLE
          });
        }
      }

      // Insert seats in batches of 500 to avoid transaction timeout
      if (seats.length > 0) {
        const batchSize = 500;
        for (let batchIndex = 0; batchIndex < seats.length; batchIndex += batchSize) {
          const batch = seats.slice(batchIndex, batchIndex + batchSize);
          try {
            await prisma.seat.createMany({
              data: batch
            });
            console.log(`✅ Created batch ${Math.floor(batchIndex / batchSize) + 1} with ${batch.length} seats for screen ${i}`);
          } catch (seatError) {
            console.error(`❌ Failed to create seat batch ${Math.floor(batchIndex / batchSize) + 1} for screen ${i}:`, seatError);
            throw new Error(`Failed to create seats for screen ${i}: ${seatError instanceof Error ? seatError.message : 'Unknown error'}`);
          }
        }
      } else {
        console.warn(`⚠️ No seats generated for screen ${i}`);
      }

      screens.push(screenResult.screen);
    }

    const result = { theater, screens };

    console.log('🎉 Theater creation completed successfully:', {
      theaterId: result.theater.id,
      theaterName: result.theater.name,
      screensCount: result.screens.length
    });

    return res.status(201).json({
      success: true,
      message: `Theater created successfully with ${result.screens.length} screens and seats`,
      data: { theater: result.theater, screens: result.screens }
    });

  } catch (error) {
    console.error('❌ Error creating theater:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check for specific database errors
      if (error.message.includes('Unique constraint')) {
        return res.status(400).json({
          success: false,
          message: 'A theater with similar details already exists. Please check the name, city, or address.',
          error: 'Duplicate entry detected'
        });
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user or theater reference. Please try again.',
          error: 'Reference constraint violation'
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create theater. Please check the data and try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



/**
 * Update theater
 */
export const updateTheater = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const theater = await prisma.theater.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Theater updated successfully',
      data: { theater }
    });

  } catch (error) {
    console.error('Error updating theater:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



/**
 * Get all movies with pagination
 */
export const getMovies = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              showtimes: true
            }
          }
        }
      }),
      prisma.movie.count()
    ]);

    res.json({
      success: true,
      data: {
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



/**
 * Create a new movie
 */
export const createMovie = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      titleNe,
      description,
      descriptionNe,
      genre,
      duration,
      language,
      rating,
      releaseDate,
      endDate,
      posterUrl,
      trailerUrl,
      imdbRating,
      isTrending
    } = req.body;

    if (!title || !description || !genre || !duration || !language || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, genre, duration, language, and rating are required'
      });
    }

    // Validate and parse release date
    let parsedReleaseDate: Date;
    try {
      parsedReleaseDate = new Date(releaseDate);
      if (Number.isNaN(parsedReleaseDate.getTime())) {
        throw new TypeError('Invalid release date');
      }
    } catch (error) {
      console.error('Release date parsing error:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid release date format'
      });
    }

    // Prepare movie data
    const movieData: any = {
      title,
      titleNe: titleNe || title,
      description,
      descriptionNe: descriptionNe || description,
      genre: Array.isArray(genre) ? genre : [genre],
      duration: Number.parseInt(duration),
      language: Array.isArray(language) ? language : [language],
      rating,
      releaseDate: parsedReleaseDate,
      posterUrl,
      trailerUrl,
      imdbRating: imdbRating ? Number.parseFloat(imdbRating) : null,
      createdBy: req.user!.id,
      isTrending: isTrending === true || isTrending === 'true',
      isActive: true
    };

    // Only add endDate if it's provided and valid
    if (endDate && endDate.trim() !== '') {
      try {
        const parsedEndDate = new Date(endDate);
        if (!Number.isNaN(parsedEndDate.getTime())) {
          movieData.endDate = parsedEndDate;
        }
      } catch (dateError) {
        console.warn('Invalid endDate provided:', endDate, dateError instanceof Error ? dateError.message : '');
        // Skip endDate if it's invalid
      }
    }

    let movie;
    try {
      movie = await prisma.movie.create({
        data: movieData
      });
    } catch (dbError) {
      console.error('Database error creating movie:', dbError);
      
      // If it's a field-related error, try without endDate
      if (dbError instanceof Error && dbError.message.includes('endDate')) {
        console.log('Retrying without endDate field...');
        delete movieData.endDate;
        movie = await prisma.movie.create({
          data: movieData
        });
      } else {
        throw dbError;
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: { movie }
    });

  } catch (error) {
    console.error('Error creating movie:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



/**
 * Get all bookings with pagination and filters
 */
export const getBookings = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { status, paymentStatus } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.bookingStatus = status;
    }
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          showtime: {
            include: {
              movie: { select: { title: true, posterUrl: true } },
              screen: {
                include: {
                  theater: { select: { name: true, city: true } }
                }
              }
            }
          },
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.booking.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



/**
 * Get theaters with their screens and showtimes
 */
export const getTheaterDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const theater = await prisma.theater.findUnique({
      where: { id },
      include: {
        screens: {
          include: {
            categories: {
              include: {
                seats: true
              }
            },
            showtimes: {
              include: {
                movie: {
                  select: {
                    id: true,
                    title: true,
                    posterUrl: true
                  }
                }
              },
              orderBy: {
                showDate: 'asc'
              }
            }
          }
        }
      }
    });

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    return res.json({
      success: true,
      data: { theater }
    });

  } catch (error) {
    console.error('Error fetching theater details:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



/**
 * Create showtime for a movie
 */
export const createShowtime = async (req: AuthRequest, res: Response) => {
  try {
    const {
      movieId,
      screenId,
      showDate,
      showTime,
      price,
      language
    } = req.body;

    if (!movieId || !screenId || !showDate || !showTime || !price) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID, Screen ID, show date, show time, and price are required'
      });
    }

    // Get screen capacity
    const screen = await prisma.screen.findUnique({
      where: { id: screenId },
      select: { capacity: true }
    });

    if (!screen) {
      return res.status(404).json({
        success: false,
        message: 'Screen not found'
      });
    }

    // Get movie duration for conflict checking
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { duration: true, title: true }
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Parse showtime hours and minutes
    const [showHours, showMinutes] = showTime.split(':').map(Number);
    const newShowStartMinutes = showHours * 60 + showMinutes;
    const newShowEndMinutes = newShowStartMinutes + movie.duration + 30; // 30 min buffer

    // Get all active showtimes for this screen on this date
    const existingShowtimes = await prisma.showtime.findMany({
      where: {
        screenId,
        showDate: new Date(showDate),
        isActive: true
      },
      include: {
        movie: {
          select: { title: true, duration: true }
        }
      }
    });

    // Check for time overlaps
    const conflictingShowtime = existingShowtimes.find(st => {
      const [existingHours, existingMinutes] = st.showTime.split(':').map(Number);
      const existingStartMinutes = existingHours * 60 + existingMinutes;
      const existingEndMinutes = existingStartMinutes + st.movie.duration + 30;

      // Check if times overlap
      return (newShowStartMinutes < existingEndMinutes && newShowEndMinutes > existingStartMinutes);
    });

    if (conflictingShowtime) {
      return res.status(409).json({
        success: false,
        message: `Screen conflict: This screen is already booked for "${conflictingShowtime.movie.title}" at ${conflictingShowtime.showTime}`,
        conflict: {
          existingShowtime: conflictingShowtime.id,
          movie: conflictingShowtime.movie.title,
          time: conflictingShowtime.showTime,
          duration: conflictingShowtime.movie.duration
        }
      });
    }

    const showtime = await prisma.showtime.create({
      data: {
        movieId,
        screenId,
        showDate: new Date(showDate),
        showTime,
        price: Number.parseFloat(price),
        language: language || 'English',
        totalSeats: screen.capacity,
        availableSeats: screen.capacity,
        isActive: true
      },
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
    });

    return res.status(201).json({
      success: true,
      message: 'Showtime created successfully',
      data: { showtime }
    });

  } catch (error) {
    console.error('Error creating showtime:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



/**
 * Create a new event
 */
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      titleNe,
      description,
      descriptionNe,
      category,
      imageUrl,
      galleryImages,
      theaterId,
      venue,
      venueNe,
      location,
      locationNe,
      eventDate,
      endDate,
      priceMin,
      priceMax,
      totalSeats,
      availableSeats,
      isFeatured,
      tags,
      organizer,
      ageRestriction,
      termsAndConditions,
      termsAndConditionsNe
    } = req.body;

    if (!title || !description || !category || !venue || !location || !eventDate || !endDate || !totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, venue, location, event date, end date, and total seats are required'
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        titleNe: titleNe || title,
        description,
        descriptionNe: descriptionNe || description,
        category,
        imageUrl: imageUrl || '',
        galleryImages: galleryImages || [],
        theaterId: theaterId || null,
        venue,
        venueNe: venueNe || venue,
        location,
        locationNe: locationNe || location,
        eventDate: new Date(eventDate),
        endDate: new Date(endDate),
        priceMin: Number.parseFloat(priceMin) || 0,
        priceMax: Number.parseFloat(priceMax) || 0,
        totalSeats: Number.parseInt(totalSeats),
        availableSeats: Number.parseInt(availableSeats) || Number.parseInt(totalSeats),
        isFeatured: isFeatured || false,
        tags: tags || [],
        organizer,
        ageRestriction,
        termsAndConditions: termsAndConditions || null,
        termsAndConditionsNe: termsAndConditionsNe || null,
        createdBy: req.user!.id,
        isActive: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update movie trending status
 */
export const updateMovieTrending = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isTrending } = req.body;

    if (typeof isTrending !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isTrending must be a boolean value'
      });
    }

    const movie = await prisma.movie.update({
      where: { id },
      data: { isTrending }
    });

    return res.json({
      success: true,
      message: `Movie ${isTrending ? 'marked as trending' : 'removed from trending'}`,
      data: { movie }
    });

  } catch (error) {
    console.error('Error updating movie trending status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Manually trigger movie cleanup
 */
export const triggerMovieCleanupManual = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Admin triggered manual movie cleanup');
    
    const result = await triggerMovieCleanup();
    
    return res.json({
      success: result.success,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    console.error('Error in manual movie cleanup:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to trigger movie cleanup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get movie cleanup statistics
 */
export const getMovieCleanupStats = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getCleanupStats();
    
    return res.json(result);
    
  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get cleanup statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};