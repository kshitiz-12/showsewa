import express from 'express';
import { getEvents, getEventById, toggleEventInterest } from '../controllers/eventController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all events with filters
router.get('/', getEvents);
router.get('/:id', getEventById);

// Toggle interest in an event (requires authentication)
router.post('/:id/interested', authenticateToken, toggleEventInterest);

export default router;
