import cron from 'node-cron';
import prisma from '../lib/prisma';
import { emailService } from './emailService';

interface ReminderData {
  id: string;
  customerName: string;
  customerEmail: string;
  bookingReference: string;
  movieTitle: string;
  theaterName: string;
  showDate: Date;
  showTime: string;
  seats: string[];
  totalAmount: number;
  reminderHours: number;
}

export class BookingReminderService {
  
  /**
   * Send reminder emails for upcoming bookings
   * Runs every hour to check for bookings happening in the next 24, 6, and 1 hours
   */
  async sendUpcomingReminders(): Promise<void> {
    try {
      const now = new Date();
      
      // Reminders to send: 24 hours, 6 hours, and 1 hour before showtime
      const reminderIntervals = [24, 6, 1];
      
      for (const hours of reminderIntervals) {
        const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
        const timeWindow = new Date(futureTime.getTime() + 60 * 60 * 1000); // 1 hour window
        
        const upcomingBookings = await this.getUpcomingBookings(
          futureTime, 
          timeWindow, 
          hours
        );
        
        for (const booking of upcomingBookings) {
          await this.sendReminderEmail(booking);
        }
      }
      
      console.log(`📧 Reminder check completed for ${reminderIntervals.join(', ')} hour warnings`);
    } catch (error) {
      console.error('❌ Error in booking reminder service:', error);
    }
  }
  
  private async getUpcomingBookings(
    startTime: Date, 
    endTime: Date, 
    reminderHours: number
  ): Promise<ReminderData[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        bookingStatus: 'CONFIRMED',
        showtime: {
          showDate: {
            gte: startTime,
            lte: endTime
          }
        },
        // Only send reminders that haven't been sent for this time interval
        // Note: You might want to add a reminderSent field to track this
      },
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
    });
    
    return bookings
      .filter(booking => booking.showtime) // Ensure showtime exists
      .map(booking => ({
        id: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        bookingReference: booking.bookingReference,
        movieTitle: booking.showtime!.movie.title,
        theaterName: booking.showtime!.screen.theater.name,
        showDate: booking.showtime!.showDate,
        showTime: booking.showtime!.showTime,
        seats: booking.seats,
        totalAmount: booking.totalAmount,
        reminderHours
      } as ReminderData));
  }
  
  private async sendReminderEmail(data: ReminderData): Promise<void> {
    try {
      await emailService.sendBookingReminder({
        bookingReference: data.bookingReference,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        movieTitle: data.movieTitle,
        theaterName: data.theaterName,
        showDate: data.showDate.toLocaleDateString(),
        showTime: data.showTime,
        seats: data.seats,
        totalAmount: data.totalAmount,
        reminderHours: data.reminderHours
      });
      
      console.log(`📧 Sent ${data.reminderHours}h reminder for booking ${data.bookingReference}`);
    } catch (error) {
      console.error(`❌ Failed to send reminder for booking ${data.bookingReference}:`, error);
    }
  }
  
  /**
   * Initialize the reminder scheduler
   * Runs every hour to check for upcoming bookings
   */
  initializeScheduler(): void {
    console.log('⏰ Initializing Booking Reminder Scheduler...');
    
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
      console.log('⏰ Running booking reminder check...');
      await this.sendUpcomingReminders();
    });
    
    console.log('✅ Booking reminder scheduler initialized (runs every hour)');
  }
}

export const bookingReminderService = new BookingReminderService();
