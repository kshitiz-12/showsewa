import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { addPoints, POINTS_REWARDS } from './loyaltyController';

/**
 * Get reviews for a movie or event
 */
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { movieId, eventId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!movieId && !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Either movieId or eventId is required'
      });
    }

    const whereClause: any = {
      isApproved: true
    };

    if (movieId) {
      whereClause.movieId = movieId as string;
      whereClause.itemType = 'MOVIE';
    }

    if (eventId) {
      whereClause.eventId = eventId as string;
      whereClause.itemType = 'EVENT';
    }

    const [reviews, total, averageRating] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      }),
      prisma.review.count({ where: whereClause }),
      prisma.review.aggregate({
        where: whereClause,
        _avg: {
          rating: true
        }
      })
    ]);

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: whereClause,
      _count: {
        rating: true
      }
    });

    const distribution = Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1;
      const count = ratingDistribution.find(r => r.rating === rating)?._count.rating || 0;
      return { rating, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 };
    });

    return res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        averageRating: averageRating._avg.rating || 0,
        totalReviews: total,
        ratingDistribution: distribution
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new review
 */
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { movieId, eventId, rating, review, title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!movieId && !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Either movieId or eventId is required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const itemType = movieId ? 'MOVIE' : 'EVENT';

    // Check if user already reviewed this item
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        movieId: movieId || null,
        eventId: eventId || null
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // Check if user has a verified booking (for verified reviews)
    let isVerified = false;
    if (movieId) {
      const hasBooking = await prisma.booking.findFirst({
        where: {
          userId,
          showtime: {
            movieId
          },
          paymentStatus: 'COMPLETED'
        }
      });
      isVerified = !!hasBooking;
    }

    const newReview = await prisma.review.create({
      data: {
        itemType,
        movieId: movieId || null,
        eventId: eventId || null,
        userId,
        rating: Number(rating),
        review: review || null,
        title: title || null,
        isVerified
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Award loyalty points for writing a review
    try {
      const movieTitle = movieId ? 
        (await prisma.movie.findUnique({ where: { id: movieId } }))?.title :
        (await prisma.event.findUnique({ where: { id: eventId! } }))?.title;
      
      await addPoints(
        userId,
        POINTS_REWARDS.REVIEW,
        'REVIEW',
        `Review for ${movieTitle || (itemType === 'MOVIE' ? 'movie' : 'event')}`
      );
    } catch (pointsError) {
      console.error('Failed to award loyalty points for review:', pointsError);
      // Don't fail the review if points fail
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review: newReview }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a review (only by the author)
 */
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, review, title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (existingReview == null) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (existingReview.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating ? Number(rating) : existingReview.rating,
        review: review !== undefined ? review : existingReview.review,
        title: title !== undefined ? title : existingReview.title,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Mark a review as helpful
 */
export const markHelpful = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // For now, we'll just increment the helpful count
    // In a full implementation, you'd want to track who marked it helpful to prevent duplicates
    
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: 1
        }
      }
    });

    return res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { helpfulCount: updatedReview.helpfulCount }
    });

  } catch (error) {
    console.error('Error marking review helpful:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a review (only by the author)
 */
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (existingReview == null) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (existingReview.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await prisma.review.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
