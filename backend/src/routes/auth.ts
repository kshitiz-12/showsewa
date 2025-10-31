import express from 'express';
import {
  register,
  verifyOTP,
  login,
  getProfile,
  updateProfile,
  requestPasswordReset,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
