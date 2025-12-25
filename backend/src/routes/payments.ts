import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  getPaymentStatus
} from '../controllers/paymentController';

const router = express.Router();

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate payment for a booking
 * @access  Public (or Protected if needed)
 */
router.post('/initiate', initiatePayment);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment after gateway callback
 * @access  Public (called by payment gateway)
 */
router.post('/verify', verifyPayment);

/**
 * @route   GET /api/payments/status/:bookingId
 * @desc    Get payment status for a booking
 * @access  Public
 */
router.get('/status/:bookingId', getPaymentStatus);

export default router;
