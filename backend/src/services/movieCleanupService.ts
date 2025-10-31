import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

/**
 * Automatically deactivate movies that have passed their end date
 * Runs daily at 2 AM
 */
export const scheduleMovieCleanup = () => {
  // Run every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Starting daily movie cleanup...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find movies that have passed their end date
      const expiredMovies = await prisma.movie.findMany({
        where: {
          isActive: true,
          endDate: {
            lt: today // Less than today (past end date)
          }
        },
        select: {
          id: true,
          title: true,
          endDate: true
        }
      });

      if (expiredMovies.length === 0) {
        console.log('✅ No expired movies found');
        return;
      }

      console.log(`📅 Found ${expiredMovies.length} expired movies:`);
      for (const movie of expiredMovies) {
        console.log(`  - ${movie.title} (ended: ${movie.endDate?.toDateString()})`);
      }

      // Deactivate expired movies
      const result = await prisma.movie.updateMany({
        where: {
          id: {
            in: expiredMovies.map(movie => movie.id)
          }
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Successfully deactivated ${result.count} expired movies`);

      // Also deactivate related showtimes
      const showtimeResult = await prisma.showtime.updateMany({
        where: {
          movieId: {
            in: expiredMovies.map(movie => movie.id)
          },
          isActive: true
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Successfully deactivated ${showtimeResult.count} related showtimes`);

      // Log cleanup completion
      console.log('🎬 Daily movie cleanup completed successfully');

    } catch (error) {
      console.error('❌ Error during movie cleanup:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kathmandu" // Nepal timezone
  });

  console.log('⏰ Movie cleanup scheduler initialized (runs daily at 2 AM)');
};

/**
 * Manually trigger movie cleanup (for testing or immediate cleanup)
 */
export const triggerMovieCleanup = async () => {
  console.log('🔄 Manually triggering movie cleanup...');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find movies that have passed their end date
    const expiredMovies = await prisma.movie.findMany({
      where: {
        isActive: true,
        endDate: {
          lt: today
        }
      },
      select: {
        id: true,
        title: true,
        endDate: true
      }
    });

    if (expiredMovies.length === 0) {
      console.log('✅ No expired movies found');
      return {
        success: true,
        message: 'No expired movies found',
        expiredCount: 0,
        deactivatedCount: 0
      };
    }

    console.log(`📅 Found ${expiredMovies.length} expired movies`);

    // Deactivate expired movies
    const movieResult = await prisma.movie.updateMany({
      where: {
        id: {
          in: expiredMovies.map(movie => movie.id)
        }
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Deactivate related showtimes
    const showtimeResult = await prisma.showtime.updateMany({
      where: {
        movieId: {
          in: expiredMovies.map(movie => movie.id)
        },
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Cleanup completed: ${movieResult.count} movies, ${showtimeResult.count} showtimes deactivated`);

    return {
      success: true,
      message: 'Movie cleanup completed successfully',
      expiredCount: expiredMovies.length,
      deactivatedCount: movieResult.count,
      showtimeCount: showtimeResult.count,
      expiredMovies: expiredMovies.map(movie => ({
        title: movie.title,
        endDate: movie.endDate
      }))
    };

  } catch (error) {
    console.error('❌ Error during manual movie cleanup:', error);
    return {
      success: false,
      message: 'Movie cleanup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get cleanup statistics
 */
export const getCleanupStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Some environments have issues with array-transaction; fall back to independent queries
    // Attempt a lightweight connectivity check first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      console.warn('Cleanup stats: connection check failed, proceeding with guarded queries', e);
    }

    const oneDayAhead = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const oneWeekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const results = { active: 0, expired: 0, today: 0, week: 0 };
    let warnings: string[] = [];

    // Active movies
    try {
      results.active = await prisma.movie.count({ where: { isActive: true } });
    } catch (e: any) {
      console.error('Cleanup stats: active count failed', e);
      warnings.push('activeMovies');
    }

    // Expired movies (past end date but still active)
    try {
      results.expired = await prisma.movie.count({
        where: { isActive: true, endDate: { lt: today } }
      });
    } catch (e: any) {
      console.error('Cleanup stats: expired count failed', e);
      warnings.push('expiredMovies');
    }

    // Ending today
    try {
      results.today = await prisma.movie.count({
        where: { isActive: true, endDate: { gte: today, lt: oneDayAhead } }
      });
    } catch (e: any) {
      console.error('Cleanup stats: ending today count failed', e);
      warnings.push('endingToday');
    }

    // Ending this week
    try {
      results.week = await prisma.movie.count({
        where: { isActive: true, endDate: { gte: today, lt: oneWeekAhead } }
      });
    } catch (e: any) {
      console.error('Cleanup stats: ending this week count failed', e);
      warnings.push('endingThisWeek');
    }

    return {
      success: true,
      data: {
        activeMovies: results.active,
        expiredMovies: results.expired,
        endingToday: results.today,
        endingThisWeek: results.week
      },
      ...(warnings.length > 0 ? { warning: `Partial stats unavailable: ${warnings.join(', ')}` } : {})
    };

  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    // Do not fail hard; return zeros to keep UI functional
    return {
      success: true,
      data: {
        activeMovies: 0,
        expiredMovies: 0,
        endingToday: 0,
        endingThisWeek: 0
      },
      warning: 'Failed to compute cleanup statistics; showing zeros'
    };
  }
};
