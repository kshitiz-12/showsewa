import express from 'express';
import { getDashboardStats, getBookings, getUsers, getEvents, getMovies } from '../controllers/adminController';
import { triggerScheduler, getEventStats } from '../controllers/schedulerController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Routes
router.get('/dashboard', getDashboardStats);
router.get('/bookings', getBookings);
router.get('/users', getUsers);
router.get('/events', getEvents);
router.get('/movies', getMovies);

// Scheduler routes
router.post('/scheduler/trigger', triggerScheduler);
router.get('/scheduler/stats', getEventStats);

export default router;
