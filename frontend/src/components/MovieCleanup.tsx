import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  BarChart3,
  Info
} from 'lucide-react';

interface CleanupStats {
  activeMovies: number;
  expiredMovies: number;
  endingToday: number;
  endingThisWeek: number;
}

interface CleanupResult {
  success: boolean;
  message: string;
  expiredCount: number;
  deactivatedCount: number;
  showtimeCount: number;
  expiredMovies?: Array<{
    title: string;
    endDate: string;
  }>;
}

export const MovieCleanup: React.FC = () => {
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/movies/cleanup/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.message || 'Failed to load cleanup stats');
        }
      } else {
        setError('Failed to load cleanup statistics');
      }
    } catch (err) {
      console.error('Error loading cleanup stats:', err);
      setError('Failed to load cleanup statistics');
    } finally {
      setLoading(false);
    }
  };

  const triggerCleanup = async () => {
    if (!confirm('This will deactivate all movies that have passed their end date. Continue?')) {
      return;
    }

    try {
      setCleaning(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/movies/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLastCleanup(data.data);
          await loadStats(); // Refresh stats
        } else {
          setError(data.message || 'Cleanup failed');
        }
      } else {
        setError('Failed to trigger cleanup');
      }
    } catch (err) {
      console.error('Error triggering cleanup:', err);
      setError('Failed to trigger cleanup');
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-600">Loading cleanup statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Movie Cleanup</h2>
            <p className="text-sm text-gray-600">Automatically deactivate expired movies</p>
          </div>
        </div>
        
        <button
          onClick={triggerCleanup}
          disabled={cleaning || !stats || stats.expiredMovies === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cleaning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>{cleaning ? 'Cleaning...' : 'Clean Now'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {lastCleanup && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-green-800">Cleanup Completed</h3>
          </div>
          <div className="text-sm text-green-700">
            <p>• {lastCleanup.deactivatedCount} movies deactivated</p>
            <p>• {lastCleanup.showtimeCount} showtimes deactivated</p>
            {lastCleanup.expiredMovies && lastCleanup.expiredMovies.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Expired movies:</p>
                <ul className="list-disc list-inside ml-4">
                  {lastCleanup.expiredMovies.map((movie, index) => (
                    <li key={`movie-${movie.title}-${index}`}>{movie.title} (ended: {new Date(movie.endDate).toLocaleDateString()})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Active Movies</p>
                <p className="text-2xl font-bold text-blue-800">{stats.activeMovies}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Expired Movies</p>
                <p className="text-2xl font-bold text-red-800">{stats.expiredMovies}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Ending Today</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.endingToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Ending This Week</p>
                <p className="text-2xl font-bold text-orange-800">{stats.endingThisWeek}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-500 mt-0.5" />
          <div className="text-sm text-gray-700">
            <h3 className="font-medium text-gray-900 mb-2">How Movie Cleanup Works</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Automatically runs daily at 2 AM (Nepal time)</li>
              <li>Deactivates movies that have passed their end date</li>
              <li>Also deactivates related showtimes</li>
              <li>Movies with no end date are never automatically deactivated</li>
              <li>You can manually trigger cleanup anytime using the "Clean Now" button</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
