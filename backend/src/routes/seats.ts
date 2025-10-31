import express from 'express';
import {
  getSeatsForShowtime,
  holdSeats,
  releaseSeatHolds,
} from '../controllers/seatController';

const router = express.Router();

// Get seats for a specific showtime
router.get('/showtime/:showtimeId', getSeatsForShowtime);

// Hold seats temporarily
router.post('/hold', holdSeats);

// Release seat holds
router.delete('/hold', releaseSeatHolds);

export default router;
