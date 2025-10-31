import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Get all movies with pagination and filters
 */
export const getMovies = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { isTrending, genre, language, search, city } = req.query;

    console.log('Fetching movies with filters:', { page, limit, isTrending, genre, language, search, city });

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (connectionError) {
      console.error('Database connection failed:', connectionError);
      return res.json({
        success: true,
        data: {
          movies: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        },
        warning: 'Database connection issue - returning empty results'
      });
    }

    const whereClause: any = {
      isActive: true,
      // Only include movies that haven't ended
      OR: [
        { endDate: null }, // No end date set
        { endDate: { gte: new Date() } } // End date is today or later
      ]
    };

    if (isTrending === 'true') {
      whereClause.isTrending = true;
    }

    if (genre) {
      whereClause.genre = {
        has: genre as string
      };
    }

    if (language) {
      whereClause.language = {
        has: language as string
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    let movies: any[] = [];
    let total = 0;

    try {
      // Normalize date to start of today for proper date comparison (ignore time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // If city filter is provided, get movies that have showtimes in that city
      if (city) {
        movies = await prisma.movie.findMany({
          where: {
            ...whereClause,
            showtimes: {
              some: {
                screen: {
                  theater: {
                    city: {
                      equals: city as string,
                      mode: 'insensitive'
                    }
                  }
                },
                isActive: true,
                showDate: { gte: today } // Only showtimes from today onwards (date only, not time)
              }
            }
          },
          skip,
          take: limit,
          orderBy: [
            { isTrending: 'desc' },
            { releaseDate: 'desc' }
          ],
          include: {
            showtimes: {
              where: {
                screen: {
                  theater: {
                    city: {
                      equals: city as string,
                      mode: 'insensitive'
                    }
                  }
                },
                isActive: true,
                showDate: { gte: today } // Filter to upcoming showtimes only
              },
              include: {
                screen: {
                  include: {
                    theater: true
                  }
                }
              }
            }
          }
        });

        total = await prisma.movie.count({
          where: {
            ...whereClause,
            showtimes: {
              some: {
                screen: {
                  theater: {
                    city: {
                      equals: city as string,
                      mode: 'insensitive'
                    }
                  }
                },
                isActive: true,
                showDate: { gte: today } // Only count movies with upcoming showtimes
              }
            }
          }
        });
      } else {
        // Regular query without city filter - but still ensure movies have upcoming showtimes
        movies = await prisma.movie.findMany({
          where: {
            ...whereClause,
            showtimes: {
              some: {
                isActive: true,
                showDate: { gte: today } // Only movies with upcoming showtimes
              }
            }
          },
          skip,
          take: limit,
          orderBy: [
            { isTrending: 'desc' },
            { releaseDate: 'desc' }
          ],
          select: {
            id: true,
            title: true,
            titleNe: true,
            description: true,
            descriptionNe: true,
            posterUrl: true,
            genre: true,
            duration: true,
            language: true,
            rating: true,
            releaseDate: true,
            trailerUrl: true,
            isTrending: true,
            isActive: true,
            imdbRating: true,
          }
        });

        total = await prisma.movie.count({ 
          where: {
            ...whereClause,
            showtimes: {
              some: {
                isActive: true,
                showDate: { gte: today }
              }
            }
          }
        });
      }

      console.log('Successfully fetched movies:', movies.length, 'Total:', total);
    } catch (dbError) {
      console.error('Database error in getMovies:', dbError);
      // If there's a database error, return empty results instead of crashing
      movies = [];
      total = 0;
    }

    console.log('Found movies:', movies.length, 'Total:', total);

    return res.json({
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
    
    // Return empty array instead of 500 error to prevent frontend crashes
    return res.json({
      success: true,
      data: {
        movies: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      },
      warning: 'Unable to fetch movies at this time'
    });
  }
};

/**
 * Get single movie by ID
 */
export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { city } = req.query;

    console.log('Fetching movie by ID:', id, 'with city filter:', city);

    // Build the where clause for showtimes based on city
    const showtimeWhere: any = {
      isActive: true
    };

    if (city) {
      showtimeWhere.screen = {
        theater: {
          city: {
            equals: city as string,
            mode: 'insensitive'
          }
        }
      };
    }

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          where: showtimeWhere,
          include: {
            screen: {
              include: {
                theater: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                    area: true,
                    amenities: true
                  }
                }
              }
            }
          },
          orderBy: [
            { showDate: 'asc' },
            { showTime: 'asc' }
          ]
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Filter showtimes to only include active and future ones, log debugging info
    const now = new Date();
    const allShowtimes = movie.showtimes || [];
    const validShowtimes = allShowtimes.filter(showtime => {
      // Combine showDate and showTime to get the exact datetime
      const showDate = new Date(showtime.showDate);
      const [hours, minutes] = showtime.showTime.split(':').map(Number);
      
      // Set the time part of the showDate
      const showDateTime = new Date(showDate);
      showDateTime.setHours(hours, minutes, 0, 0);
      
      const isFuture = showDateTime > now;
      const isActive = showtime.isActive;
      return isFuture && isActive;
    });

    console.log(`Movie ${movie.title} (ID: ${movie.id}) - Total showtimes: ${allShowtimes.length}, Valid showtimes: ${validShowtimes.length}`);
    
    if (allShowtimes.length === 0) {
      console.log(`⚠️ No showtimes found for movie "${movie.title}". Need to create showtimes via admin dashboard.`);
    } else if (validShowtimes.length === 0) {
      console.log(`⚠️ Movie "${movie.title}" has ${allShowtimes.length} showtimes but none are active and in the future:`);
      for (const s of allShowtimes.slice(0, 3)) {
        const showDate = new Date(s.showDate);
        const [hours, minutes] = s.showTime.split(':').map(Number);
        const showDateTime = new Date(showDate);
        showDateTime.setHours(hours, minutes, 0, 0);
        console.log(`  - ${s.showDate} ${s.showTime}: Active=${s.isActive}, ShowDateTime=${showDateTime.toLocaleString()}, Future=${showDateTime > now}, Past=${showDateTime <= now}`);
      }
    } else {
      console.log(`✅ Found ${validShowtimes.length} valid showtimes for "${movie.title}"`);
    }

    // Update movie object with filtered showtimes
    const movieWithFilteredShowtimes = {
      ...movie,
      showtimes: validShowtimes
    };

    return res.json({
      success: true,
      data: { movie: movieWithFilteredShowtimes }
    });

  } catch (error) {
    console.error('Error fetching movie:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get trending movies
 */
export const getTrendingMovies = async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string) || 4;
    const { city } = req.query;

    console.log('Fetching trending movies with limit:', limit, 'city:', city);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const whereClause: any = {
      isTrending: true,
      isActive: true,
      // Only include movies that haven't ended
      OR: [
        { endDate: null }, // No end date set
        { endDate: { gte: today } } // End date is today or later
      ]
    };

    // If city filter is provided, ensure movies have showtimes in that city
    if (city) {
      whereClause.showtimes = {
        some: {
          screen: {
            theater: {
              city: {
                equals: city as string,
                mode: 'insensitive'
              }
            }
          },
          isActive: true,
          showDate: { gte: today } // Only upcoming showtimes
        }
      };
    } else {
      // Even without city filter, ensure movies have upcoming showtimes
      whereClause.showtimes = {
        some: {
          isActive: true,
          showDate: { gte: today }
        }
      };
    }

    const movies = await prisma.movie.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        releaseDate: 'desc'
      },
      select: {
        id: true,
        title: true,
        titleNe: true,
        description: true,
        descriptionNe: true,
        posterUrl: true,
        genre: true,
        duration: true,
        language: true,
        rating: true,
        releaseDate: true,
        endDate: true,
        trailerUrl: true,
        isTrending: true,
        isActive: true,
        imdbRating: true
      }
    });

    console.log('Found trending movies:', movies.length);

    return res.json({
      success: true,
      data: { movies }
    });

  } catch (error) {
    console.error('Error fetching trending movies:', error);
    
    // Return empty array instead of 500 error to prevent frontend crashes
    return res.json({
      success: true,
      data: { movies: [] },
      warning: 'Unable to fetch trending movies at this time'
    });
  }
};
