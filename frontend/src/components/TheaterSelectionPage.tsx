import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Ticket, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCity } from '../contexts/CityContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface TheaterSelectionPageProps {
  movieId: string;
  onNavigate: (page: string, id?: string) => void;
}

interface Movie {
  id: string;
  title: string;
  titleNe: string;
  posterUrl: string;
  language: string[];
}

interface Showtime {
  id: string;
  showDate: string;
  showTime: string;
  price: number;
  availableSeats: number;
  language?: string;
  screen: {
    id: string;
    screenType?: string;
    theater: {
      id: string;
      name: string;
      city: string;
      amenities?: string[];
    };
  };
}

export function TheaterSelectionPage({ movieId, onNavigate }: Readonly<TheaterSelectionPageProps>) {
  const { language } = useLanguage();
  const { selectedCity } = useCity();
  const { favoriteTheaterIds } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  useEffect(() => {
    // Reset filters when movieId or city changes
    setShowtimes([]);
    setFilteredShowtimes([]);
    setSelectedDate('');
    setSelectedLanguage('');
    setSelectedFormat('');
    setShowFavoritesOnly(false);
    loadMovie();
  }, [movieId, selectedCity]);

  useEffect(() => {
    filterShowtimes();
  }, [showtimes, showFavoritesOnly, favoriteTheaterIds, selectedDate, selectedLanguage, selectedFormat]);

  // Set default selected date to first available date
  useEffect(() => {
    if (showtimes.length > 0 && !selectedDate) {
      const dates = [...new Set(showtimes.map(s => s.showDate))].sort((a, b) => a.localeCompare(b));
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    }
  }, [showtimes, selectedDate]);

  async function loadMovie() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}?city=${selectedCity}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMovie(data.data.movie);
          // Filter showtimes by selected city
          if (data.data.movie.showtimes && Array.isArray(data.data.movie.showtimes)) {
            const cityShowtimes = data.data.movie.showtimes.filter((showtime: Showtime) => 
              showtime.screen?.theater?.city?.toLowerCase() === selectedCity.toLowerCase()
            );
            setShowtimes(cityShowtimes);
          } else {
            setShowtimes([]);
          }
        } else {
          setError('Failed to load movie details');
        }
      } else {
        setError('Failed to load movie details');
      }
    } catch (error) {
      console.error('Error loading movie:', error);
      setError('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  }

  function filterShowtimes() {
    // Always start with all showtimes - don't filter if empty
    if (showtimes.length === 0) {
      setFilteredShowtimes([]);
      return;
    }

    let filtered = [...showtimes]; // Start with all showtimes

    // Filter by selected date (only if a date is selected and it's not empty)
    if (selectedDate) {
      // Normalize dates for comparison (compare date strings, not full datetime)
      filtered = filtered.filter(showtime => {
        const showtimeDate = new Date(showtime.showDate).toISOString().split('T')[0];
        const selectedDateStr = new Date(selectedDate).toISOString().split('T')[0];
        return showtimeDate === selectedDateStr;
      });
    }

    // Filter by language (only if a language is selected)
    if (selectedLanguage) {
      filtered = filtered.filter(showtime => {
        // Check both movie language and showtime language
        const movieHasLang = movie?.language?.some((lang: string) => 
          lang.toLowerCase() === selectedLanguage.toLowerCase()
        );
        const showtimeHasLang = showtime.language?.toLowerCase() === selectedLanguage.toLowerCase();
        return movieHasLang || showtimeHasLang;
      });
    }

    // Filter by format (only if a format is selected)
    if (selectedFormat) {
      filtered = filtered.filter(showtime => 
        showtime.screen?.screenType?.toLowerCase() === selectedFormat.toLowerCase()
      );
    }

    // Filter by favorite theaters if enabled
    if (showFavoritesOnly && favoriteTheaterIds.size > 0) {
      filtered = filtered.filter(showtime => 
        favoriteTheaterIds.has(showtime.screen.theater.id)
      );
    }

    // Always set filtered showtimes, even if empty (so we can show the message)
    setFilteredShowtimes(filtered);
  }

  // Get available dates for date selector
  const availableDates = [...new Set(showtimes.map(s => s.showDate))].sort((a, b) => a.localeCompare(b));
  
  // Get available languages
  const availableLanguages = movie ? [...new Set(movie.language)] : [];
  
  // Get available formats
  const availableFormats = [...new Set(showtimes.map(s => s.screen?.screenType || '2D'))].sort((a, b) => a.localeCompare(b));

  // Group showtimes by date, then by theater - BookMyShow Style
  // Normalize dates for grouping
  const groupedShowtimes = filteredShowtimes.reduce((acc, showtime) => {
    const dateStr = new Date(showtime.showDate).toISOString().split('T')[0];
    const theaterName = showtime.screen.theater.name;
    const theaterId = showtime.screen.theater.id;
    
    // Use theaterId as key to handle theaters with same name
    const theaterKey = `${theaterId}_${theaterName}`;
    
    if (!acc[dateStr]) acc[dateStr] = {};
    if (!acc[dateStr][theaterKey]) {
      acc[dateStr][theaterKey] = {
        theater: showtime.screen.theater,
        showtimes: []
      };
    }
    
    acc[dateStr][theaterKey].showtimes.push(showtime);
    return acc;
  }, {} as Record<string, Record<string, { theater: any, showtimes: Showtime[] }>>);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 animate-page-fade-in">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading theaters...</div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center animate-page-fade-in">
          <div className="text-red-600 text-xl mb-4">⚠️ {error || 'Movie not found'}</div>
          <button
            onClick={() => onNavigate('movies')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page-fade-in">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('movie-detail', movieId)}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-all duration-300 hover:gap-3 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Movie</span>
        </button>

        {/* Movie Header - BookMyShow Style */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'en' ? movie.title : movie.titleNe}
            {movie.language && movie.language.length > 0 && (
              <span className="text-xl font-normal text-gray-600 dark:text-gray-400 ml-2">
                - ({movie.language[0]})
              </span>
            )}
          </h1>
          {/* Movie Attributes - BookMyShow Style */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              Movie runtime: {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            </span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              {movie.rating}
            </span>
            {movie.genre.slice(0, 2).map((genre) => (
              <span key={genre} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Date Selector - BookMyShow Style */}
        {availableDates.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const selectedDateStr = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : '';
                const isSelected = date === selectedDateStr;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-red-300'
                  }`}
                >
                  <div className="text-xs uppercase">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-sm">{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </button>
              );
            })}
          </div>
        </div>
        )}

        {/* Filters - BookMyShow Style */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          {/* Language/Format Filter */}
          {availableLanguages.length > 0 && (
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Languages</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          {/* Format Filter */}
          {availableFormats.length > 0 && (
            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Formats</option>
                {availableFormats.map((format) => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>
          )}

          {/* Favorites Filter Toggle */}
          {favoriteTheaterIds.size > 0 && (
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFavoritesOnly 
                  ? 'bg-red-50 border-red-300 text-red-700' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-red-600 text-red-600' : 'text-gray-400'}`} />
              <span className="font-medium text-sm">My Favorites</span>
            </button>
          )}
        </div>

        {/* Theaters with Showtimes - BookMyShow Style */}
        {showtimes.length === 0 ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
            <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-blue-700 dark:text-blue-300 font-medium mb-2">
              No showtimes available
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              Check back later for showtimes or contact the theater for more information.
            </p>
          </div>
        ) : filteredShowtimes.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <Calendar className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-yellow-700 dark:text-yellow-300 font-medium mb-2">
              No showtimes match your filters
            </p>
            <p className="text-yellow-600 dark:text-yellow-400 text-sm mb-4">
              Try adjusting your filters to see more showtimes.
            </p>
            <button
              onClick={() => {
                setSelectedDate('');
                setSelectedLanguage('');
                setSelectedFormat('');
                setShowFavoritesOnly(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedShowtimes).map(([date, theaters], dateIndex) => (
              <div key={date} className="animate-page-fade-in" style={{ animationDelay: `${dateIndex * 0.1}s` }}>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(theaters).map(([theaterKey, theaterData], theaterIndex) => {
                    const theater = theaterData.theater;
                    const showtimes = theaterData.showtimes;
                    const theaterName = theater.name;
                    
                    return (
                      <div
                        key={theaterKey}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-red-300 dark:hover:border-red-600 transition-all duration-300"
                        style={{ animationDelay: `${(dateIndex * 0.1) + (theaterIndex * 0.05)}s` }}
                      >
                        {/* Theater Header - BookMyShow Style */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-start gap-3">
                            {/* Theater Logo Placeholder - BookMyShow Style */}
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-600 dark:text-gray-400 font-bold text-xs">
                                {theaterName.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{theaterName}</h4>
                                {favoriteTheaterIds.has(theater.id) && (
                                  <Heart className="w-5 h-5 fill-red-600 text-red-600" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>{theater.area || theater.city}</span>
                                <span className="text-gray-400">•</span>
                                <span className="flex items-center gap-1 text-xs cursor-pointer hover:text-red-600">
                                  <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-gray-400">i</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Showtimes Grid - BookMyShow Style */}
                        <div className="p-4">
                          <div className="flex flex-wrap gap-3">
                            {showtimes.map((showtime) => {
                              const isFastFilling = showtime.availableSeats > 0 && showtime.availableSeats <= 10;
                              const isSoldOut = showtime.availableSeats === 0;
                              
                              // Format label for display (like "GOLD", "ATMOS", "PXL", "LASER")
                              const formatLabel = showtime.screen?.screenType || showtime.format || '2D';
                              const languageLabel = showtime.language || movie?.language?.[0] || '';
                              
                              return (
                                <button
                                  key={showtime.id}
                                  onClick={() => {
                                    if (!isAuthenticated) {
                                      localStorage.setItem('redirectAfterLogin', JSON.stringify({ page: 'booking-page', id: showtime.id }));
                                      onNavigate('login');
                                      return;
                                    }
                                    onNavigate('booking-page', showtime.id);
                                  }}
                                  disabled={isSoldOut}
                                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    isSoldOut
                                      ? 'border-2 border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                      : isFastFilling
                                      ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-md active:scale-95'
                                      : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md active:scale-95'
                                  }`}
                                >
                                  <div className="flex flex-col items-start">
                                    <span>{showtime.showTime}</span>
                                    {languageLabel && <span className="text-xs mt-0.5">{languageLabel}</span>}
                                    {formatLabel && formatLabel !== '2D' && (
                                      <span className="text-xs mt-0.5 font-bold">{formatLabel}</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {/* Cancellation Available - BookMyShow Style */}
                          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            Cancellation available
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
