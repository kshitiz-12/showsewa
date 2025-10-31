import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Loyalty tier thresholds
const LOYALTY_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  PLATINUM: 15000
};

// Points earned per action
const POINTS_REWARDS = {
  BOOKING: 50,
  REVIEW: 25,
  FIRST_BOOKING: 100,
  ACHIEVEMENT: 200
};

/**
 * Get user's loyalty points and tier information
 */
export const getUserLoyaltyInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let loyaltyInfo = await prisma.loyaltyPoint.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Create loyalty points record if it doesn't exist
    if (!loyaltyInfo) {
      loyaltyInfo = await prisma.loyaltyPoint.create({
        data: {
          userId,
          points: 0,
          tier: 'BRONZE',
          lifetimePoints: 0,
          perks: getTierPerks('BRONZE'),
          nextTierPoints: LOYALTY_THRESHOLDS.SILVER
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
    }

    // Get recent points history
    const recentHistory = await prisma.pointsHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return res.json({
      success: true,
      data: {
        loyaltyInfo: {
          ...loyaltyInfo,
          nextTierThreshold: getNextTierThreshold(loyaltyInfo.tier),
          pointsToNextTier: getNextTierThreshold(loyaltyInfo.tier) - loyaltyInfo.points
        },
        recentHistory
      }
    });

  } catch (error) {
    console.error('Error fetching loyalty info:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Add points to user's account
 */
export const addPoints = async (userId: string, points: number, action: string, details?: string) => {
  try {
    // Get or create loyalty points record
    let loyaltyInfo = await prisma.loyaltyPoint.findUnique({
      where: { userId }
    });

    if (!loyaltyInfo) {
      loyaltyInfo = await prisma.loyaltyPoint.create({
        data: {
          userId,
          points: 0,
          tier: 'BRONZE',
          lifetimePoints: 0,
          perks: getTierPerks('BRONZE'),
          nextTierPoints: LOYALTY_THRESHOLDS.SILVER
        }
      });
    }

    const newPoints = loyaltyInfo.points + points;
    const newLifetimePoints = loyaltyInfo.lifetimePoints + points;
    
    // Determine new tier
    const newTier = determineTier(newLifetimePoints);

    // Update loyalty points
    const updatedLoyaltyInfo = await prisma.loyaltyPoint.update({
      where: { userId },
      data: {
        points: newPoints,
        lifetimePoints: newLifetimePoints,
        tier: newTier,
        perks: getTierPerks(newTier),
        nextTierPoints: getNextTierThreshold(newTier)
      }
    });

    // Add points history entry
    await prisma.pointsHistory.create({
      data: {
        userId,
        points,
        action,
        description: details || null
      }
    });

    // Check if user tiered up
    const tieredUp = newTier !== loyaltyInfo.tier;
    
    return {
      success: true,
      tieredUp,
      newTier,
      newPoints,
      pointsEarned: points
    };

  } catch (error) {
    console.error('Error adding points:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Redeem points for rewards
 */
export const redeemPoints = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { pointsToRedeem, redemptionType } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points amount'
      });
    }

    const loyaltyInfo = await prisma.loyaltyPoint.findUnique({
      where: { userId }
    });

    if (!loyaltyInfo) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty account not found'
      });
    }

    if (loyaltyInfo.points < pointsToRedeem) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points'
      });
    }

    // Update points (subtract redeemed points)
    await prisma.loyaltyPoint.update({
      where: { userId },
      data: {
        points: loyaltyInfo.points - pointsToRedeem
      }
    });

    // Add redemption history
    await prisma.pointsHistory.create({
      data: {
        userId,
        points: -pointsToRedeem,
        action: 'REDEMPTION',
        description: `Redeemed ${pointsToRedeem} points for ${redemptionType || 'reward'}`
      }
    });

    return res.json({
      success: true,
      message: 'Points redeemed successfully',
      data: {
        remainingPoints: loyaltyInfo.points - pointsToRedeem,
        pointsRedeemed: pointsToRedeem
      }
    });

  } catch (error) {
    console.error('Error redeeming points:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get leaderboard (top users by points)
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await prisma.loyaltyPoint.findMany({
      take: Number(limit),
      orderBy: { lifetimePoints: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: { leaderboard }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper functions
function determineTier(lifetimePoints: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' {
  if (lifetimePoints >= LOYALTY_THRESHOLDS.PLATINUM) return 'PLATINUM';
  if (lifetimePoints >= LOYALTY_THRESHOLDS.GOLD) return 'GOLD';
  if (lifetimePoints >= LOYALTY_THRESHOLDS.SILVER) return 'SILVER';
  return 'BRONZE';
}

function getNextTierThreshold(currentTier: string): number {
  switch (currentTier) {
    case 'BRONZE': return LOYALTY_THRESHOLDS.SILVER;
    case 'SILVER': return LOYALTY_THRESHOLDS.GOLD;
    case 'GOLD': return LOYALTY_THRESHOLDS.PLATINUM;
    case 'PLATINUM': return LOYALTY_THRESHOLDS.PLATINUM; // Already at max tier
    default: return LOYALTY_THRESHOLDS.SILVER;
  }
}

function getTierPerks(tier: string): string[] {
  const perks = {
    BRONZE: ['Basic support', 'Standard booking'],
    SILVER: ['Priority support', 'Early access to new releases', '5% discount on bookings'],
    GOLD: ['Premium support', 'Exclusive screenings', '10% discount on bookings', 'Free popcorn'],
    PLATINUM: ['VIP support', 'Private screenings', '15% discount on bookings', 'Free food combo', 'Personal concierge']
  };
  
  return perks[tier as keyof typeof perks] || perks.BRONZE;
}

export { LOYALTY_THRESHOLDS, POINTS_REWARDS };
