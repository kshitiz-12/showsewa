import { useEffect, useState } from 'react';
import { Trophy, Gift, TrendingUp, Award, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoyaltyInfo {
  id: string;
  points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  lifetimePoints: number;
  perks: string[];
  nextTierPoints: number;
  nextTierThreshold: number;
  pointsToNextTier: number;
  user: {
    name: string;
    email: string;
  };
}

interface PointsHistory {
  id: string;
  points: number;
  action: string;
  details?: string;
  createdAt: string;
}

interface LoyaltyData {
  loyaltyInfo: LoyaltyInfo;
  recentHistory: PointsHistory[];
}

const TIER_CONFIG = {
  BRONZE: {
    name: 'Bronze',
    color: 'from-orange-600 to-orange-800',
    icon: '🥉',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200'
  },
  SILVER: {
    name: 'Silver',
    color: 'from-gray-400 to-gray-600',
    icon: '🥈',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200'
  },
  GOLD: {
    name: 'Gold',
    color: 'from-yellow-400 to-yellow-600',
    icon: '🥇',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  PLATINUM: {
    name: 'Platinum',
    color: 'from-purple-500 to-purple-700',
    icon: '💎',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200'
  }
};

export function LoyaltyPoints() {
  const { isAuthenticated } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadLoyaltyInfo();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadLoyaltyInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/loyalty/my-points', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLoyaltyData(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading loyalty info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loyaltyData || !redeemPoints) return;

    const points = Number.parseInt(redeemPoints, 10);
    if (points <= 0 || points > loyaltyData.loyaltyInfo.points) {
      return;
    }

    setRedeeming(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          pointsToRedeem: points,
          redemptionType: 'discount'
        }),
      });

      if (response.ok) {
        setShowRedeemModal(false);
        setRedeemPoints('');
        await loadLoyaltyInfo(); // Refresh data
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
    } finally {
      setRedeeming(false);
    }
  };

  const getTierConfig = (tier: string) => {
    return TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.BRONZE;
  };

  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      'BOOKING': 'Movie Booking',
      'FIRST_BOOKING': 'First Booking Bonus',
      'REVIEW': 'Movie Review',
      'ACHIEVEMENT': 'Achievement Unlocked',
      'REDEMPTION': 'Points Redeemed'
    };
    return actionMap[action] || action;
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Join the Loyalty Program
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sign in to start earning points and unlock exclusive perks!
        </p>
        <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
          Sign In to Start Earning
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) return null;

  const tierConfig = getTierConfig(loyaltyData.loyaltyInfo.tier);
  const progressPercentage = loyaltyData.loyaltyInfo.nextTierThreshold > 0 
    ? Math.min(100, ((loyaltyData.loyaltyInfo.lifetimePoints / loyaltyData.loyaltyInfo.nextTierThreshold) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* Main Points Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loyalty Points</h2>
            <p className="text-gray-600 dark:text-gray-400">Earn rewards with every booking!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {loyaltyData.loyaltyInfo.points.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available Points</div>
          </div>
        </div>

        {/* Tier Badge */}
        <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg ${tierConfig.bgColor} ${tierConfig.borderColor} border mb-6`}>
          <span className="text-2xl">{tierConfig.icon}</span>
          <div>
            <div className={`font-semibold ${tierConfig.textColor}`}>
              {tierConfig.name} Member
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {loyaltyData.loyaltyInfo.lifetimePoints.toLocaleString()} lifetime points
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {loyaltyData.loyaltyInfo.tier !== 'PLATINUM' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress to {loyaltyData.loyaltyInfo.nextTierThreshold > 0 ? getTierConfig('SILVER').name : 'Next Tier'}</span>
              <span>{loyaltyData.loyaltyInfo.pointsToNextTier} points needed</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full bg-gradient-to-r ${tierConfig.color}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowRedeemModal(true)}
            disabled={loyaltyData.loyaltyInfo.points === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Gift className="w-4 h-4" />
            Redeem Points
          </button>
        </div>
      </div>

      {/* Perks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-red-600" />
          {tierConfig.name} Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loyaltyData.loyaltyInfo.perks.map((perk) => (
            <div key={perk} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Zap className="w-4 h-4 text-red-600" />
              <span className="text-gray-900 dark:text-white text-sm">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-600" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {loyaltyData.recentHistory.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No recent activity. Start booking to earn points!
            </p>
          ) : (
            loyaltyData.recentHistory.map((history) => (
              <div key={history.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatAction(history.action)}
                  </div>
                  {history.details && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {history.details}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(history.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={`font-semibold ${history.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {history.points > 0 ? '+' : ''}{history.points}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Redeem Points
            </h3>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label htmlFor="redeem-points" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Points to Redeem
                </label>
                <input
                  id="redeem-points"
                  type="number"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                  min="1"
                  max={loyaltyData.loyaltyInfo.points}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter points to redeem"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  You have {loyaltyData.loyaltyInfo.points} points available
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={redeeming || !redeemPoints || Number.parseInt(redeemPoints, 10) <= 0}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {redeeming ? 'Redeeming...' : 'Redeem Points'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
