import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { initScheduler } from './services/eventScheduler';
import { bookingReminderService } from './services/bookingReminderService';
import { scheduleMovieCleanup } from './services/movieCleanupService';
import prisma from './lib/prisma';

// Import routes
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import seatRoutes from './routes/seats';
import seatSyncRoutes from './routes/seatSync';
import bookingRoutes from './routes/bookings';
import movieRoutes from './routes/movies';
import eventRoutes from './routes/events';
import eventTicketRoutes from './routes/eventsTickets';
import reviewRoutes from './routes/reviews';
import loyaltyRoutes from './routes/loyalty';
import inventoryRoutes from './routes/inventory';
import testingRoutes from './routes/testing';
import qrRoutes from './routes/qr';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize event scheduler
initScheduler();

// Initialize booking reminder service
bookingReminderService.initializeScheduler();

// Initialize movie cleanup scheduler
scheduleMovieCleanup();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5174',
      'http://localhost:5173', // Vite default port
      'http://localhost:3000', // Alternative React dev port
      'https://showsewa.vercel.app', // Production frontend
    ];
    
    // Check if origin is in allowed list or is a Vercel preview deployment
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // For development, allow all origins
    }
  },
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/seat-sync', seatSyncRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-tickets', eventTicketRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/testing', testingRoutes);
app.use('/api/qr', qrRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ShowSewa API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Demo endpoint to get first showtime ID
app.get('/api/demo/showtime', async (req, res) => {
  try {
    const showtime = await prisma.showtime.findFirst({
      include: {
        movie: true,
        screen: {
          include: {
            theater: true
          }
        }
      }
    });

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'No showtimes found'
      });
    }

    return res.json({
      success: true,
      data: {
        showtimeId: showtime.id,
        showtime: showtime
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching showtime',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server with error handling
const server = app.listen(PORT, async () => {
  console.log(`🚀 ShowSewa Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});

// Handle server errors
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use.`);
    console.log('💡 Try running: netstat -ano | findstr :5000');
    console.log('💡 Then kill the process: taskkill /PID <PID> /F');
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;
