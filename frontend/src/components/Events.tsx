import { useEffect, useState } from 'react';
import { Search, Calendar, MapPin, Filter, Clock } from 'lucide-react';
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('events.search_placeholder')}
                className="input"
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

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('events.no_events')}
            </p>
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
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={language === 'en' ? event.title : event.titleNe}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {event.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    NPR {event.priceMin?.toLocaleString() || '0'}+
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {language === 'en' ? event.title : event.titleNe}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {language === 'en' ? event.description : event.descriptionNe}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="text-sm">
                        {language === 'en' ? event.venue : event.venueNe}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <span className="text-sm">
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBA'}
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-center"
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
