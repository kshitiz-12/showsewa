import { useEffect, useState } from 'react';
import { Search, Calendar, MapPin, Filter, Clock, Music } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCity } from '../contexts/CityContext';
// Removed unused supabase import

interface Event {
  id: string;
  title: string;
  titleNe: string;
  description: string;
  descriptionNe: string;
  category: string;
  imageUrl: string;
  venue: string;
  venueNe: string;
  eventDate: string;
  priceMin?: number;
  priceMax?: number;
}

interface EventsProps {
  readonly onNavigate: (page: string, id?: string) => void;
}

export function Events({ onNavigate }: EventsProps) {
  const { language, t } = useLanguage();
  const { selectedCity } = useCity();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showIncomingOnly, setShowIncomingOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: t('events.filter_all') },
    { id: 'concert', label: t('events.filter_concert') },
    { id: 'festival', label: t('events.filter_festival') },
    { id: 'sports', label: t('events.filter_sports') },
    { id: 'theater', label: t('events.filter_theater') }
  ];

  useEffect(() => {
    loadEvents();
  }, [selectedCity, showIncomingOnly]); // Reload when city or incoming filter changes

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedCategory, showIncomingOnly]);

  async function loadEvents() {
    setLoading(true);
    try {
      // Use backend API instead of Supabase for better filtering
      const response = await fetch(`http://localhost:5000/api/events?city=${selectedCity}&incoming=${showIncomingOnly}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEvents(data.data.events || []);
          setFilteredEvents(data.data.events || []);
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to empty array
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function filterEvents() {
    let filtered = events;

    const normalizeCategory = (value: string) => {
      if (!value) return '';
      const lower = value.toLowerCase().trim();
      // Convert plurals like "concerts", "sports" to singular base for matching
      return lower.endsWith('s') ? lower.slice(0, -1) : lower;
    };

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => 
        normalizeCategory(event.category) === normalizeCategory(selectedCategory)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(event => {
        const title = language === 'en' ? event.title : event.titleNe;
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    setFilteredEvents(filtered);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            {t('events.title')}
          </h1>

          {/* Search and Filters - BookMyShow Style */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('events.search_placeholder')}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                />
              </div>
              
              {/* Incoming Events Toggle */}
              <button
                onClick={() => setShowIncomingOnly(!showIncomingOnly)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors border text-sm sm:text-base ${
                  showIncomingOnly 
                    ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400' 
                    : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Clock className={`w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 ${showIncomingOnly ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
                Incoming Events
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium whitespace-nowrap transition-all text-xs sm:text-sm ${
                    selectedCategory === category.id
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

{loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden shadow-sm sm:shadow-lg animate-pulse">
                <div className="h-40 sm:h-48 lg:h-56 bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-4 sm:h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Events Found
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your filters to see more results'
                : 'Check back soon for upcoming events!'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="bg-red-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => onNavigate('event-detail', event.id)}
              >
                <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={language === 'en' ? event.title : event.titleNe}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="hidden absolute inset-0 flex items-center justify-center">
                    <Music className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <span className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase shadow-md">
                      {event.category}
                    </span>
                  </div>
                  {/* Price Badge */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <span className="bg-red-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      NPR {event.priceMin?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {language === 'en' ? event.title : event.titleNe}
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {language === 'en' ? event.venue : event.venueNe}
                      </span>
                    </div>
                    {event.priceMax && event.priceMax > (event.priceMin || 0) && (
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 pt-0.5 sm:pt-1">
                        Up to NPR {event.priceMax.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
