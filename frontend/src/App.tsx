import { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CityProvider } from './contexts/CityContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Events } from './components/Events';
import { Movies } from './components/Movies';
import { EventDetail } from './components/EventDetail';
import { EventCheckout, EventBookingSuccess } from './components/EventCheckout';
import { MovieDetail } from './components/MovieDetail';
import BookingPage from './components/BookingPage';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { LoyaltyPoints } from './components/LoyaltyPoints';
import { UserProfile } from './components/UserProfile';
import { UserBookings } from './components/UserBookings';

// URL routing utilities
const parseUrl = () => {
  const path = globalThis.location.pathname;
  const search = globalThis.location.search;
  const params = new URLSearchParams(search);
  
  if (path === '/' || path === '') return { page: 'home', id: undefined };
  
  const segments = path.split('/').filter(Boolean);
  
  switch (segments[0]) {
    case 'movies':
      if (segments[1]) return { page: 'movie-detail', id: segments[1] };
      return { page: 'movies', id: undefined };
    case 'events':
      if (segments[1] && segments[2] === 'checkout') return { page: 'event-checkout', id: segments[1] };
      if (segments[1] && segments[2] === 'success') return { page: 'event-booking-success', id: segments[1] };
      if (segments[1]) return { page: 'event-detail', id: segments[1] };
      return { page: 'events', id: undefined };
    case 'booking': {
      const showtimeId = params.get('showtime') || segments[1];
      return { page: 'booking-page', id: showtimeId };
    }
    case 'about':
      return { page: 'about', id: undefined };
    case 'contact':
      return { page: 'contact', id: undefined };
    case 'login':
      return { page: 'login', id: undefined };
    case 'admin':
      return { page: 'admin', id: undefined };
    case 'loyalty':
      return { page: 'loyalty', id: undefined };
    case 'profile':
      return { page: 'profile', id: undefined };
    case 'bookings':
      return { page: 'bookings', id: undefined };
    default:
      return { page: 'home', id: undefined };
  }
};

const buildUrl = (page: string, id?: string) => {
  switch (page) {
    case 'home':
      return '/';
    case 'movies':
      return '/movies';
    case 'movie-detail':
      return `/movies/${id}`;
    case 'events':
      return '/events';
    case 'event-detail':
      return `/events/${id}`;
    case 'event-checkout':
      return `/events/${id}/checkout`;
    case 'event-booking-success':
      return `/events/${id}/success`;
    case 'booking-page':
      return `/booking?showtime=${id}`;
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    case 'login':
      return '/login';
    case 'admin':
      return '/admin';
    case 'loyalty':
      return '/loyalty';
    case 'profile':
      return '/profile';
    case 'bookings':
      return '/bookings';
    default:
      return '/';
  }
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from URL on mount and handle browser navigation
  useEffect(() => {
    const initFromUrl = () => {
      const { page, id } = parseUrl();
      setCurrentPage(page);
      setSelectedItemId(id);
    };

    // Initial load
    initFromUrl();
    setIsLoading(false);

    // Handle browser back/forward
    const handlePopState = () => {
      initFromUrl();
    };

    globalThis.addEventListener('popstate', handlePopState);
    return () => globalThis.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
    setSelectedItemId(id);
    
    // Update URL without causing a page reload
    const newUrl = buildUrl(page, id);
    globalThis.history.pushState({ page, id }, '', newUrl);
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'events':
        return <Events onNavigate={handleNavigate} />;
      case 'movies':
        return <Movies onNavigate={handleNavigate} />;
      case 'event-detail':
        return selectedItemId ? (
          <EventDetail eventId={selectedItemId} onNavigate={handleNavigate} />
        ) : (
          <Events onNavigate={handleNavigate} />
        );
      case 'event-checkout':
        return selectedItemId ? (
          <EventCheckout eventId={selectedItemId} onNavigate={handleNavigate} />
        ) : (
          <Events onNavigate={handleNavigate} />
        );
      case 'event-booking-success':
        return selectedItemId ? (
          <EventBookingSuccess eventId={selectedItemId} onNavigate={handleNavigate} />
        ) : (
          <Events onNavigate={handleNavigate} />
        );
      case 'movie-detail':
        return selectedItemId ? (
          <MovieDetail movieId={selectedItemId} onNavigate={handleNavigate} />
        ) : (
          <Movies onNavigate={handleNavigate} />
        );
      case 'booking-page':
        return <BookingPage onNavigate={handleNavigate} showtimeId={selectedItemId} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'loyalty':
        return <LoyaltyPoints />;
      case 'profile':
        return <UserProfile onNavigate={handleNavigate} />;
      case 'bookings':
        return <UserBookings onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <CityProvider>
          <FavoritesProvider>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
              <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
              <main>
                <div key={`${currentPage}-${selectedItemId || 'no-id'}`} className="animate-page-slide-in-right">
                  {renderPage()}
                </div>
              </main>
              {currentPage !== 'login' && currentPage !== 'admin' && currentPage !== 'loyalty' && currentPage !== 'profile' && currentPage !== 'bookings' && (
                <div className="animate-page-slide-in-bottom">
                  <Footer onNavigate={handleNavigate} />
                </div>
              )}
            </div>
          </FavoritesProvider>
        </CityProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;

