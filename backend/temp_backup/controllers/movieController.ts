import { Request, Response } from 'express';
import Movie from '../models/Movie';
import { ApiResponse, AuthRequest } from '../types';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const trending = req.query.trending as string;
    const search = req.query.search as string;

    const query: any = { is_active: true };

    if (trending === 'true') {
      query.is_trending = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { title_ne: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Movie.countDocuments(query);

    const movies = await Movie.find(query)
      .populate('created_by', 'name email')
      .sort({ release_date: -1 })
      .skip(skip)
      .limit(limit);

    const response: ApiResponse = {
      success: true,
      message: 'Movies retrieved successfully',
      data: movies,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMovie = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('created_by', 'name email');

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.status(200).json({ success: true, message: 'Movie retrieved successfully', data: movie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const createMovie = async (req: AuthRequest, res: Response) => {
  try {
    const movieData = { ...req.body, created_by: req.user!._id };
    const movie = await Movie.create(movieData);
    res.status(201).json({ success: true, message: 'Movie created successfully', data: movie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateMovie = async (req: AuthRequest, res: Response) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.status(200).json({ success: true, message: 'Movie updated successfully', data: movie });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteMovie = async (req: AuthRequest, res: Response) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.status(200).json({ success: true, message: 'Movie deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
