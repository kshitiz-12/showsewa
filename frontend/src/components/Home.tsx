import { useEffect, useState } from 'react';
import { ArrowRight, Star, Play, Users, Award, Zap, Heart, TrendingUp, Film, Music, Clock, Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCity } from '../contexts/CityContext';
import { supabase } from '../lib/supabase';
import { CurvyCarousel } from './CurvyCarousel';

interface Event {
  id: string;
  title: string;
  titleNe: string;
  imageUrl: string;
  venue: string;
  venueNe: string;
  eventDate: string;
  priceMin: number;
  priceMax: number;
  category: string;
}

interface Movie {
  id: string;
  title: string;
  titleNe: string;
  posterUrl: string;
  genre: string[] | string;
  duration: number;
  language: string[] | string;
  rating: string;
  releaseDate: string;
  trailerUrl: string;
  imdbRating: number;
}

interface HomeProps {
  onNavigate: (page: string, id?: string) => void;
}

export function Home({ onNavigate }: Readonly<HomeProps>) {
  const { language } = useLanguage();
  const { selectedCity } = useCity();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [incomingEvents, setIncomingEvents] = useState<Event[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCity]); // Reload when city changes

  async function loadData() {
    setDataLoading(true);
    try {
      console.log('🔄 Loading carousel data...');
      
      // Build URLs - only include city parameter if a city is selected
      const cityParam = selectedCity && selectedCity.trim() ? `&city=${encodeURIComponent(selectedCity)}` : '';
      
      // Load carousel data (more events and movies for carousel)
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const [eventsResponse, incomingEventsResponse, moviesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/events?featured=true&limit=6${cityParam}`),
        fetch(`${API_BASE_URL}/api/events?incoming=true&limit=4${cityParam}`),
        fetch(`${API_BASE_URL}/api/movies/trending?limit=6${cityParam}`)
      ]);

      console.log('📡 API Responses:', {
        events: { ok: eventsResponse.ok, status: eventsResponse.status },
        incomingEvents: { ok: incomingEventsResponse.ok, status: incomingEventsResponse.status },
        movies: { ok: moviesResponse.ok, status: moviesResponse.status }
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        console.log('🎪 Events data:', eventsData);
        if (eventsData.success) {
          const featuredRaw = (eventsData.data.events || []) as Event[];
          const unique: Event[] = Array.from(
            new Map<string, Event>(featuredRaw.map((e: Event) => [e.id, e])).values()
          ).slice(0, 6);
          setFeaturedEvents(unique);
          console.log('✅ Set featured events:', unique.length || 0);
          // Backfill to 6 if needed with general events of same city
          if (unique.length < 6) {
            console.log('ℹ️ Backfilling featured with general events...');
            const fallbackCityParam = selectedCity && selectedCity.trim() ? `&city=${encodeURIComponent(selectedCity)}` : '';
            const fallback = await fetch(`http://localhost:5000/api/events?limit=6${fallbackCityParam}`);
            if (fallback.ok) {
              const fb = await fallback.json();
              if (fb.success) {
                const pool = (fb.data.events || []) as Event[];
                const map = new Map<string, Event>(unique.map((e: Event) => [e.id, e]));
                for (const ev of pool) {
                  if (!map.has(ev.id)) map.set(ev.id, ev);
                  if (map.size >= 6) break;
                }
                const filled: Event[] = Array.from(map.values()).slice(0, 6);
                setFeaturedEvents(filled);
                console.log('✅ Featured after backfill:', filled.length);
              }
            }
          }
        }
      } else {
        console.error('❌ Events API failed:', eventsResponse.status, eventsResponse.statusText);
      }

      if (incomingEventsResponse.ok) {
        const incomingEventsData = await incomingEventsResponse.json();
        console.log('🕐 Incoming events data:', incomingEventsData);
        if (incomingEventsData.success) {
          setIncomingEvents(incomingEventsData.data.events || []);
          console.log('✅ Set incoming events:', incomingEventsData.data.events?.length || 0);
        }
      } else {
        console.error('❌ Incoming events API failed:', incomingEventsResponse.status, incomingEventsResponse.statusText);
      }

      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json();
        console.log('🎬 Movies data:', moviesData);
        if (moviesData.success) {
          const movies = moviesData.data.movies || [];
          setTrendingMovies(movies);
          console.log('✅ Set trending movies:', movies.length);
          
          // If no movies found with city filter, try without city filter
          if (movies.length === 0) {
            console.log('⚠️ No movies found for city. Fetching without city filter...');
            const fallbackResponse = await fetch(`${API_BASE_URL}/api/movies/trending?limit=6`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.success) {
                setTrendingMovies(fallbackData.data.movies || []);
                console.log('✅ Set trending movies (fallback):', fallbackData.data.movies?.length || 0);
              }
            }
          }
        }
      } else {
        console.error('❌ Movies API failed:', moviesResponse.status, moviesResponse.statusText);
      }
    } catch (error) {
      console.error('❌ Error loading carousel data:', error);
    } finally {
      setDataLoading(false);
    }
  }

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter')
        .insert([{ email, language }]);

      if (error) throw error;
      alert('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-red-900 via-red-800 to-red-700 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center w-full">
            {/* Left Content */}
            <div className="text-white space-y-4 sm:space-y-6 animate-fade-in-up">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent animate-gradient">
                    Book Your Entertainment
                  </span>
                  <br />
                  <span className="text-white animate-slide-in-left">Experience</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-200 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Discover and book tickets for concerts, movies, sports, and events across Nepal
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <button
                  onClick={() => onNavigate('movies')}
                  className="btn-primary px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95"
                >
                  <Film className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
                  Explore Movies
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => onNavigate('events')}
                  className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 hover:shadow-2xl flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <Music className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 hover:rotate-12" />
                  Discover Events
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 hover:scale-110" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span>50K+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span>Trusted Platform</span>
                </div>
              </div>
            </div>

            {/* Right Content - Trending Card */}
            <div className="relative hidden lg:block animate-slide-in-right">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Trending Now</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Most popular this week</p>
                  </div>
                </div>
                
                {dataLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse w-1/2"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trendingMovies.length > 0 ? (
                      trendingMovies.slice(0, 3).map((movie) => (
                        <div key={movie.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                          <div className="w-12 h-16 rounded-lg flex-shrink-0 overflow-hidden">
                            {movie.posterUrl ? (
                              <img 
                                src={movie.posterUrl} 
                                alt={movie.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full bg-gray-600 flex items-center justify-center" style={{ display: movie.posterUrl ? 'none' : 'flex' }}>
                              <Film className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{movie.title}</p>
                            <p className="text-gray-300 text-sm">{movie.genre}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-300 text-sm">No trending movies available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Featured Content
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover the most popular movies and events happening around you
            </p>
          </div>

          <div className="space-y-16">
            {/* Trending Movies Section */}
            <div className="stagger-item">
              <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Movies</h3>
                    <p className="text-gray-600 dark:text-gray-400">Most popular movies right now</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('movies')}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-all duration-300 hover:gap-3 group"
                >
                  View All
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              {dataLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                </div>
              ) : trendingMovies.length > 0 ? (
                <CurvyCarousel
                  items={trendingMovies.map(movie => ({
                    id: movie.id,
                    title: movie.title,
                    subtitle: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
                    image: movie.posterUrl,
                    trailerUrl: movie.trailerUrl,
                    type: 'movie' as const
                  }))}
                  onItemClick={(item) => onNavigate('movie-detail', item.id)}
                  autoPlayInterval={5000}
                  variant="section"
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Film className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Trending Movies</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Check back soon for trending movies!</p>
                  <button
                    onClick={() => onNavigate('movies')}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
                  >
                    Browse All Movies
                  </button>
                </div>
              )}
            </div>

            {/* Featured Events Section */}
            <div className="stagger-item">
              <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Events</h3>
                    <p className="text-gray-600 dark:text-gray-400">Don't miss these amazing events</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('events')}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-all duration-300 hover:gap-3 group"
                >
                  View All
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              {dataLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                </div>
              ) : featuredEvents.length > 0 ? (
                <CurvyCarousel
                  items={featuredEvents.map(event => ({
                    id: event.id,
                    title: event.title,
                    subtitle: event.venue,
                    image: event.imageUrl,
                    type: 'event' as const
                  }))}
                  onItemClick={(item) => onNavigate('event-detail', item.id)}
                  autoPlayInterval={5000}
                  variant="section"
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Featured Events</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Check back soon for featured events!</p>
                  <button
                    onClick={() => onNavigate('events')}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
                  >
                    Browse All Events
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Incoming Events Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Incoming Events</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Events starting soon</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 sm:px-6 sm:py-2 rounded-lg font-semibold text-sm sm:text-base hover:from-red-600 hover:to-red-700 transition-all duration-300 whitespace-nowrap self-start sm:self-auto"
              >
                View All Events
              </button>
            </div>

            {incomingEvents.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {incomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onNavigate('event-detail', event.id)}
                    className="card hover:lift cursor-pointer group overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={language === 'en' ? event.title : event.titleNe}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`hidden w-full h-full flex items-center justify-center`}>
                        <Music className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="badge-red absolute top-3 left-3">
                        Coming Soon
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2">
                        {language === 'en' ? event.title : event.titleNe}
                      </h4>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{language === 'en' ? event.venue : event.venueNe}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                        <span className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                          NPR {event.priceMin}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize truncate">
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Incoming Events</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Check back later for upcoming events</p>
                <button
                  onClick={() => onNavigate('events')}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
                >
                  Browse All Events
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section - Classic & Elegant */}
      <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Why Choose ShowSewa?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience excellence in entertainment booking
            </p>
            <div className="w-24 h-1 bg-red-600 mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Lightning Fast",
                description: "Book tickets in seconds with our optimized booking system"
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: "Personalized",
                description: "Get recommendations based on your preferences and history"
              },
              {
                icon: <Award className="w-6 h-6" />,
                title: "Premium Quality",
                description: "Access to the best venues and exclusive events"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Trusted Community",
                description: "Join thousands of entertainment enthusiasts"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-600 rounded-lg transition-all duration-300 group-hover:bg-red-700">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-red-900 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Book Your Next Adventure?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Join thousands of satisfied customers who trust ShowSewa for their entertainment needs
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('movies')}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Film className="w-5 h-5" />
                Browse Movies
              </button>
              <button
                onClick={() => onNavigate('events')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Music className="w-5 h-5" />
                Explore Events
              </button>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">4.9/5</div>
                <div className="text-gray-400">User Rating</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">50K+</div>
                <div className="text-gray-400">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">100+</div>
                <div className="text-gray-400">Events</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}