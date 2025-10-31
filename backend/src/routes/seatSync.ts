import express from 'express';
import {
  bulkUpdateSeats,
  getRealTimeSeatAvailability,
  blockSeats
} from '../controllers/seatSyncController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public route for seat availability (used by booking systems)
router.get('/availability/:showtimeId', getRealTimeSeatAvailability);

// Protected routes for theater management
router.use(authenticateToken);

// Bulk seat updates from POS/other systems
router.post('/bulk-update', bulkUpdateSeats);

// Block seats for maintenance, VIP, etc.
router.post('/block', blockSeats);

export default router;
