import express from 'express';
import {
  getMovies,
  getMovieById,
  getTrendingMovies
} from '../controllers/movieController';

const router = express.Router();

// Get all movies with filters
router.get('/', getMovies);

// Get trending movies
router.get('/trending', getTrendingMovies);

// Get single movie by ID
router.get('/:id', getMovieById);

export default router;
