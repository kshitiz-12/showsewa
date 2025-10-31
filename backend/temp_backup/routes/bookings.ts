import express from 'express';
import { createBooking, getBookings, getBooking, updateBookingStatus } from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Routes
router.post('/', authenticate, createBooking);
router.get('/', authenticate, getBookings);
router.get('/:id', authenticate, getBooking);
router.put('/:id/status', authenticate, authorize('admin'), updateBookingStatus);

export default router;
