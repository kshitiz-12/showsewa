import { Request, Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import Event from '../models/Event';
import Movie from '../models/Movie';
import { ApiResponse } from '../types';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { payment_status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);

    const stats = {
      totalUsers,
      totalEvents,
      totalMovies,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
    };

    res.status(200).json({ success: true, message: 'Dashboard stats retrieved successfully', data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('user_id', 'name email')
      .populate('item_id')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, message: 'Bookings retrieved successfully', data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Users retrieved successfully', data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().populate('created_by', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Events retrieved successfully', data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await Movie.find().populate('created_by', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Movies retrieved successfully', data: movies });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
