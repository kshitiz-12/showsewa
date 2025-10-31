import express from 'express';
import { getEvents, getEventById } from '../controllers/eventController';

const router = express.Router();

// Get all events with filters
router.get('/', getEvents);
router.get('/:id', getEventById);

export default router;
