import express from 'express';
import {
  getSeatInventory,
  reserveSeats,
  confirmBooking,
  cancelBooking,
  getTheaterChannels,
  updateTheaterChannels,
  syncInventory,
  getChannelBookings,
  getTheaterInventoryStatus
} from '../controllers/inventoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All inventory routes require authentication
router.use(authenticateToken);

// Seat inventory management
router.get('/showtime/:showtimeId', getSeatInventory);
router.post('/reserve', reserveSeats);
router.post('/confirm', confirmBooking);
router.post('/cancel', cancelBooking);

// Theater channel management
router.get('/theater/:theaterId/status', getTheaterInventoryStatus);
router.get('/theater/:theaterId/channels', getTheaterChannels);
router.put('/theater/:theaterId/channels', updateTheaterChannels);
router.post('/sync/:theaterId', syncInventory);

// Channel bookings (admin only)
router.get('/bookings/channel', requireAdmin, getChannelBookings);

export default router;
