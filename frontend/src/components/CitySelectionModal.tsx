import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, X, Landmark } from 'lucide-react';
import { popularCities, nepalCities, getProvinces } from '../data/nepalCities';
import { DefaultCityIcon } from '../data/cityIcons';
import { useLanguage } from '../contexts/LanguageContext';

interface CitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: string) => void;
  currentCity?: string;
}

const allCities = nepalCities;

export function CitySelectionModal({ isOpen, onClose, onSelectCity, currentCity }: CitySelectionModalProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCities, setShowAllCities] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  if (!isOpen) return null;

  const provinces = getProvinces();

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // In a real implementation, you would reverse geocode the coordinates
          // For now, we'll just use Kathmandu as default
          onSelectCity('Kathmandu');
          onClose();
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to detect your location. Please select a city manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const filteredCities = showAllCities ? allCities : popularCities;
  
  let displayCities = filteredCities;
  
  // Apply province filter
  if (selectedProvince) {
    displayCities = displayCities.filter(city => city.province === selectedProvince);
  }
  
  // Apply search filter
  if (searchQuery) {
    displayCities = displayCities.filter(city =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.province.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('common.select_your_city')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search_city_province')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            >
              <option value="">{t('common.all_provinces')}</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>

            <button
              onClick={handleDetectLocation}
              className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-700 font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              {t('common.detect_location')}
            </button>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]" 
             onWheel={(e) => {
               const target = e.currentTarget;
               const isScrollingDown = e.deltaY > 0;
               const isAtTop = target.scrollTop === 0;
               const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
               
               // Prevent background scroll when at boundaries
               if ((isScrollingDown && isAtBottom) || (!isScrollingDown && isAtTop)) {
                 e.preventDefault();
                 e.stopPropagation();
               }
             }}
             style={{ overscrollBehavior: 'contain' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {showAllCities ? t('common.all_cities') : t('common.popular_cities')}
          </h3>

          {displayCities.length === 0 ? (
            <div className="text-center py-12">
              <Landmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('common.no_cities_found')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* "All Cities" option - show first */}
              <button
                onClick={() => {
                  onSelectCity(''); // Empty string means show all cities
                  onClose();
                }}
                className={`group p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 relative ${
                  !currentCity || currentCity === ''
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                }`}
                onMouseEnter={(e) => {
                  const tooltip = document.createElement('div');
                  tooltip.textContent = 'All Cities';
                  tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none';
                  tooltip.id = 'city-tooltip';
                  e.currentTarget.appendChild(tooltip);
                }}
                onMouseLeave={(e) => {
                  const tooltip = document.getElementById('city-tooltip');
                  if (tooltip) tooltip.remove();
                }}
              >
                <div className="flex items-center justify-center mb-2">
                  <div className={`p-3 rounded-xl transform group-hover:scale-110 transition-all duration-200 ${
                    !currentCity || currentCity === ''
                      ? 'bg-red-600'
                      : 'bg-gray-200 group-hover:bg-red-100'
                  }`}>
                    {!currentCity || currentCity === '' ? (
                      <span className="inline-flex h-8 w-8 items-center justify-center text-2xl leading-none text-white" aria-hidden="true">
                        🗺️
                      </span>
                    ) : (
                      <DefaultCityIcon className="w-8 h-8 text-gray-600 group-hover:text-red-600 transition-colors duration-200" />
                    )}
                  </div>
                </div>
                <div className={`font-semibold text-sm mb-1 ${!currentCity || currentCity === '' ? 'text-red-600' : 'text-gray-900'}`}>
                  {t('common.all_cities')}
                </div>
                <div className="text-xs text-gray-500">{t('common.show_all')}</div>
              </button>
              
              {displayCities.map((city) => {
                return (
                  <button
                    key={city.name}
                    onClick={() => {
                      onSelectCity(city.name);
                      onClose();
                    }}
                    className={`group p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 relative ${
                      currentCity === city.name
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                    }`}
                    onMouseEnter={(e) => {
                      const tooltip = document.createElement('div');
                      tooltip.textContent = city.name;
                      tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none';
                      tooltip.id = `city-tooltip-${city.name}`;
                      e.currentTarget.appendChild(tooltip);
                    }}
                    onMouseLeave={(e) => {
                      const tooltip = document.getElementById(`city-tooltip-${city.name}`);
                      if (tooltip) tooltip.remove();
                    }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className={`p-3 rounded-xl transform group-hover:scale-110 transition-all duration-200 ${
                        currentCity === city.name
                          ? 'bg-red-600'
                          : 'bg-gray-200 group-hover:bg-red-100'
                      }`}>
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center text-2xl leading-none ${
                            currentCity === city.name ? 'text-white' : ''
                          }`}
                          aria-hidden="true"
                        >
                          {city.icon}
                        </span>
                      </div>
                    </div>
                    <div className={`font-semibold text-sm mb-1 ${currentCity === city.name ? 'text-red-600' : 'text-gray-900'}`}>
                      {city.name}
                    </div>
                    <div className="text-xs text-gray-500">{city.province}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* View All Cities Button */}
        {!showAllCities && (
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => setShowAllCities(true)}
              className="w-full text-red-600 hover:text-red-700 font-medium text-center"
            >
              {t('common.view_all_cities')}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
