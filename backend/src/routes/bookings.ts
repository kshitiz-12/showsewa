import express from 'express';
import {
  createBooking,
  getBookingByReference,
  updatePaymentStatus,
  getUserBookings,
  testEmail,
} from '../controllers/bookingController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Test email functionality
router.post('/test-email', testEmail);

// Create a new booking
router.post('/', createBooking);

// Get user's bookings (authenticated)
router.get('/my-bookings', authenticateToken, getUserBookings);

// Get booking by reference
router.get('/:reference', getBookingByReference);

// Update payment status
router.patch('/:bookingId/payment', updatePaymentStatus);

export default router;
