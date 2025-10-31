import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
  location: string;
  locationNe: string;
  eventDate: string;
  endDate?: string;
  priceMin: number;
  priceMax: number;
}

interface EventDetailProps {
  eventId: string;
  onNavigate: (page: string, id?: string) => void;
}

export function EventDetail({ eventId, onNavigate }: EventDetailProps) {
  const { language, t } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  async function loadEvent() {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}`);
      const json = await res.json();
      if (json?.success && json.data?.event) setEvent(json.data.event as Event);
    } catch (_) {}
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="relative h-96 bg-gray-900">
        <img
          src={event.image_url}
          alt={language === 'en' ? event.title : event.title_ne}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <button
          onClick={() => onNavigate('events')}
          className="mb-4 flex items-center gap-2 text-white hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Events</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 px-3 py-1 rounded-full text-sm font-semibold uppercase mb-4">
                {event.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'en' ? event.title : event.titleNe}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-600 mb-1">
                NPR {event.priceMin?.toLocaleString?.() || 0}
              </div>
              {event.priceMax > event.priceMin && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  up to NPR {event.priceMax.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date & Time</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {new Date(event.eventDate).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Venue</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {language === 'en' ? event.venue : event.venueNe}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {language === 'en' ? event.location : event.locationNe}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Users className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Availability</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Tickets Available
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              About This Event
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {language === 'en' ? event.description : event.descriptionNe}
            </p>
          </div>

          <button
            onClick={() => onNavigate('event-checkout', event.id)}
            className="w-full md:w-auto bg-red-600 text-white px-12 py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg"
          >
            {t('home.book_now')}
          </button>
        </div>
      </div>
    </div>
  );
}
