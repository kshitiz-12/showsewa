import { useEffect, useState } from 'react';
import { Clock, Film, Calendar, ArrowLeft, Play, Image as ImageIcon, Star, Heart, MapPin, Ticket } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCity } from '../contexts/CityContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { ReviewSection } from './ReviewSection';

interface Movie {
  id: string;
  title: string;
  titleNe: string;
  description: string;
  descriptionNe: string;
  posterUrl: string;
  genre: string[];
  duration: number;
  language: string[];
  rating: string;
  releaseDate: string;
  trailerUrl?: string;
  galleryImages: string[];
  director?: string;
  cast: string[];
  imdbRating?: number;
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
    theater: {
      id: string;
      name: string;
      city: string;
      amenities?: string[];
    };
  };
}

interface MovieDetailProps {
  movieId: string;
  onNavigate: (page: string, id?: string) => void;
}

export function MovieDetail({ movieId, onNavigate }: Readonly<MovieDetailProps>) {
  const { language, t } = useLanguage();
  const { selectedCity } = useCity();
  const { favoriteTheaterIds } = useFavorites();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMovie();
  }, [movieId, selectedCity]); // Reload when city changes

  useEffect(() => {
    filterShowtimes();
  }, [showtimes, showFavoritesOnly, favoriteTheaterIds]);

  async function loadMovie() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/movies/${movieId}?city=${selectedCity}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMovie(data.data.movie);
          // Filter showtimes by selected city
          if (data.data.movie.showtimes) {
            const cityShowtimes = data.data.movie.showtimes.filter((showtime: Showtime) => 
              showtime.screen.theater.city.toLowerCase() === selectedCity.toLowerCase()
            );
            setShowtimes(cityShowtimes);
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
    let filtered = showtimes;

    // Filter by favorite theaters if enabled
    if (showFavoritesOnly && favoriteTheaterIds.size > 0) {
      filtered = filtered.filter(showtime => 
        favoriteTheaterIds.has(showtime.screen.theater.id)
      );
    }

    setFilteredShowtimes(filtered);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 animate-page-fade-in">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading movie details...</div>
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

  // Group showtimes by date, then by theater for better organization
  const groupedShowtimes = filteredShowtimes.reduce((acc, showtime) => {
    const date = showtime.showDate;
    const theaterName = showtime.screen.theater.name;
    
    if (!acc[date]) acc[date] = {};
    if (!acc[date][theaterName]) acc[date][theaterName] = [];
    
    acc[date][theaterName].push(showtime);
    return acc;
  }, {} as Record<string, Record<string, Showtime[]>>);

  // Extract YouTube video ID for embedding
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = regExp.exec(url);
    return (match?.[2]?.length === 11) ? match[2] : null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page-fade-in">
        <button
          onClick={() => onNavigate('movies')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-all duration-300 hover:gap-3 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Movies</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            {/* Movie Poster */}
            <div className="relative group">
              <img
                src={movie.posterUrl}
                alt={language === 'en' ? movie.title : movie.titleNe}
                className="w-full rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {movie.trailerUrl && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="bg-red-600 rounded-full p-4">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </button>
              )}
            </div>

            {/* Gallery Images */}
            {movie.galleryImages && movie.galleryImages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-red-600" />
                  Gallery
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {movie.galleryImages.slice(0, 4).map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className="w-full h-24 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <img
                        src={image}
                        alt="Gallery thumbnail"
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
                {movie.galleryImages.length > 4 && (
                  <button
                    onClick={() => setSelectedImage(movie.galleryImages[0])}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    View All ({movie.galleryImages.length} images)
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {language === 'en' ? movie.title : movie.titleNe}
                  </h1>
                  {movie.imdbRating && (
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {movie.imdbRating}/10
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">IMDb</span>
                    </div>
                  )}
                </div>
                <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-semibold">
                  {movie.rating}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Film className="w-5 h-5 text-red-600" />
                  <span>{movie.genre.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span>{movie.duration} {t('movies.minutes')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mb-6 space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Language:</span> <span className="text-gray-900 dark:text-white">{movie.language.join(', ')}</span>
                </div>
                {movie.director && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Director:</span> <span className="text-gray-900 dark:text-white">{movie.director}</span>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Cast:</span> <span className="text-gray-900 dark:text-white">{movie.cast.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Synopsis
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {language === 'en' ? movie.description : movie.descriptionNe}
                </p>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-red-600" />
                    Showtimes
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
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
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          showFavoritesOnly ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {favoriteTheaterIds.size}
                        </span>
                      </button>
                    )}
                    
                    {/* Summary Stats */}
                    {filteredShowtimes.length > 0 && (
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {Object.keys(groupedShowtimes).length} date{Object.keys(groupedShowtimes).length > 1 ? 's' : ''}
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg flex items-center gap-2">
                          <Film className="w-4 h-4" />
                          {Object.values(groupedShowtimes).reduce((total, theaters) => total + Object.keys(theaters).length, 0)} theater{Object.values(groupedShowtimes).reduce((total, theaters) => total + Object.keys(theaters).length, 0) > 1 ? 's' : ''}
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {filteredShowtimes.length} showtime{filteredShowtimes.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {Object.keys(groupedShowtimes).length === 0 ? (
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
                  <div className="space-y-8">
                    {Object.entries(groupedShowtimes).map(([date, theaters], dateIndex) => (
                      <div key={date} className="animate-page-fade-in" style={{ animationDelay: `${dateIndex * 0.1}s` }}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                          <Calendar className="w-6 h-6 text-red-600" />
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        
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
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                  {showtimes.map((showtime) => (
                                    <button
                                      key={showtime.id}
                                      onClick={() => onNavigate('booking-page', showtime.id)}
                                      className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-red-500 hover:shadow-lg rounded-xl p-4 transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                      <div className="text-center">
                                        <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 mb-1">
                                          {showtime.showTime}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                          {showtime.availableSeats > 0 ? (
                                            <span className="text-green-600 dark:text-green-400 font-medium">{showtime.availableSeats} seats</span>
                                          ) : (
                                            <span className="text-red-600 dark:text-red-400 font-medium">Sold out</span>
                                          )}
                                        </div>
                                        <div className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                                          NPR {showtime.price}
                                        </div>
                                      </div>
                                      
                                      {/* Click to Book indicator */}
                                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Book →
                                      </div>
                                    </button>
                                  ))}
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
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <ReviewSection movieId={movieId} />
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailerUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white text-2xl font-bold hover:text-gray-300"
            >
              ×
            </button>
            <div className="aspect-video">
              {(() => {
                const videoId = getYouTubeVideoId(movie.trailerUrl);
                if (videoId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      title="Movie Trailer"
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                    <p className="text-white">Unable to load trailer</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-2xl font-bold hover:text-gray-300 z-10"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Gallery view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

