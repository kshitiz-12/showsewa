import express from 'express';
import {
  getReviews,
  createReview,
  updateReview,
  markHelpful,
  deleteReview
} from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get reviews (public)
router.get('/', getReviews);

// Create review (authenticated)
router.post('/', authenticateToken, createReview);

// Update review (authenticated - own reviews only)
router.put('/:id', authenticateToken, updateReview);

// Mark review as helpful (authenticated)
router.post('/:id/helpful', authenticateToken, markHelpful);

// Delete review (authenticated - own reviews only)
router.delete('/:id', authenticateToken, deleteReview);

export default router;
