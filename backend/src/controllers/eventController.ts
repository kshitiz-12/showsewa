import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Get all events with pagination and filters
 */
export const getEvents = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { featured, category, search, city, incoming } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const whereClause: any = {
      isActive: true
    };

    // Date filtering
    if (incoming === 'true') {
      // Incoming: events that haven't started yet
      whereClause.eventDate = { gt: today };
    } else {
      // Upcoming or ongoing: either starts today or later, OR already started but not ended yet
      whereClause.OR = [
        { eventDate: { gte: today } },
        { endDate: { gte: today } }
      ];
    }

    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // City filtering
    if (city) {
      whereClause.location = {
        contains: city as string,
        mode: 'insensitive'
      };
    }

    let events: any[] = [];
    let total = 0;

    try {
      const orderBy: any = (featured === 'true')
        ? [{ isFeatured: 'desc' as const }, { eventDate: 'asc' as const }]
        : [{ eventDate: 'asc' as const }];

      [events, total] = await Promise.all([
        prisma.event.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy
        }),
        prisma.event.count({ where: whereClause })
      ]);
    } catch (dbError) {
      console.error('Database error in getEvents:', dbError);
      events = [];
      total = 0;
    }

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Return empty results instead of 500 error to prevent frontend crashes
    res.json({
      success: true,
      data: {
        events: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      },
      warning: 'Unable to fetch events at this time'
    });
  }
};

/**
 * Get single event by ID
 */
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event || event.isActive === false) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    return res.json({ success: true, data: { event } });
  } catch (error) {
    console.error('Error fetching event by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
