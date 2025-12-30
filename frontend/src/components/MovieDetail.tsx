import { useEffect, useState } from 'react';
import { Clock, Film, ArrowLeft, Play, Image as ImageIcon, Star, Ticket, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCity } from '../contexts/CityContext';
import { useAuth } from '../contexts/AuthContext';
import { ReviewSection } from './ReviewSection';
import { API_BASE_URL } from '../config/api';

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
  showtimes?: any[]; // Showtimes are handled in TheaterSelectionPage
}


interface MovieDetailProps {
  movieId: string;
  onNavigate: (page: string, id?: string) => void;
}

export function MovieDetail({ movieId, onNavigate }: Readonly<MovieDetailProps>) {
  const { language, t } = useLanguage();
  const { selectedCity } = useCity();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMovie();
  }, [movieId, selectedCity]); // Reload when city changes

  async function loadMovie() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}?city=${selectedCity}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMovie(data.data.movie);
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
                loading="eager"
                decoding="async"
                fetchPriority="high"
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
                        loading="lazy"
                        decoding="async"
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

              {/* Book Now Button */}
              <div className="mb-8">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      localStorage.setItem('redirectAfterLogin', JSON.stringify({ page: 'theater-selection', id: movieId }));
                      onNavigate('login');
                      return;
                    }
                    onNavigate('theater-selection', movieId);
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Ticket className="w-6 h-6" />
                  Book Now
                </button>
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
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      )}
    </div>
  );
}

