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
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('events.title')}
          </h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('events.search_placeholder')}
                className="input pl-10"
              />
            </div>
            
            {/* Incoming Events Toggle */}
            <button
              onClick={() => setShowIncomingOnly(!showIncomingOnly)}
              className={`btn-secondary whitespace-nowrap ${showIncomingOnly ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
            >
              <Clock className={`w-5 h-5 ${showIncomingOnly ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">Incoming Events</span>
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

{loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-64 bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center">
              <Filter className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Events Found
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
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
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <button
                type="button"
                key={event.id}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 w-full text-left"
                onClick={() => onNavigate('event-detail', event.id)}
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={language === 'en' ? event.title : event.titleNe}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="hidden absolute inset-0 flex items-center justify-center">
                    <Music className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-1 rounded-full text-xs font-semibold uppercase shadow-lg">
                    {event.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    NPR {event.priceMin?.toLocaleString() || '0'}+
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {language === 'en' ? event.title : event.titleNe}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {language === 'en' ? event.description : event.descriptionNe}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {language === 'en' ? event.venue : event.venueNe}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span className="text-sm">
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBA'}
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-center shadow-lg"
                    onClick={(e) => { e.stopPropagation(); onNavigate('event-checkout', event.id); }}
                  >
                    {t('home.book_now')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
