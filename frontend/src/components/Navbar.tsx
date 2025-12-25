import { useState, useEffect } from 'react';
import { Ticket, Menu, X, Sun, Moon, User, LogOut, ShoppingBag, BarChart3, Trophy, MapPin, ChevronDown, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { CitySelectionModal } from './CitySelectionModal';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: Readonly<NavbarProps>) {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { selectedCity, setSelectedCity } = useCity();
  const { favoriteTheaterIds } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    onNavigate('home');
  };

  useEffect(() => {
    const isDark = localStorage.getItem('showsewa-theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('showsewa-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('showsewa-theme', 'light');
    }
  };

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'events', label: t('nav.events') },
    { id: 'movies', label: t('nav.movies') },
    { id: 'about', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') },
  ];

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div 
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-red-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors duration-300">
              Show<span className="text-red-600">Sewa</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* City Selection Button */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="btn-secondary"
              aria-label={`Select city. Currently: ${selectedCity && selectedCity.trim() ? selectedCity : 'All Cities'}`}
            >
              <MapPin className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedCity && selectedCity.trim() ? selectedCity : 'All Cities'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* My Favorites Button */}
            {favoriteTheaterIds.size > 0 && (
              <button
                onClick={() => onNavigate('movies')}
                className="btn-primary"
                title={`${favoriteTheaterIds.size} favorite theaters`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>My Favorites</span>
                <span className="badge-red">
                  {favoriteTheaterIds.size}
                </span>
              </button>
            )}

            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`font-medium transition-all duration-300 relative transform hover:scale-105 ${
                  currentPage === item.id
                    ? 'text-red-600'
                    : 'text-gray-700 dark:text-gray-300 hover:text-red-600'
                }`}
              >
                {item.label}
                {currentPage === item.id && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-600 animate-scale-in"></div>
                )}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 active:scale-95"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-180" /> : <Moon className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />}
            </button>
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 font-medium transform hover:scale-105 active:scale-95"
            >
              {language === 'en' ? 'नेपाली' : 'English'}
            </button>

            {/* User Menu or Login Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 group min-h-[44px]"
                  aria-label={`User menu for ${user.name}`}
                  aria-expanded={showUserMenu}
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('bookings');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      My Bookings
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('loyalty');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <Trophy className="w-4 h-4" />
                      Loyalty Points
                    </button>

                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 font-medium"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
            {/* Mobile City Selection Button */}
            <button
              onClick={() => {
                setIsCityModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 min-h-[44px]"
              aria-label={`Select city. Currently: ${selectedCity && selectedCity.trim() ? selectedCity : 'All Cities'}`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedCity && selectedCity.trim() ? selectedCity : 'All Cities'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                onClick={toggleTheme}
                className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-h-[44px] flex items-center justify-center"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5 mx-auto" /> : <Moon className="w-5 h-5 mx-auto" />}
              </button>
              <button
                onClick={toggleLanguage}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                aria-label={language === 'en' ? 'Switch to Nepali' : 'Switch to English'}
              >
                {language === 'en' ? 'नेपाली' : 'English'}
              </button>
            </div>

            {/* Mobile Login/User Menu */}
            {isAuthenticated && user ? (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 mt-2">
                <div className="px-4 py-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    onNavigate('bookings');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                >
                  <ShoppingBag className="w-4 h-4" />
                  My Bookings
                </button>
                <button
                  onClick={() => {
                    onNavigate('loyalty');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                >
                  <Trophy className="w-4 h-4" />
                  Loyalty Points
                </button>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 font-medium"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* City Selection Modal */}
      <CitySelectionModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setIsCityModalOpen(false);
        }}
        currentCity={selectedCity}
      />
    </nav>
  );
}

