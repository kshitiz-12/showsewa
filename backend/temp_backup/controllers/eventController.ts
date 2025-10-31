import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Event from '../models/Event';
import { ApiResponse, AuthRequest } from '../types';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const featured = req.query.featured as string;
    const search = req.query.search as string;

    // Build query - only show active events that haven't ended
    const query: any = { 
      is_active: true,
      status: { $in: ['upcoming', 'ongoing'] }
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (featured === 'true') {
      query.is_featured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { title_ne: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { venue_ne: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Event.countDocuments(query);

    // Get events
    const events = await Event.find(query)
      .populate('created_by', 'name email')
      .sort({ event_date: 1 })
      .skip(skip)
      .limit(limit);

    const response: ApiResponse = {
      success: true,
      message: 'Events retrieved successfully',
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('created_by', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Event retrieved successfully',
      data: event,
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array(),
      });
    }

    const eventData = {
      ...req.body,
      created_by: req.user!._id,
    };

    const event = await Event.create(eventData);

    const response: ApiResponse = {
      success: true,
      message: 'Event created successfully',
      data: event,
    };

    res.status(201).json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array(),
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Event updated successfully',
      data: event,
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Event deleted successfully',
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
