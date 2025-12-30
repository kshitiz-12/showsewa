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
    let filtered = [...showtimes]; // Start with all showtimes

    // Filter by selected date (only if a date is selected)
    if (selectedDate) {
      filtered = filtered.filter(showtime => showtime.showDate === selectedDate);
    }

    // Filter by language (only if a language is selected)
    if (selectedLanguage) {
      filtered = filtered.filter(showtime => 
        movie?.language.some(lang => lang.toLowerCase() === selectedLanguage.toLowerCase())
      );
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

    setFilteredShowtimes(filtered);
  }

  // Get available dates for date selector
  const availableDates = [...new Set(showtimes.map(s => s.showDate))].sort((a, b) => a.localeCompare(b));
  
  // Get available languages
  const availableLanguages = movie ? [...new Set(movie.language)] : [];
  
  // Get available formats
  const availableFormats = [...new Set(showtimes.map(s => s.screen?.screenType || '2D'))].sort((a, b) => a.localeCompare(b));

  // Group showtimes by date, then by theater
  const groupedShowtimes = filteredShowtimes.reduce((acc, showtime) => {
    const date = showtime.showDate;
    const theaterName = showtime.screen.theater.name;
    
    if (!acc[date]) acc[date] = {};
    if (!acc[date][theaterName]) acc[date][theaterName] = [];
    
    acc[date][theaterName].push(showtime);
    return acc;
  }, {} as Record<string, Record<string, Showtime[]>>);

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
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-6">
            <img
              src={movie.posterUrl}
              alt={language === 'en' ? movie.title : movie.titleNe}
              className="w-24 h-36 rounded-lg object-cover shadow-md"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'en' ? movie.title : movie.titleNe}
                {movie.language && movie.language.length > 0 && (
                  <span className="text-xl font-normal text-gray-600 dark:text-gray-400 ml-2">
                    - ({movie.language[0]})
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedCity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector - BookMyShow Style */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {availableDates.map((date) => {
              const dateObj = new Date(date);
              const isSelected = date === selectedDate;
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
        {filteredShowtimes.length === 0 ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
            <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-blue-700 dark:text-blue-300 font-medium mb-2">
              {showFavoritesOnly ? 'No showtimes in favorite theaters' : 'No showtimes available'}
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              {showFavoritesOnly 
                ? 'Try turning off the favorites filter or add more theaters to your favorites.'
                : 'Check back later for showtimes or contact the theater for more information.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedShowtimes).map(([date, theaters], dateIndex) => (
              <div key={date} className="animate-page-fade-in" style={{ animationDelay: `${dateIndex * 0.1}s` }}>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(theaters).map(([theaterName, showtimes], theaterIndex) => (
                    <div
                      key={theaterName}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-red-300 dark:hover:border-red-600 transition-all duration-300"
                      style={{ animationDelay: `${(dateIndex * 0.1) + (theaterIndex * 0.05)}s` }}
                    >
                      {/* Theater Header - BookMyShow Style */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{theaterName}</h4>
                              {favoriteTheaterIds.has(showtimes[0]?.screen.theater.id) && (
                                <Heart className="w-5 h-5 fill-red-600 text-red-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {showtimes[0]?.screen.theater.city}
                              </span>
                              {showtimes[0]?.screen.theater.amenities && showtimes[0].screen.theater.amenities.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Ticket className="w-4 h-4" />
                                  {showtimes[0].screen.theater.amenities.slice(0, 2).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                            {showtimes.length} showtime{showtimes.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      {/* Showtimes Grid - BookMyShow Style */}
                      <div className="p-4">
                        <div className="flex flex-wrap gap-3">
                          {showtimes.map((showtime) => {
                            const isFastFilling = showtime.availableSeats > 0 && showtime.availableSeats <= 10;
                            const isSoldOut = showtime.availableSeats === 0;
                            
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
                                className={`px-6 py-3 rounded-lg border-2 font-semibold text-base transition-all duration-200 ${
                                  isSoldOut
                                    ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                                    : isFastFilling
                                    ? 'border-yellow-500 text-orange-600 bg-white hover:bg-yellow-50 hover:shadow-md active:scale-95'
                                    : 'border-green-500 text-orange-600 bg-white hover:bg-green-50 hover:shadow-md active:scale-95'
                                }`}
                              >
                                {showtime.showTime}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
