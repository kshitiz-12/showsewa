import { Request, Response } from 'express';
import { 
  updateEventStatuses, 
  updateMovieStatuses, 
  manualTrigger 
} from '../services/eventScheduler';
import Event from '../models/Event';
import { ApiResponse } from '../types';

// @desc    Manually trigger event status update
// @route   POST /api/admin/scheduler/trigger
// @access  Private/Admin
export const triggerScheduler = async (req: Request, res: Response) => {
  try {
    await manualTrigger();

    const response: ApiResponse = {
      success: true,
      message: 'Scheduler triggered successfully',
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

// @desc    Get event statistics
// @route   GET /api/admin/scheduler/stats
// @access  Private/Admin
export const getEventStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const stats = {
      upcoming: await Event.countDocuments({ status: 'upcoming', is_active: true }),
      ongoing: await Event.countDocuments({ status: 'ongoing', is_active: true }),
      completed: await Event.countDocuments({ status: 'completed' }),
      cancelled: await Event.countDocuments({ status: 'cancelled' }),
      total: await Event.countDocuments(),
      
      // Events ending today
      endingToday: await Event.countDocuments({
        end_date: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999)),
        },
        status: { $in: ['upcoming', 'ongoing'] },
      }),

      // Events starting today
      startingToday: await Event.countDocuments({
        event_date: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999)),
        },
        status: 'upcoming',
      }),
    };

    const response: ApiResponse = {
      success: true,
      message: 'Event statistics retrieved successfully',
      data: stats,
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
