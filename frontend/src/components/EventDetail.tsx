import { useEffect, useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Clock, 
  Languages, 
  Tag,
  Heart,
  ChevronRight,
  Smartphone,
  Ticket,
  ChevronLeft,
  Share2,
  X,
  ThumbsUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

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
  tags?: string[];
  ageRestriction?: string;
  availableSeats?: number;
  totalSeats?: number;
  termsAndConditions?: string;
  termsAndConditionsNe?: string;
}

interface EventDetailProps {
  eventId: string;
  onNavigate: (page: string, id?: string) => void;
}

export function EventDetail({ eventId, onNavigate }: EventDetailProps) {
  const { language, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [readMoreVisible, setReadMoreVisible] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [loadingInterest, setLoadingInterest] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (event?.category) {
      loadRelatedEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  useEffect(() => {
    if (event?.description) {
      // Check if description is long enough to need "Read More"
      const description = language === 'en' ? event.description : event.descriptionNe;
      setReadMoreVisible(description.length > 300);
      if (!showFullDescription) {
        setReadMoreVisible(description.length > 300);
      }
    }
  }, [event, language, showFullDescription]);

  async function loadEvent() {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        headers
      });
      const json = await res.json();
      if (json?.success && json.data?.event) {
        setEvent(json.data.event as Event);
        // Use real interest data from API
        setInterestedCount(json.data.interestCount || 0);
        setIsInterested(json.data.isInterested || false);
      }
    } catch (error) {
      console.error('Error loading event:', error);
    }
  }

  async function loadRelatedEvents() {
    if (!event?.category) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events?limit=6&category=${event.category}`);
      const json = await res.json();
      if (json?.success && json.data?.events) {
        // Filter out current event
        const related = (json.data.events as Event[]).filter(e => e.id !== eventId);
        setRelatedEvents(related.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading related events:', error);
    }
  }

  const handleInterested = async () => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    setLoadingInterest(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/events/${eventId}/interested`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const json = await res.json();
      if (json?.success && json.data) {
        setIsInterested(json.data.isInterested);
        setInterestedCount(json.data.interestCount);
      } else {
        console.error('Failed to toggle interest:', json.message);
        alert(json.message || 'Failed to update interest');
      }
    } catch (error) {
      console.error('Error toggling interest:', error);
      alert('Failed to update interest. Please try again.');
    } finally {
      setLoadingInterest(false);
    }
  };

  const handleGetDirections = () => {
    if (!event) return;
    const venue = language === 'en' ? event.venue : event.venueNe;
    const location = language === 'en' ? event.location : event.locationNe;
    const address = `${venue}, ${location}`;
    const encodedAddress = encodeURIComponent(address);
    // Open Google Maps with the venue address
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleShareEvent = () => {
    if (navigator.share && event) {
      navigator.share({
        title: language === 'en' ? event.title : event.titleNe,
        text: language === 'en' ? event.description : event.descriptionNe,
        url: window.location.href
      }).catch(() => {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert('Event link copied to clipboard!');
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    
    return `${start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const calculateDuration = () => {
    if (!event?.endDate) return 'N/A';
    const start = new Date(event.eventDate);
    const end = new Date(event.endDate);
    const diffHours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const diffMinutes = Math.floor(((end.getTime() - start.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) return `${diffMinutes} minutes`;
    if (diffMinutes === 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minutes`;
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const eventTitle = language === 'en' ? event.title : event.titleNe;
  const eventDescription = language === 'en' ? event.description : event.descriptionNe;
  const eventVenue = language === 'en' ? event.venue : event.venueNe;
  const eventLocation = language === 'en' ? event.location : event.locationNe;
  const displayDescription = showFullDescription 
    ? eventDescription 
    : eventDescription.substring(0, 300) + (eventDescription.length > 300 ? '...' : '');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('events')}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-white text-center flex-1 line-clamp-1 px-2">
          {eventTitle}
        </h1>
        <button
          onClick={handleShareEvent}
          className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Share2 className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Banner Section - Mobile Optimized */}
      <div className="relative h-[50vh] sm:h-[500px] bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        <img
          src={event.imageUrl}
          alt={eventTitle}
          className="w-full h-full object-contain sm:object-cover opacity-60"
          style={{ objectPosition: 'center' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        
        {/* Banner Content */}
        <div className="absolute inset-0 flex items-end p-6">
          <div className="w-full">
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-gray-300 mb-2 uppercase tracking-wider">
                FEATURING ALL THE BEST AND UPCOMING TALENTS
              </p>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                {eventTitle.toUpperCase()}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          {/* Category Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(event.tags && event.tags.length > 0 ? event.tags : [event.category]).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded-full text-xs sm:text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Interest Section - BookMyShow Style */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    {interestedCount} are interested
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Mark interested to know more about this event.
                  </div>
                </div>
              </div>
              <button
                onClick={handleInterested}
                disabled={loadingInterest}
                className={`px-4 sm:px-6 py-2 rounded-lg border-2 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                  isInterested
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-transparent border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingInterest ? 'Updating...' : (isInterested ? "I'm Interested ✓" : "Interested?")}
              </button>
            </div>
          </div>

          {/* Event Details List - BookMyShow Style */}
          <div className="space-y-4 mb-6">
            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                  {formatDateRange(event.eventDate, event.endDate)}
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                  {new Date(event.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
              </div>
            </div>

            {/* Duration */}
            {event.endDate && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                    {calculateDuration()}
                  </div>
                </div>
              </div>
            )}

            {/* Age Limit */}
            {event.ageRestriction && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                    Age Limit - {event.ageRestriction}
                  </div>
                </div>
              </div>
            )}

            {/* Languages */}
            <div className="flex items-start gap-3">
              <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                  {language === 'en' ? 'English' : 'नेपाली'}, English
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm sm:text-base text-gray-900 dark:text-white font-medium capitalize">
                  {event.category}
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                  {eventVenue}: {eventLocation}
                </div>
                <button 
                  onClick={handleGetDirections}
                  className="mt-1 text-red-600 dark:text-red-400 hover:underline text-xs sm:text-sm flex items-center gap-1"
                >
                  Get Directions
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Booking Alert Banner */}
          {event.availableSeats && event.availableSeats > 0 && event.availableSeats < 50 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-amber-800 dark:text-amber-200">
                Bookings are filling fast for {eventLocation}
              </div>
            </div>
          )}

          {/* About The Event Section */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">About The Event</h2>
            
            {/* Price and Availability Row */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  NPR {event.priceMin?.toLocaleString() || 0}
                </div>
                {event.priceMax > event.priceMin && (
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    up to NPR {event.priceMax.toLocaleString()}
                  </div>
                )}
                <div className="text-sm sm:text-base text-green-600 dark:text-green-400 font-medium mt-1">
                  {event.availableSeats && event.availableSeats > 0 ? 'Available' : 'Sold Out'}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    // Store redirect destination
                    localStorage.setItem('redirectAfterLogin', JSON.stringify({ page: 'event-checkout', id: event.id }));
                    onNavigate('login');
                    return;
                  }
                  onNavigate('event-checkout', event.id);
                }}
                disabled={!event.availableSeats || event.availableSeats === 0}
                className="bg-red-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-base sm:text-lg disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Book Now
              </button>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {displayDescription}
            </p>
            {readMoreVisible && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-red-600 dark:text-red-400 font-medium mt-2 hover:underline text-sm sm:text-base"
              >
                {showFullDescription ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          {/* M-Ticket Section */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">M-Ticket</h3>
            <div className="flex items-start gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <Smartphone className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-2">
                  Contactless Ticketing & Fast-track Entry with M-ticket.
                </p>
                <button 
                  onClick={() => setShowLearnMoreModal(true)}
                  className="text-red-600 dark:text-red-400 font-medium text-sm sm:text-base hover:underline"
                >
                  Learn How
                </button>
              </div>
            </div>
          </div>

          {/* About The Venue */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">About The Venue</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs sm:text-sm">
                Indoor Amphitheatre
              </span>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs sm:text-sm">
                Open Air Amphitheatre
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to the beating heart of laughter. {eventVenue} in {eventLocation} is not just a venue—it's a comedy sanctuary, a haven for enthusiasts, and a stage where comedic talents shine. Our space is designed to showcase diverse comedic talents, creating an energetic and inviting atmosphere that makes every performance memorable.
            </p>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-6">
            <button 
              onClick={() => setShowTermsModal(true)}
              className="flex items-center justify-between w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-3 -m-3 transition-colors"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Terms & Conditions</h2>
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* You May Also Like */}
          {relatedEvents.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">You May Also Like</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">Events around you, book now</p>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                {relatedEvents.map((relatedEvent) => (
                  <div
                    key={relatedEvent.id}
                    onClick={() => onNavigate('event-detail', relatedEvent.id)}
                    className="flex-shrink-0 w-48 sm:w-64 cursor-pointer group"
                  >
                    <div className="relative h-32 sm:h-40 rounded-lg overflow-hidden mb-2">
                      <img
                        src={relatedEvent.imageUrl}
                        alt={language === 'en' ? relatedEvent.title : relatedEvent.titleNe}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm mb-1 line-clamp-1">
                      {language === 'en' ? relatedEvent.title : relatedEvent.titleNe}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">{relatedEvent.category}</p>
                    <p className="text-red-600 dark:text-red-400 font-bold text-xs sm:text-sm">
                      NPR {relatedEvent.priceMin?.toLocaleString() || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {(language === 'en' ? event.termsAndConditions : event.termsAndConditionsNe) || (
                  <div>
                    <p className="mb-4">Please review the following terms and conditions before booking:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Tickets are non-refundable once purchased.</li>
                      <li>Event timings and venue are subject to change. Please check before attending.</li>
                      <li>Children under the age of {event.ageRestriction || '12'} must be accompanied by an adult.</li>
                      <li>Venue reserves the right to refuse entry.</li>
                      <li>Late arrivals may result in denied entry.</li>
                      <li>Recording or photography may be restricted.</li>
                      <li>Follow all safety and security guidelines at the venue.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learn More Modal (M-Ticket) */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">M-Ticket Guide</h2>
              <button
                onClick={() => setShowLearnMoreModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <Smartphone className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Contactless Ticketing</h3>
                    <p>Your ticket will be delivered to your email and can be accessed on your mobile device. No need to print!</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <Ticket className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Fast-track Entry</h3>
                    <p>Show your M-ticket QR code at the venue for quick and seamless entry. Faster than traditional paper tickets!</p>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">How it works:</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Book your tickets and receive them via email</li>
                    <li>Open the email on your mobile device</li>
                    <li>Show the QR code at the venue entrance</li>
                    <li>Enjoy contactless entry!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
