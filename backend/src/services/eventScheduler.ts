import * as cron from 'node-cron';
import prisma from '../lib/prisma';

/**
 * Event Lifecycle Scheduler
 * Automatically updates event statuses based on dates
 * Runs every hour
 */

// Update event statuses based on current date
export const updateEventStatuses = async (): Promise<void> => {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (connectionError) {
      console.warn('⚠️ Database connection failed, skipping event status update:', connectionError);
      return;
    }

    const now = new Date();
    
    // 1. Mark events as 'ongoing' if eventDate has passed but endDate hasn't
    let ongoingResult = { count: 0 };
    try {
      ongoingResult = await prisma.event.updateMany({
      where: {
        eventDate: { lte: now },
        endDate: { gt: now },
        status: { not: 'CANCELLED' },
      },
      data: {
        status: 'ONGOING',
      },
      });
    } catch (ongoingError) {
      console.warn('⚠️ Failed to update ongoing events:', ongoingError);
    }

    // 2. Mark events as 'completed' and hide them if endDate has passed
    let completedResult = { count: 0 };
    try {
      completedResult = await prisma.event.updateMany({
        where: {
          endDate: { lte: now },
          status: { not: 'CANCELLED' },
        },
        data: {
          status: 'COMPLETED',
          isActive: false,
          isFeatured: false,
        },
      });
    } catch (completedError) {
      console.warn('⚠️ Failed to update completed events:', completedError);
    }

    // 3. Hide completed events from 7 days ago (archive)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let archivedResult = { count: 0 };
    try {
      archivedResult = await prisma.event.updateMany({
        where: {
          endDate: { lte: sevenDaysAgo },
          status: 'COMPLETED',
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    } catch (archivedError) {
      console.warn('⚠️ Failed to archive events:', archivedError);
    }

    console.log(`
      ✅ Event Status Update Complete:
      - Ongoing: ${ongoingResult.count} events
      - Completed: ${completedResult.count} events
      - Archived: ${archivedResult.count} events
    `);
  } catch (error) {
    console.error('❌ Error updating event statuses:', error);
  }
};

// Update movie statuses for old releases and end dates
export const updateMovieStatuses = async (): Promise<void> => {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (connectionError) {
      console.warn('⚠️ Database connection failed, skipping movie status update:', connectionError);
      return;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Remove trending flag from movies older than 30 days
    let trendingResult = { count: 0 };
    try {
      trendingResult = await prisma.movie.updateMany({
        where: {
          releaseDate: { lte: thirtyDaysAgo },
          isTrending: true,
        },
        data: {
          isTrending: false,
        },
      });
    } catch (trendingError) {
      console.warn('⚠️ Failed to update trending movies:', trendingError);
    }

    // 2. Deactivate movies where endDate has passed (if field exists)
    let endDateResult = { count: 0 };
    try {
      endDateResult = await prisma.movie.updateMany({
        where: {
          endDate: { lte: now },
          isActive: true,
        } as any,
        data: {
          isActive: false,
          isTrending: false,
        },
      });
    } catch (error) {
      console.warn('⚠️  endDate field not yet available in database, skipping endDate-based deactivation');
    }

    console.log(`
      ✅ Movie Status Update Complete:
      - Removed trending flag: ${trendingResult.count} movies
      - Deactivated (end date): ${endDateResult.count} movies
    `);
  } catch (error) {
    console.error('❌ Error updating movie statuses:', error);
  }
};

// Send reminders for upcoming events (24 hours before)
export const sendEventReminders = async (): Promise<void> => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Find events starting in 24 hours
    const upcomingEvents = await prisma.event.findMany({
      where: {
        eventDate: { gte: tomorrow, lte: dayAfterTomorrow },
        status: 'UPCOMING',
        isActive: true,
      },
    });

    if (upcomingEvents.length > 0) {
      console.log(`📧 Found ${upcomingEvents.length} events starting tomorrow`);
      // TODO: Send email reminders to users with bookings
      // You can implement email sending here
    }
  } catch (error) {
    console.error('❌ Error sending event reminders:', error);
  }
};

// Clean up expired seat holds
export const cleanupExpiredSeatHolds = async (): Promise<void> => {
  try {
    const result = await prisma.seatHold.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`🧹 Cleaned up ${result.count} expired seat holds`);
  } catch (error) {
    console.error('❌ Error cleaning up expired seat holds:', error);
  }
};

// Clean up old completed bookings data (optional)
export const cleanupOldData = async (): Promise<void> => {
  try {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Optionally archive or delete very old completed events
    const result = await prisma.event.updateMany({
      where: {
        endDate: { lte: ninetyDaysAgo },
        status: 'COMPLETED',
      },
      data: {
        isActive: false,
      },
    });

    console.log(`🗑️ Cleaned up ${result.count} old events`);
  } catch (error) {
    console.error('❌ Error cleaning up old data:', error);
  }
};

// Initialize all scheduled tasks
export const initScheduler = (): void => {
  console.log('🕐 Initializing Event Scheduler...');

  // Run every 5 minutes to clean up expired seat holds
  cron.schedule('*/5 * * * *', async () => {
    console.log('⏰ Running seat hold cleanup...');
    await cleanupExpiredSeatHolds();
  });

  // Run every hour to check event statuses
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running hourly event status update...');
    await updateEventStatuses();
    await updateMovieStatuses();
  });

  // Run daily at 9 AM to send reminders
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily event reminders...');
    await sendEventReminders();
  });

  // Run weekly on Sunday at 2 AM for cleanup
  cron.schedule('0 2 * * 0', async () => {
    console.log('⏰ Running weekly cleanup...');
    await cleanupOldData();
  });

  // Run immediately on startup
  updateEventStatuses();
  updateMovieStatuses();

  console.log('✅ Event Scheduler initialized successfully!');
  console.log('   - Every 5 minutes: Seat hold cleanup');
  console.log('   - Hourly: Status updates');
  console.log('   - Daily: Event reminders (9 AM)');
  console.log('   - Weekly: Cleanup (Sunday 2 AM)');
};

// Manual trigger function for testing
export const manualTrigger = async (): Promise<void> => {
  console.log('🔧 Manual trigger - Running all tasks...');
  await updateEventStatuses();
  await updateMovieStatuses();
  await sendEventReminders();
  await cleanupOldData();
  console.log('✅ Manual trigger complete!');
};
