import express from 'express';
import {
  getUserLoyaltyInfo,
  redeemPoints,
  getLeaderboard
} from '../controllers/loyaltyController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user's loyalty info (authenticated)
router.get('/my-points', authenticateToken, getUserLoyaltyInfo);

// Redeem points (authenticated)
router.post('/redeem', authenticateToken, redeemPoints);

// Get leaderboard (public)
router.get('/leaderboard', getLeaderboard);

export default router;
