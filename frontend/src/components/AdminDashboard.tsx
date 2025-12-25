import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Ticket,
  Building2,
  Film,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowLeft,
  Plus,
  X,
  Loader2,
  Trash2,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TheaterManagement } from './TheaterManagement';
import { MovieCleanup } from './MovieCleanup';
import { nepalCities } from '../data/nepalCities';

interface DashboardStats {
  totalTheaters: number;
  totalMovies: number;
  totalBookings: number;
  totalUsers: number;
  verifiedUsers: number;
  todayBookings: number;
  thisMonthBookings: number;
  todayRevenue: number;
  thisMonthRevenue: number;
}

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'theaters' | 'movies' | 'events' | 'bookings' | 'cleanup'>('dashboard');
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showTheaterModal, setShowTheaterModal] = useState(false);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      onNavigate('home');
      return;
    }
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to access admin dashboard');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        setError('Access denied. Please log in as an admin user.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Full API Response:', data);
        if (data.success) {
          setStats(data.data.stats);
          console.log('✅ Dashboard stats loaded:', data.data.stats);
          console.log('📈 Stats breakdown:', {
            totalUsers: data.data.stats?.totalUsers,
            totalBookings: data.data.stats?.totalBookings,
            totalTheaters: data.data.stats?.totalTheaters,
            totalMovies: data.data.stats?.totalMovies
          });
        } else {
          console.error('❌ API returned success: false', data);
          setError('Failed to load dashboard statistics');
        }
      } else {
        console.error('❌ API request failed:', response.status, response.statusText);
        setError(`Failed to fetch dashboard stats: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Network error while loading dashboard statistics');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('home')}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Back to Home</span>
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                </div>
              </div>
              <button
                onClick={fetchDashboardStats}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                <span className="hidden sm:inline">Refresh Stats</span>
              </button>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 sm:space-x-8 min-w-max">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'theaters', label: 'Theaters', icon: Building2 },
                { id: 'movies', label: 'Movies', icon: Film },
                { id: 'events', label: 'Events', icon: Calendar },
                { id: 'bookings', label: 'Bookings', icon: Ticket },
                { id: 'cleanup', label: 'Cleanup', icon: Trash2 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentView(id as any)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
                    currentView === id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  aria-label={label}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
                {error.includes('Access denied') || error.includes('log in') ? (
                  <button 
                    onClick={() => onNavigate('login')}
                    className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Go to Login
                  </button>
                ) : (
                  <button 
                    onClick={fetchDashboardStats}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                  >
                    Retry loading stats
                  </button>
                )}
              </div>
            )}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              <StatCard
                title="Total Theaters"
                value={stats?.totalTheaters ?? 0}
                icon={Building2}
                color="blue"
              />
              <StatCard
                title="Total Movies"
                value={stats?.totalMovies ?? 0}
                icon={Film}
                color="green"
              />
              <StatCard
                title="Total Bookings"
                value={stats?.totalBookings ?? 0}
                icon={Ticket}
                color="purple"
              />
              <StatCard
                title="Total Users"
                value={stats?.totalUsers ?? 0}
                subtitle={typeof stats?.verifiedUsers === 'number' ? `${stats.verifiedUsers} verified` : undefined}
                icon={Users}
                color="orange"
              />
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RevenueCard
                title="Today's Revenue"
                amount={stats?.todayRevenue || 0}
                bookings={stats?.todayBookings || 0}
                icon={DollarSign}
                color="green"
              />
              <RevenueCard
                title="This Month's Revenue"
                amount={stats?.thisMonthRevenue || 0}
                bookings={stats?.thisMonthBookings || 0}
                icon={TrendingUp}
                color="blue"
              />
            </div>
          </div>
        )}

        {currentView === 'theaters' && (
          <TheaterManagement onAddTheater={() => setShowTheaterModal(true)} />
        )}
        {currentView === 'movies' && (
          <MovieManagement 
            onAddMovie={() => setShowMovieModal(true)}
            onAddShowtime={() => setShowShowtimeModal(true)}
          />
        )}
        {currentView === 'events' && (
          <EventManagement 
            onAddEvent={() => setShowEventModal(true)}
          />
        )}
        {currentView === 'bookings' && <BookingManagement />}
        
        {currentView === 'cleanup' && <MovieCleanup />}
        
        {/* Modals */}
        {showTheaterModal && (
          <TheaterModal 
            onClose={() => setShowTheaterModal(false)}
            onSuccess={() => {
              setShowTheaterModal(false);
              fetchDashboardStats(); // Refresh stats
            }}
          />
        )}
        {showMovieModal && (
          <MovieModal 
            onClose={() => setShowMovieModal(false)}
            onSuccess={() => {
              setShowMovieModal(false);
              fetchDashboardStats(); // Refresh stats
            }}
          />
        )}
        {showEventModal && (
          <EventModal 
            onClose={() => setShowEventModal(false)}
            onSuccess={() => {
              setShowEventModal(false);
              fetchDashboardStats(); // Refresh stats
            }}
          />
        )}
        {showShowtimeModal && (
          <ShowtimeModal 
            onClose={() => setShowShowtimeModal(false)}
            onSuccess={() => {
              setShowShowtimeModal(false);
              fetchDashboardStats(); // Refresh stats
            }}
          />
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-500 text-white',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-3 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]} flex-shrink-0`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
};

interface RevenueCardProps {
  title: string;
  amount: number;
  bookings: number;
  icon: React.ComponentType<any>;
  color: string;
}

const RevenueCard: React.FC<RevenueCardProps> = ({ title, amount, bookings, icon: Icon, color }) => {
  const colorClasses = {
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className={`p-2 sm:p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">₹{amount.toLocaleString()}</p>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{bookings} bookings</p>
      </div>
    </div>
  );
};

// Management components for different admin sections
interface MovieManagementProps {
  onAddMovie: () => void;
  onAddShowtime: () => void;
}

const MovieManagement: React.FC<MovieManagementProps> = ({ onAddMovie, onAddShowtime }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
    <div className="flex flex-col gap-4 mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Movie Management</h2>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button 
          onClick={onAddShowtime}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Add Showtime</span>
          <span className="sm:hidden">Add Showtime</span>
        </button>
        <button 
          onClick={onAddMovie}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Movie</span>
          <span className="sm:hidden">Add Movie</span>
        </button>
      </div>
    </div>
    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Add new movies and manage showtimes.</p>
  </div>
);

interface EventManagementProps {
  onAddEvent: () => void;
}

const EventManagement: React.FC<EventManagementProps> = ({ onAddEvent }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Event Management</h2>
      <button 
        onClick={onAddEvent}
        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Event</span>
        <span className="sm:hidden">Add</span>
      </button>
    </div>
    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Create and manage events, concerts, and shows.</p>
  </div>
);

const BookingManagement: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Booking Management</h2>
      <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base">
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">View All</span>
        <span className="sm:hidden">View</span>
      </button>
    </div>
    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Booking management features will be implemented here.</p>
  </div>
);

// Modal Components
interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TheaterModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    nameNe: '',
    city: '',
    area: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    amenities: [] as string[],
    screenCount: 3,
    seatsPerScreen: 200
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/theaters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to create theater');
      }
    } catch (err) {
      console.error('Error creating theater:', err);
      setError('Failed to create theater. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Theater</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* City Selection - FIRST */}
          <div>
            <label htmlFor="theater-city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <select
              id="theater-city"
              required
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a city</option>
              {[...nepalCities]
                .sort((a, b) => {
                  // Sort: popular first, then by name
                  if (a.isPopular && !b.isPopular) return -1;
                  if (!a.isPopular && b.isPopular) return 1;
                  return a.name.localeCompare(b.name);
                })
                .map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.icon} {city.name} {city.isPopular ? '⭐' : ''}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              First select the city, then enter the theater name to avoid conflicts
            </p>
          </div>

          {/* Theater Name - AFTER City */}
          <div>
            <label htmlFor="theater-name" className="block text-sm font-medium text-gray-700 mb-1">Theater Name *</label>
            <input
              id="theater-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter theater name"
              disabled={!formData.city}
            />
            {!formData.city && (
              <p className="text-xs text-amber-600 mt-1">Please select a city first</p>
            )}
          </div>

          <div>
            <label htmlFor="theater-area" className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
            <input
              id="theater-area"
              type="text"
              required
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="theater-address" className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <textarea
              id="theater-address"
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="theater-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              id="theater-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="theater-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="theater-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="theater-screen-count" className="block text-sm font-medium text-gray-700 mb-1">Number of Screens</label>
              <input
                id="theater-screen-count"
                type="number"
                min="1"
                max="20"
                value={formData.screenCount}
                onChange={(e) => setFormData({...formData, screenCount: Number.parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="3"
              />
            </div>
            <div>
              <label htmlFor="theater-seats-per-screen" className="block text-sm font-medium text-gray-700 mb-1">Seats per Screen</label>
              <input
                id="theater-seats-per-screen"
                type="number"
                min="50"
                max="500"
                value={formData.seatsPerScreen}
                onChange={(e) => setFormData({...formData, seatsPerScreen: Number.parseInt(e.target.value) || 200})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="200"
              />
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <strong>Note:</strong> This will automatically create screens and seats for your theater. Screens will include Premium, Standard, and Economy seat categories with appropriate pricing.
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Theater'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MovieModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    titleNe: '',
    description: '',
    descriptionNe: '',
    genre: '',
    duration: '',
    language: '',
    rating: '',
    releaseDate: '',
    endDate: '',
    posterUrl: '',
    trailerUrl: '',
    imdbRating: '',
    isTrending: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          genre: formData.genre.split(',').map(g => g.trim()),
          language: formData.language.split(',').map(l => l.trim()),
          duration: Number.parseInt(formData.duration),
          imdbRating: formData.imdbRating ? Number.parseFloat(formData.imdbRating) : null
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to create movie');
      }
    } catch (err) {
      console.error('Error creating movie:', err);
      setError('Failed to create movie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Movie</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="movie-title" className="block text-sm font-medium text-gray-700 mb-1">Movie Title *</label>
            <input
              id="movie-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="movie-genre" className="block text-sm font-medium text-gray-700 mb-1">Genre * (comma-separated)</label>
            <input
              id="movie-genre"
              type="text"
              required
              value={formData.genre}
              onChange={(e) => setFormData({...formData, genre: e.target.value})}
              placeholder="Action, Drama, Comedy"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="movie-duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
            <input
              id="movie-duration"
              type="number"
              required
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="movie-language" className="block text-sm font-medium text-gray-700 mb-1">Language * (comma-separated)</label>
            <input
              id="movie-language"
              type="text"
              required
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
              placeholder="English, Hindi, Nepali"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="movie-rating" className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
            <select
              id="movie-rating"
              required
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Rating</option>
              <option value="U">U - Universal</option>
              <option value="UA">UA - Parental Guidance</option>
              <option value="A">A - Adults Only</option>
            </select>
          </div>

          <div>
            <label htmlFor="movie-release-date" className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
            <input
              id="movie-release-date"
              type="date"
              value={formData.releaseDate}
              onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="movie-end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
            <input
              id="movie-end-date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Movie will be automatically removed from the website after this date
            </p>
          </div>

          <div>
            <label htmlFor="movie-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="movie-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="movie-poster" className="block text-sm font-medium text-gray-700 mb-1">Poster URL</label>
            <input
              id="movie-poster"
              type="url"
              value={formData.posterUrl}
              onChange={(e) => setFormData({...formData, posterUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="movie-trailer" className="block text-sm font-medium text-gray-700 mb-1">Trailer URL</label>
            <input
              id="movie-trailer"
              type="url"
              value={formData.trailerUrl}
              onChange={(e) => setFormData({...formData, trailerUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="movie-imdb-rating" className="block text-sm font-medium text-gray-700 mb-1">IMDb Rating</label>
            <input
              id="movie-imdb-rating"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.imdbRating}
              onChange={(e) => setFormData({...formData, imdbRating: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              id="movie-trending"
              type="checkbox"
              checked={formData.isTrending}
              onChange={(e) => setFormData({...formData, isTrending: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="movie-trending" className="ml-2 text-sm font-medium text-gray-700">
              Mark as Trending
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Movie'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedTheaters, setSelectedTheaters] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [allTheaters, setAllTheaters] = useState<any[]>([]);
  const [theaterSearchQuery, setTheaterSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    titleNe: '',
    description: '',
    descriptionNe: '',
    category: 'CONCERT',
    imageUrl: '',
    galleryImages: [] as string[],
    theaterId: '',
    venue: '',
    venueNe: '',
    location: '',
    locationNe: '',
    eventDate: '',
    endDate: '',
    priceMin: '',
    priceMax: '',
    totalSeats: '',
    availableSeats: '',
    isFeatured: false,
    tags: [] as string[],
    organizer: '',
    ageRestriction: '',
    termsAndConditions: '',
    termsAndConditionsNe: ''
  });

  // Fetch all theaters for bulk mode
  useEffect(() => {
    const fetchAllTheaters = async () => {
      if (!bulkMode) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/theaters?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAllTheaters(data.data.theaters || []);
        }
      } catch (err) {
        console.error('Error fetching all theaters:', err);
      }
    };
    if (bulkMode) {
      fetchAllTheaters();
    }
  }, [bulkMode]);

  // Fetch theaters when city changes (single mode)
  useEffect(() => {
    const fetchTheaters = async () => {
      if (bulkMode || !selectedCity) {
        if (!bulkMode) setTheaters([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/theaters?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const filtered = (data.data.theaters || []).filter((t: any) => 
            t.city?.toLowerCase() === selectedCity.toLowerCase()
          );
          setTheaters(filtered);
        }
      } catch (err) {
        console.error('Error fetching theaters:', err);
      }
    };
    fetchTheaters();
  }, [selectedCity, bulkMode]);

  // Filter theaters by search
  const filteredTheaters = theaters.filter(t => 
    t.name?.toLowerCase().includes(theaterSearchQuery.toLowerCase())
  );

  // Filter theaters for bulk mode
  const getFilteredTheatersForBulk = () => {
    if (!bulkMode) return [];
    let filtered = allTheaters;
    
    // Filter by selected cities if any
    if (selectedCities.length > 0) {
      filtered = filtered.filter(t => 
        selectedCities.some(city => 
          t.city?.toLowerCase() === city.toLowerCase()
        )
      );
    }
    
    // Filter by search query
    if (theaterSearchQuery) {
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(theaterSearchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const bulkTheaters = getFilteredTheatersForBulk();

  // Handle select all cities
  const handleSelectAllCities = () => {
    if (selectedCities.length === nepalCities.length) {
      setSelectedCities([]);
    } else {
      setSelectedCities(nepalCities.map(c => c.name));
    }
  };

  // Handle select all theaters
  const handleSelectAllTheaters = () => {
    const filtered = getFilteredTheatersForBulk();
    if (selectedTheaters.length === filtered.length && filtered.length > 0) {
      setSelectedTheaters([]);
    } else {
      setSelectedTheaters(filtered.map(t => t.id));
    }
  };

  // Handle city checkbox change
  const handleCityCheckboxChange = (cityName: string) => {
    if (selectedCities.includes(cityName)) {
      setSelectedCities(selectedCities.filter(c => c !== cityName));
    } else {
      setSelectedCities([...selectedCities, cityName]);
    }
  };

  // Handle theater checkbox change
  const handleTheaterCheckboxChange = (theaterId: string) => {
    if (selectedTheaters.includes(theaterId)) {
      setSelectedTheaters(selectedTheaters.filter(t => t !== theaterId));
    } else {
      setSelectedTheaters([...selectedTheaters, theaterId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // If bulk mode, create events for all selected combinations
      if (bulkMode && selectedCities.length > 0 && selectedTheaters.length > 0) {
        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        // Create event for each theater
        for (const theaterId of selectedTheaters) {
          const theater = allTheaters.find(t => t.id === theaterId);
          if (!theater) continue;

          // Only create if theater city is in selected cities
          if (!selectedCities.some(c => c.toLowerCase() === theater.city?.toLowerCase())) {
            continue;
          }

          try {
            const response = await fetch('http://localhost:5000/api/admin/events', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...formData,
                theaterId: theaterId,
                venue: theater.name,
                location: `${theater.area}, ${theater.city}`,
                priceMin: Number.parseFloat(formData.priceMin) || 0,
                priceMax: Number.parseFloat(formData.priceMax) || 0,
                totalSeats: Number.parseInt(formData.totalSeats),
                availableSeats: Number.parseInt(formData.availableSeats) || Number.parseInt(formData.totalSeats),
                tags: formData.tags.length > 0 ? formData.tags : [],
                galleryImages: formData.galleryImages.length > 0 ? formData.galleryImages : []
              }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
              successCount++;
            } else {
              failCount++;
              errors.push(`${theater.name}: ${data.message || 'Failed'}`);
            }
          } catch (err) {
            failCount++;
            errors.push(`${theater.name}: Network error`);
          }
        }

        if (successCount > 0) {
          onSuccess();
        } else {
          setError(`Failed to create events. ${failCount} failed. ${errors.slice(0, 3).join(', ')}`);
        }
      } else {
        // Single event creation (original logic)
        // Validate required fields for single mode
        if (!bulkMode && !selectedCity) {
          setError('Please select a city');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/admin/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            priceMin: Number.parseFloat(formData.priceMin) || 0,
            priceMax: Number.parseFloat(formData.priceMax) || 0,
            totalSeats: Number.parseInt(formData.totalSeats),
            availableSeats: Number.parseInt(formData.availableSeats) || Number.parseInt(formData.totalSeats),
            tags: formData.tags.length > 0 ? formData.tags : [],
            galleryImages: formData.galleryImages.length > 0 ? formData.galleryImages : []
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          onSuccess();
        } else {
          setError(data.message || 'Failed to create event');
        }
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Add New Event</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
            <input
              id="event-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Summer Music Festival 2025"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select
                id="event-category"
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="CONCERT">🎵 Concert</option>
                <option value="FESTIVAL">🎪 Festival</option>
                <option value="SPORTS">⚽ Sports</option>
                <option value="THEATER">🎭 Theater</option>
                <option value="COMEDY">😄 Comedy</option>
                <option value="WORKSHOP">🔧 Workshop</option>
                <option value="EXHIBITION">🎨 Exhibition</option>
                <option value="OTHER">📅 Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="event-organizer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organizer</label>
              <input
                id="event-organizer"
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Organizer name"
              />
            </div>
          </div>

          {/* Bulk Mode Toggle */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <input
              id="event-bulk-mode"
              type="checkbox"
              checked={bulkMode}
              onChange={(e) => {
                setBulkMode(e.target.checked);
                if (!e.target.checked) {
                  setSelectedCities([]);
                  setSelectedTheaters([]);
                }
              }}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="event-bulk-mode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Bulk Mode (Select multiple cities/theaters)
            </label>
          </div>

          {/* City Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="event-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City *</label>
              {bulkMode && (
                <button
                  type="button"
                  onClick={handleSelectAllCities}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {selectedCities.length === nepalCities.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            {bulkMode ? (
              <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-700">
                {[...nepalCities]
                  .sort((a, b) => {
                    if (a.isPopular && !b.isPopular) return -1;
                    if (!a.isPopular && b.isPopular) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((city) => (
                    <label key={city.name} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city.name)}
                        onChange={() => handleCityCheckboxChange(city.name)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {city.icon} {city.name} {city.isPopular ? '⭐' : ''}
                      </span>
                    </label>
                  ))}
              </div>
            ) : (
              <select
                id="event-city"
                required
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setFormData({...formData, theaterId: ''});
                  if (formData.venue) {
                    setFormData({...formData, location: e.target.value, theaterId: ''});
                  } else {
                    setFormData({...formData, location: e.target.value, theaterId: ''});
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a city</option>
                {[...nepalCities]
                  .sort((a, b) => {
                    if (a.isPopular && !b.isPopular) return -1;
                    if (!a.isPopular && b.isPopular) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.icon} {city.name} {city.isPopular ? '⭐' : ''}
                    </option>
                  ))}
              </select>
            )}
            {bulkMode && selectedCities.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedCities.length} city/cities selected
              </p>
            )}
          </div>

          {/* Theater/Venue Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="event-venue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Venue / Theater</label>
              {bulkMode && bulkTheaters.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllTheaters}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {selectedTheaters.length === bulkTheaters.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            {bulkMode ? (
              <>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search theaters..."
                    value={theaterSearchQuery}
                    onChange={(e) => setTheaterSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-700">
                  {bulkTheaters.length > 0 ? (
                    bulkTheaters.map((theater) => (
                      <label key={theater.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTheaters.includes(theater.id)}
                          onChange={() => handleTheaterCheckboxChange(theater.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {theater.name} - {theater.area} ({theater.city})
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
                      {selectedCities.length === 0 ? 'Select cities first' : 'No theaters found'}
                    </p>
                  )}
                </div>
                {selectedTheaters.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedTheaters.length} theater(s) selected
                  </p>
                )}
              </>
            ) : (
              <>
                {selectedCity && (
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search venues..."
                      value={theaterSearchQuery}
                      onChange={(e) => setTheaterSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
                {selectedCity ? (
                  <select
                    id="event-venue"
                    value={formData.theaterId}
                    onChange={(e) => {
                      const theater = filteredTheaters.find(t => t.id === e.target.value);
                      setFormData({
                        ...formData,
                        theaterId: e.target.value,
                        venue: theater?.name || '',
                        location: theater ? `${theater.area}, ${theater.city}` : selectedCity
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Or select a theater/venue</option>
                    {filteredTheaters.map((theater) => (
                      <option key={theater.id} value={theater.id}>
                        {theater.name} - {theater.area}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="event-venue-manual"
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    placeholder="Enter venue name manually"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Select a theater or enter a custom venue name
                </p>
              </>
            )}
          </div>

          <div>
            <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
            <input
              id="event-location"
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={selectedCity || "e.g., Kathmandu, New Road"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Start *</label>
              <input
                id="event-date"
                type="datetime-local"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 7, 14, 30].map(days => {
                  const date = new Date();
                  date.setDate(date.getDate() + days);
                  const dateStr = date.toISOString().slice(0, 16);
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, eventDate: dateStr});
                        const endDate = new Date(date);
                        endDate.setHours(endDate.getHours() + 3);
                        setFormData({...formData, eventDate: dateStr, endDate: endDate.toISOString().slice(0, 16)});
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      +{days}D
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label htmlFor="event-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event End *</label>
              <input
                id="event-end-date"
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="event-price-min" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price</label>
              <input
                id="event-price-min"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceMin}
                onChange={(e) => setFormData({...formData, priceMin: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="event-price-max" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price</label>
              <input
                id="event-price-max"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceMax}
                onChange={(e) => setFormData({...formData, priceMax: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="event-seats" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Seats *</label>
              <input
                id="event-seats"
                type="number"
                required
                min="1"
                value={formData.totalSeats}
                onChange={(e) => setFormData({...formData, totalSeats: e.target.value, availableSeats: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Featured Event Toggle */}
          <div className="flex items-center gap-3">
            <input
              id="event-featured"
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="event-featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Event</label>
          </div>

          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              id="event-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Describe your event, artists, highlights..."
            />
          </div>

          <div>
            <label htmlFor="event-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Image URL *</label>
            <input
              id="event-image"
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload to a CDN first, then paste the URL
            </p>
          </div>

          {/* Quick Price Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Price Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { min: 500, max: 1500, seats: 300 },
                { min: 800, max: 2000, seats: 500 },
                { min: 1000, max: 2500, seats: 800 },
                { min: 1500, max: 3000, seats: 1000 }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      priceMin: preset.min.toString(),
                      priceMax: preset.max.toString(),
                      totalSeats: preset.seats.toString(),
                      availableSeats: preset.seats.toString()
                    });
                  }}
                  className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  NPR {preset.min}-{preset.max}<br />
                  <span className="text-gray-600">{preset.seats} seats</span>
                </button>
              ))}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-4">
            <div>
              <label htmlFor="event-terms-conditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Terms & Conditions (English) <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                id="event-terms-conditions"
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({...formData, termsAndConditions: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
                placeholder="Enter event-specific terms and conditions (e.g., refund policy, age restrictions, entry rules)..."
              />
              <p className="text-xs text-gray-500 mt-1">
                If left empty, default terms will be shown to users
              </p>
            </div>
            <div>
              <label htmlFor="event-terms-conditions-ne" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Terms & Conditions (नेपाली) <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                id="event-terms-conditions-ne"
                value={formData.termsAndConditionsNe}
                onChange={(e) => setFormData({...formData, termsAndConditionsNe: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
                placeholder="घटना-विशिष्ट नियमहरू र शर्तहरू प्रविष्ट गर्नुहोस्..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ShowtimeModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [movies, setMovies] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [allTheaters, setAllTheaters] = useState<any[]>([]); // Store all theaters
  const [screens, setScreens] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState('');
  const [selectedTheaters, setSelectedTheaters] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [theaterSearchQuery, setTheaterSearchQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    movieId: '',
    screenId: '',
    showDate: '',
    showTime: '',
    price: '',
    language: 'Hindi'
  });

  // Fetch movies and theaters on component mount
  useEffect(() => {
    fetchMoviesAndTheaters();
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({...prev, showDate: today}));
  }, []);

  const fetchMoviesAndTheaters = async () => {
    try {
      setError('');
      setDataLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🎬 Fetching movies and theaters for showtime form...');
      
      // Fetch movies
      const moviesResponse = await fetch('http://localhost:5000/api/admin/movies?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Fetch theaters
      const theatersResponse = await fetch('http://localhost:5000/api/admin/theaters?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 API Responses:', {
        movies: moviesResponse.status,
        theaters: theatersResponse.status
      });

      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json();
        if (moviesData.success) {
          setMovies(moviesData.data.movies || []);
          console.log('✅ Movies loaded:', moviesData.data.movies?.length || 0);
        } else {
          console.warn('⚠️ Movies API returned success: false');
        }
      } else {
        console.error('❌ Movies API failed:', moviesResponse.status, moviesResponse.statusText);
      }

      if (theatersResponse.ok) {
        const theatersData = await theatersResponse.json();
        if (theatersData.success) {
          const allTheatersData = theatersData.data.theaters || [];
          setAllTheaters(allTheatersData); // Store all theaters
          setTheaters(allTheatersData); // Initially show all theaters
          console.log('✅ Theaters loaded:', allTheatersData.length || 0);
        } else {
          console.warn('⚠️ Theaters API returned success: false');
          setError('Failed to load theaters data');
        }
      } else {
        console.error('❌ Theaters API failed:', theatersResponse.status, theatersResponse.statusText);
        setError(`Failed to load theaters: ${theatersResponse.status} ${theatersResponse.statusText}`);
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError('Network error while loading data');
    } finally {
      setDataLoading(false);
    }
  };

  // Filter theaters based on city and search query
  const filterTheaters = () => {
    let filtered = allTheaters;
    
    // Filter by city if selected
    if (selectedCity) {
      filtered = filtered.filter(theater => 
        theater.city?.toLowerCase() === selectedCity.toLowerCase()
      );
    }
    
    // Filter by search query if provided
    if (theaterSearchQuery) {
      filtered = filtered.filter(theater => 
        theater.name?.toLowerCase().includes(theaterSearchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Use useEffect to update theaters when city or search changes (single mode)
  useEffect(() => {
    if (!bulkMode) {
      const filtered = filterTheaters();
      setTheaters(filtered);
    }
  }, [selectedCity, theaterSearchQuery, allTheaters, bulkMode]);

  // Handle city change - filter theaters by selected city
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedTheaterId(''); // Reset theater selection
    setTheaterSearchQuery(''); // Reset search
    setFormData(prev => ({...prev, screenId: ''}));
    setScreens([]);
  };

  // Fetch screens when theater is selected
  const handleTheaterChange = async (theaterId: string) => {
    setSelectedTheaterId(theaterId);
    
    if (!theaterId) {
      setScreens([]);
      setFormData(prev => ({...prev, screenId: ''}));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/theaters/${theaterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.theater.screens) {
          setScreens(data.data.theater.screens);
        }
      }
    } catch (err) {
      console.error('Error fetching screens:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/showtimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to create showtime');
      }
    } catch (err) {
      console.error('Error creating showtime:', err);
      setError('Failed to create showtime. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Add New Showtime</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="showtime-movie" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Movie *</label>
            <select
              id="showtime-movie"
              required
              value={formData.movieId}
              onChange={(e) => setFormData({...formData, movieId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a movie</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          {/* City Selection - Using nepalCities dropdown */}
          <div>
            <label htmlFor="showtime-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City *
            </label>
            <select
              id="showtime-city"
              required
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a city</option>
              {[...nepalCities]
                .sort((a, b) => {
                  // Sort: popular first, then by name
                  if (a.isPopular && !b.isPopular) return -1;
                  if (!a.isPopular && b.isPopular) return 1;
                  return a.name.localeCompare(b.name);
                })
                .map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.icon} {city.name} {city.isPopular ? '⭐' : ''}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select city first, then theaters in that city will appear
            </p>
          </div>

          {/* Theater Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="showtime-theater" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Theater *
              </label>
              {bulkMode && (
                <button
                  type="button"
                  onClick={() => {
                    const filtered = allTheaters.filter(t => 
                      selectedCities.length === 0 || selectedCities.some(c => 
                        t.city?.toLowerCase() === c.toLowerCase()
                      )
                    );
                    if (selectedTheaters.length === filtered.length && filtered.length > 0) {
                      setSelectedTheaters([]);
                    } else {
                      setSelectedTheaters(filtered.map(t => t.id));
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Select All
                </button>
              )}
            </div>
            
            {/* Theater Search Bar */}
            {((bulkMode && selectedCities.length > 0) || (!bulkMode && selectedCity)) && !dataLoading && theaters.length > 0 && (
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search theaters..."
                  value={theaterSearchQuery}
                  onChange={(e) => setTheaterSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
            
            {dataLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Loading theaters...</span>
              </div>
            ) : bulkMode ? (
              <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-700">
                {(() => {
                  const filtered = allTheaters.filter(t => 
                    (selectedCities.length === 0 || selectedCities.some(c => 
                      t.city?.toLowerCase() === c.toLowerCase()
                    )) &&
                    (!theaterSearchQuery || t.name?.toLowerCase().includes(theaterSearchQuery.toLowerCase()))
                  );
                  
                  if (filtered.length === 0) {
                    return (
                      <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
                        {selectedCities.length === 0 ? 'Select cities first' : 'No theaters found'}
                      </p>
                    );
                  }
                  
                  return filtered.map((theater) => (
                    <label key={theater.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTheaters.includes(theater.id)}
                        onChange={() => {
                          if (selectedTheaters.includes(theater.id)) {
                            setSelectedTheaters(selectedTheaters.filter(t => t !== theater.id));
                          } else {
                            setSelectedTheaters([...selectedTheaters, theater.id]);
                          }
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {theater.name} ({theater.city})
                      </span>
                    </label>
                  ));
                })()}
              </div>
            ) : (
              <>
                <select
                  id="showtime-theater"
                  required
                  value={selectedTheaterId || ''}
                  onChange={(e) => {
                    handleTheaterChange(e.target.value);
                    setFormData(prev => ({...prev, screenId: ''}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={!selectedCity}
                >
                  <option value="">
                    {(() => {
                      if (!selectedCity) return 'Please select a city first';
                      if (theaters.length === 0) return `No theaters found in ${selectedCity}`;
                      if (theaterSearchQuery && theaters.length === 0) return 'No matching theaters';
                      return `Select a theater (${theaters.length} ${theaters.length === 1 ? 'theater' : 'theaters'})`;
                    })()}
                  </option>
                  {theaters.length > 0 && theaters.map((theater) => (
                    <option key={theater.id} value={theater.id}>
                      {theater.name}
                    </option>
                  ))}
                </select>
                {theaters.length === 0 && selectedCity && (
                  <p className="text-sm text-red-600 mt-1">No theaters found in {selectedCity}. Please add theaters in this city first.</p>
                )}
              </>
            )}
            {bulkMode && selectedTheaters.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedTheaters.length} theater(s) selected
              </p>
            )}
          </div>

          <div>
            <label htmlFor="showtime-screen" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Screen *</label>
            <select
              id="showtime-screen"
              required
              value={formData.screenId}
              onChange={(e) => setFormData({...formData, screenId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={!selectedTheaterId}
            >
              <option value="">Select a screen</option>
              {screens.map((screen) => (
                <option key={screen.id} value={screen.id}>
                  {screen.name} (Capacity: {screen.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="showtime-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Show Date *</label>
              <div className="flex gap-2">
                <input
                  id="showtime-date"
                  type="date"
                  required
                  value={formData.showDate}
                  onChange={(e) => setFormData({...formData, showDate: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setFormData({...formData, showDate: today});
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Today
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="showtime-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Show Time *</label>
              <input
                id="showtime-time"
                type="time"
                required
                value={formData.showTime}
                onChange={(e) => setFormData({...formData, showTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {['09:00', '12:00', '15:00', '18:00', '21:00'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData({...formData, showTime: time})}
                    className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                      formData.showTime === time
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="showtime-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Price (NPR) *</label>
              <input
                id="showtime-price"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="600"
              />
              <div className="mt-1 text-xs text-gray-500 mb-2">
                Note: Individual seats have different prices (Premium: 800, Standard: 600, Economy: 400)
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {['400', '600', '800', '1000'].map((price) => (
                  <button
                    key={price}
                    type="button"
                    onClick={() => setFormData({...formData, price})}
                    className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                      formData.price === price
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    NPR {price}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="showtime-language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
              <select
                id="showtime-language"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Nepali">Nepali</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Showtime'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
