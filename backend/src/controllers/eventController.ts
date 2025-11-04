import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

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
    // Get user ID from token if available (optional)
    const userId = (req as any).user?.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event || event.isActive === false) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get interest count and check if user is interested (if logged in)
    const [interestCount, userInterest] = await Promise.all([
      prisma.eventInterest.count({ where: { eventId: id } }),
      userId ? prisma.eventInterest.findUnique({
        where: { userId_eventId: { userId, eventId: id } }
      }) : null
    ]);

    return res.json({ 
      success: true, 
      data: { 
        event,
        interestCount,
        isInterested: !!userInterest
      } 
    });
  } catch (error) {
    console.error('Error fetching event by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Toggle user interest in an event
 */
export const toggleEventInterest = async (req: AuthRequest, res: Response) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user already expressed interest
    const existingInterest = await prisma.eventInterest.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (existingInterest) {
      // Remove interest
      await prisma.eventInterest.delete({
        where: {
          userId_eventId: { userId, eventId }
        }
      });

      const newCount = await prisma.eventInterest.count({
        where: { eventId }
      });

      return res.json({
        success: true,
        message: 'Interest removed',
        data: {
          isInterested: false,
          interestCount: newCount
        }
      });
    } else {
      // Add interest
      await prisma.eventInterest.create({
        data: {
          userId,
          eventId
        }
      });

      const newCount = await prisma.eventInterest.count({
        where: { eventId }
      });

      return res.json({
        success: true,
        message: 'Interest added',
        data: {
          isInterested: true,
          interestCount: newCount
        }
      });
    }
  } catch (error) {
    console.error('Error toggling event interest:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
