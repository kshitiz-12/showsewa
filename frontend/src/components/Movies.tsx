import { useEffect, useState } from 'react';
import { Search, Filter, Heart, SlidersHorizontal, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCity } from '../contexts/CityContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface Movie {
  id: string;
  title: string;
  titleNe: string;
  description: string;
  descriptionNe: string;
  posterUrl: string;
  genre: string[] | string;
  rating: string;
  language: string[] | string;
  duration: number;
  releaseDate?: string;
  showtimes?: Showtime[];
}

interface Showtime {
  id: string;
  showDate: string;
  showTime: string;
  price: number;
  availableSeats: number;
  screen: {
    id: string;
    name: string;
    theater: {
      id: string;
      name: string;
      city: string;
    };
  };
}

interface MoviesProps {
  onNavigate: (page: string, id?: string) => void;
}

export function Movies({ onNavigate }: MoviesProps) {
  const { language, t } = useLanguage();
  const { selectedCity } = useCity();
  const { favoriteTheaterIds } = useFavorites();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'trending' | 'release' | 'rating' | 'name'>('trending');

  useEffect(() => {
    loadMovies();
  }, [selectedCity]); // Reload when city changes

  useEffect(() => {
    filterMovies();
  }, [movies, searchQuery, showFavoritesOnly, favoriteTheaterIds, selectedGenres, selectedLanguages, sortBy, language]);

  async function loadMovies() {
    setLoading(true);
    setError(null);
    try {
      // Build URL - only add city filter if city is selected and not empty
      let url = 'http://localhost:5000/api/movies';
      if (selectedCity && selectedCity.trim()) {
        url += `?city=${encodeURIComponent(selectedCity)}`;
      }

      console.log('Fetching movies from:', url);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Movies API response:', { 
          success: data.success, 
          count: data.data?.movies?.length || 0,
          city: selectedCity 
        });
        
        if (data.success) {
          const fetchedMovies = data.data.movies || [];
          
          // If city filter returned no results and a city is selected, try fallback to all movies
          if (fetchedMovies.length === 0 && selectedCity && selectedCity.trim()) {
            console.log('No movies found for city, trying fallback to all movies...');
            const fallbackResponse = await fetch('http://localhost:5000/api/movies');
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.success) {
                const allMovies = fallbackData.data.movies || [];
                console.log('Fallback found', allMovies.length, 'movies');
                setMovies(allMovies);
                setFilteredMovies(allMovies);
                // Don't show error, just use fallback results
                return;
              }
            }
          }
          
          setMovies(fetchedMovies);
          setFilteredMovies(fetchedMovies);
        } else {
          setError(data.message || 'Failed to load movies');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to load movies');
        console.error('Movies API error:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error loading movies:', error);
      setError('Failed to load movies. Please check your connection.');
      setMovies([]);
      setFilteredMovies([]);
    } finally {
      setLoading(false);
    }
  }

  function filterMovies() {
    let filtered = movies;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(movie => {
        const title = language === 'en' ? movie.title : movie.titleNe;
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(movie => {
        const movieGenres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
        return selectedGenres.some(genre => 
          movieGenres.some((g: string) => g.toLowerCase().includes(genre.toLowerCase()))
        );
      });
    }

    // Language filter
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(movie => {
        const movieLanguages = Array.isArray(movie.language) ? movie.language : [movie.language];
        return selectedLanguages.some(lang => 
          movieLanguages.some((l: string) => l.toLowerCase().includes(lang.toLowerCase()))
        );
      });
    }

    // Favorite theaters filter
    if (showFavoritesOnly && favoriteTheaterIds.size > 0) {
      filtered = filtered.filter(movie => {
        return movie.showtimes?.some((showtime: Showtime) => 
          favoriteTheaterIds.has(showtime.screen.theater.id)
        );
      });
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'release':
          return new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
        case 'rating':
          return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
        case 'name':
          const titleA = (language === 'en' ? a.title : a.titleNe).toLowerCase();
          const titleB = (language === 'en' ? b.title : b.titleNe).toLowerCase();
          return titleA.localeCompare(titleB);
        case 'trending':
        default:
          // Keep original order (trending first from API)
          return 0;
      }
    });

    setFilteredMovies(filtered);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 animate-page-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-page-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('movies.title')}
          </h1>

          {/* Search and Filter Bar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies by title..."
                  className="input pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="trending">Trending</option>
                  <option value="release">Newest Release</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">A-Z</option>
                </select>
                
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                    showFilters || selectedGenres.length > 0 || selectedLanguages.length > 0
                      ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="font-medium">Filters</span>
                  {(selectedGenres.length > 0 || selectedLanguages.length > 0) && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {selectedGenres.length + selectedLanguages.length}
                    </span>
                  )}
                </button>
                
                {/* Favorites Filter */}
                {favoriteTheaterIds.size > 0 && (
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                      showFavoritesOnly 
                        ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400' 
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-red-600 text-red-600' : 'text-gray-400'}`} />
                    <span className="font-medium">Favorites</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      showFavoritesOnly ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {favoriteTheaterIds.size}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-page-fade-in shadow-lg">
                {/* Genres */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Action', 'Comedy', 'Drama', 'Thriller', 'Romance', 'Horror', 'Sci-Fi', 'Adventure', 'Fantasy', 'Animation'].map((genre) => (
                      <button
                        key={genre}
                        onClick={() => {
                          setSelectedGenres(prev =>
                            prev.includes(genre) 
                              ? prev.filter(g => g !== genre)
                              : [...prev, genre]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedGenres.includes(genre)
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['English', 'Hindi', 'Nepali', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguages(prev =>
                            prev.includes(lang) 
                              ? prev.filter(l => l !== lang)
                              : [...prev, lang]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedLanguages.includes(lang)
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedGenres.length > 0 || selectedLanguages.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedGenres([]);
                      setSelectedLanguages([]);
                    }}
                    className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              <div className="text-gray-600 dark:text-gray-400">Loading movies...</div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20 animate-page-fade-in">
            <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
            <button
              onClick={loadMovies}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-16 animate-page-fade-in">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery ? 'No movies found matching your search' : 'No movies available'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Showing <strong className="text-gray-900 dark:text-white">{filteredMovies.length}</strong> of <strong className="text-gray-900 dark:text-white">{movies.length}</strong> movies
              </span>
              {(selectedGenres.length > 0 || selectedLanguages.length > 0 || showFavoritesOnly) && (
                <button
                  onClick={() => {
                    setSelectedGenres([]);
                    setSelectedLanguages([]);
                    setShowFavoritesOnly(false);
                    setSearchQuery('');
                  }}
                  className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie, index) => (
              <div
                key={movie.id}
                className="group cursor-pointer animate-page-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => onNavigate('movie-detail', movie.id)}
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
                  <img
                    src={movie.posterUrl}
                    alt={language === 'en' ? movie.title : movie.titleNe}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    {movie.rating}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            // Fetch showtimes for this specific movie
                            const response = await fetch(`http://localhost:5000/api/movies/${movie.id}`);
                            const data = await response.json();
                            if (data.success && data.data.movie.showtimes && data.data.movie.showtimes.length > 0) {
                              // Use the first available showtime for this movie
                              const firstShowtime = data.data.movie.showtimes[0];
                              onNavigate('booking-page', firstShowtime.id);
                            } else {
                              // If no showtimes found, navigate to movie detail page instead
                              onNavigate('movie-detail', movie.id);
                            }
                          } catch (error) {
                            console.error('Error fetching movie showtimes:', error);
                            // Fallback to movie detail page
                            onNavigate('movie-detail', movie.id);
                          }
                        }}
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                      >
                        {t('home.book_now')}
                      </button>
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {language === 'en' ? movie.title : movie.titleNe}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {movie.genre.join(', ')} • {movie.language.join(', ')}
                </p>
              </div>
            ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
