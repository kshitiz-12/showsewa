import { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Star as StarIcon, Wifi, Car, Coffee, Shield, Heart, RefreshCw } from 'lucide-react';
import { useCity } from '../contexts/CityContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { theaterService } from '../services/theaterService';
import { Theater } from '../data/nepalTheaters';

interface Theater {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  phone?: string;
  email?: string;
  screens: number;
  amenities: string[];
  isActive: boolean;
}

interface TheaterSelectionProps {
  onSelectTheater: (theater: Theater) => void;
  selectedTheater?: Theater;
}

const amenityIcons: Record<string, any> = {
  'Dolby Atmos': Shield,
  'IMAX': StarIcon,
  'Premium Seats': Users,
  'Food Court': Coffee,
  'Parking': Car,
  'Online Booking': Wifi,
  'Snacks Bar': Coffee,
  'Fine Dining': Coffee,
  'Luxury Seats': Users,
  'VIP Lounge': StarIcon,
  'Standard Seats': Users,
  'Budget Friendly': Shield,
  '4K Projection': StarIcon,
};

export function TheaterSelection({ onSelectTheater, selectedTheater }: TheaterSelectionProps) {
  const { selectedCity } = useCity();
  const { isFavoriteTheater, toggleFavoriteTheater, getTheaterRating, setTheaterRating } = useFavorites();
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTheaters();
  }, [selectedCity]);

  const loadTheaters = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get theaters from backend first, fallback to static data
      const cityTheaters = await theaterService.getTheatersWithCache(selectedCity, forceRefresh);
      
      // Sort favorites first
      cityTheaters.sort((a, b) => Number(isFavoriteTheater(b.id)) - Number(isFavoriteTheater(a.id)));
      setTheaters(cityTheaters);
    } catch (err) {
      console.error("Error fetching theaters:", err);
      setError("Failed to load theaters. Using cached data.");
      
      // Fallback to static data
      try {
        const { getTheatersByCity } = await import('../data/nepalTheaters');
        const staticTheaters = getTheatersByCity(selectedCity);
        staticTheaters.sort((a, b) => Number(isFavoriteTheater(b.id)) - Number(isFavoriteTheater(a.id)));
        setTheaters(staticTheaters);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setError("No theaters available for this city.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTheaters(true); // Force refresh
    setRefreshing(false);
  };

  const Rating = ({ theaterId }: { theaterId: string }) => {
    const current = getTheaterRating(theaterId);
    return (
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((n) => (
          <button
            key={n}
            onClick={(e) => { e.stopPropagation(); setTheaterRating(theaterId, n); }}
            className="p-0.5"
            aria-label={`Rate ${n} star${n>1?'s':''}`}
          >
            <StarIcon className={`w-4 h-4 ${n <= current ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading theaters...</span>
      </div>
    );
  }

  if (theaters.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No theaters found</h3>
        <p className="text-gray-600">No theaters available in {selectedCity}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Select Theater in {selectedCity}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{theaters.length} theaters</span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            title="Refresh theaters"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        {theaters.map((theater) => (
          <div
            key={theater.id}
            onClick={() => onSelectTheater(theater)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTheater?.id === theater.id
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{theater.name}</h4>
                  {theater.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{theater.area}, {theater.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{theater.screens} screens</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-3">{theater.address}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <Rating theaterId={theater.id} />
                  {theater.phone && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{theater.phone}</span>
                    </div>
                  )}
                </div>

                {theater.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {theater.amenities.slice(0, 4).map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || StarIcon;
                      return (
                        <span
                          key={amenity}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          <IconComponent className="w-3 h-3" />
                          {amenity}
                        </span>
                      );
                    })}
                    {theater.amenities.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{theater.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Favorite toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavoriteTheater(theater.id); }}
                aria-label="Toggle favorite"
                className={`ml-4 p-2 rounded-full border ${isFavoriteTheater(theater.id) ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'} hover:shadow`}
              >
                <Heart className={`w-5 h-5 ${isFavoriteTheater(theater.id) ? 'text-red-600 fill-red-600' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

