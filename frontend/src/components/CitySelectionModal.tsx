import { useState } from 'react';
import { Search, MapPin, X, Landmark } from 'lucide-react';
import { popularCities, nepalCities, getProvinces, getCitiesByProvince, City } from '../data/nepalCities';

interface CitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: string) => void;
  currentCity?: string;
}

const allCities = nepalCities;

export function CitySelectionModal({ isOpen, onClose, onSelectCity, currentCity }: CitySelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCities, setShowAllCities] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  if (!isOpen) return null;

  const provinces = getProvinces();

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Select Your City</h2>
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
              placeholder="Search for your city or province"
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
              <option value="">All Provinces</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>

            <button
              onClick={handleDetectLocation}
              className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-700 font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              Detect Location
            </button>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {showAllCities ? 'All Cities' : 'Popular Cities'}
          </h3>

          {displayCities.length === 0 ? (
            <div className="text-center py-12">
              <Landmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No cities found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    onSelectCity(city.name);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    currentCity === city.name
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{city.icon}</div>
                  <div className={`font-semibold text-sm mb-1 ${currentCity === city.name ? 'text-red-600' : 'text-gray-900'}`}>
                    {city.name}
                  </div>
                  <div className="text-xs text-gray-500">{city.province}</div>
                </button>
              ))}
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
              View All Cities
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
