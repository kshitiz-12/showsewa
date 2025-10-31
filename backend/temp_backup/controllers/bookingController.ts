import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Event from '../models/Event';
import Showtime from '../models/Showtime';
import { ApiResponse, AuthRequest } from '../types';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const bookingData = { ...req.body, user_id: req.user!._id };
    const booking = await Booking.create(bookingData);
    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ user_id: req.user!._id })
      .populate('item_id')
      .populate('showtime_id')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, message: 'Bookings retrieved successfully', data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('item_id')
      .populate('showtime_id');
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, message: 'Booking retrieved successfully', data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, message: 'Booking status updated successfully', data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
