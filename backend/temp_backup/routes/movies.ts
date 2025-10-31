import express from 'express';
import { getMovies, getMovie, createMovie, updateMovie, deleteMovie } from '../controllers/movieController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Routes
router.get('/', getMovies);
router.get('/:id', getMovie);
router.post('/', authenticate, authorize('admin'), createMovie);
router.put('/:id', authenticate, authorize('admin'), updateMovie);
router.delete('/:id', authenticate, authorize('admin'), deleteMovie);

export default router;
