import express from 'express';
import {
  getDashboardStats,
  getTheaters,
  createTheater,
  updateTheater,
  getMovies,
  createMovie,
  updateMovieTrending,
  getBookings,
  getTheaterDetails,
  createShowtime,
  createEvent,
  triggerMovieCleanupManual,
  getMovieCleanupStats
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Theater Management
router.get('/theaters', getTheaters);
router.post('/theaters', createTheater);
router.get('/theaters/:id', getTheaterDetails);
router.put('/theaters/:id', updateTheater);

// Movie Management
router.get('/movies', getMovies);
router.post('/movies', createMovie);
router.patch('/movies/:id/trending', updateMovieTrending);

// Event Management
router.post('/events', createEvent);

// Showtime Management
router.post('/showtimes', createShowtime);

// Booking Management
router.get('/bookings', getBookings);

// Movie Cleanup Management
router.post('/movies/cleanup', triggerMovieCleanupManual);
router.get('/movies/cleanup/stats', getMovieCleanupStats);

export default router;
