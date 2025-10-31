import React, { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Seat {
  id: string;
  seatNumber: string;
  row: string;
  column: number;
  price: number;
  categoryId: string;
  isBooked: boolean;
  isSelected: boolean;
  isHeld: boolean;
}

interface SeatCategory {
  id: string;
  name: string;
  nameNe: string;
  price: number;
  color: string;
  features: string[];
}

interface SeatMapProps {
  showtimeId: string;
  onSeatSelection: (seats: Seat[], totalPrice: number) => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ showtimeId, onSeatSelection }) => {
  const { user } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Fetch seats from API
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching seats for showtime:', showtimeId);
        const response = await fetch(`http://localhost:5000/api/seats/showtime/${showtimeId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch seats`);
        }

        const data = await response.json();
        console.log('Seat API response:', data);
        
        if (data.success && data.data) {
          console.log('Setting real seat data:', {
            seats: data.data.seats?.length || 0,
            categories: data.data.seatCategories?.length || 0
          });
          setCategories(data.data.seatCategories || []);
          setSeats(data.data.seats || []);
        } else {
          throw new Error(data.message || 'Failed to load seats');
        }
      } catch (err) {
        console.error('Error fetching seats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load seats');
        
        // Only use mock data as a last resort for development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock data as fallback');
          const mockCategories: SeatCategory[] = [
            {
              id: 'premium',
              name: 'Premium',
              nameNe: 'प्रिमियम',
              price: 800,
              color: '#FFD700',
              features: ['Extra Comfort', 'Premium View']
            },
            {
              id: 'standard',
              name: 'Standard',
              nameNe: 'मानक',
              price: 600,
              color: '#4CAF50',
              features: ['Comfortable', 'Good View']
            },
            {
              id: 'economy',
              name: 'Economy',
              nameNe: 'अर्थव्यवस्था',
              price: 400,
              color: '#2196F3',
              features: ['Budget Friendly']
            }
          ];

          const mockSeats: Seat[] = [];
          const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
          
        for (const [rowIndex, row] of rows.entries()) {
          for (let col = 1; col <= 20; col++) {
            let categoryId = 'standard';
            let price = 600;
            
            // Premium seats (first 2 rows)
            if (rowIndex < 2) {
              categoryId = 'premium';
              price = 800;
            }
            // Economy seats (last 2 rows)
            else if (rowIndex >= 8) {
              categoryId = 'economy';
              price = 400;
            }
            
            // Randomly book some seats for demo
            const isBooked = Math.random() < 0.2; // 20% chance of being booked
            
            mockSeats.push({
              id: `${row}${col}`,
              seatNumber: `${row}${col}`,
              row,
              column: col,
              price,
              categoryId,
              isBooked,
              isSelected: false,
              isHeld: false
            });
          }
        }

          setCategories(mockCategories);
          setSeats(mockSeats);
        }
      } finally {
        setLoading(false);
      }
    };

    if (showtimeId) {
      fetchSeats();
    }
  }, [showtimeId]);

  // Call onSeatSelection when selectedSeats changes
  useEffect(() => {
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    onSeatSelection(selectedSeats, totalPrice);
  }, [selectedSeats, onSeatSelection]);

  const handleSeatClick = async (seat: Seat) => {
    if (seat.isBooked) return;

    setSeats(prevSeats => {
      const updatedSeats = prevSeats.map(s => {
        if (s.id === seat.id) {
          return { ...s, isSelected: !s.isSelected };
        }
        return s;
      });
      
      // Update selected seats
      const newSelectedSeats = updatedSeats.filter(s => s.isSelected);
      setSelectedSeats(newSelectedSeats);

      // Hold seats if selecting, release if deselecting
      if (newSelectedSeats.length > 0 && !seat.isSelected) {
        holdSeats(newSelectedSeats);
      } else if (seat.isSelected) {
        // Release the seat that was just deselected
        releaseSeat(seat.id);
      }

      return updatedSeats;
    });
  };

  const holdSeats = async (seatsToHold: Seat[]) => {
    try {
      const seatIds = seatsToHold.map(seat => seat.id);
      const userId = user?.id || 'demo-user-id';

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seats/hold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          seatIds,
          userId,
          showtimeId
        }),
      });

      if (!response.ok) {
        console.error('Failed to hold seats');
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log('Seats held successfully for 10 minutes');
        
        // Set up auto-release after 10 minutes
        setTimeout(() => {
          setSeats(prevSeats => 
            prevSeats.map(seat => 
              seatIds.includes(seat.id) ? { ...seat, isSelected: false } : seat
            )
          );
          setSelectedSeats([]);
          onSeatSelection([], 0);
        }, 10 * 60 * 1000); // 10 minutes
      }
    } catch (error) {
      console.error('Error holding seats:', error);
    }
  };

  const releaseSeat = async (seatId: string) => {
    try {
      const userId = user?.id || 'demo-user-id';
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/seats/release', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          seatId,
          userId,
          showtimeId
        }),
      });

      if (!response.ok) {
        console.error('Failed to release seat');
        return;
      }

      const result = await response.json();
      console.log('Seat released successfully:', result);
    } catch (error) {
      console.error('Error releasing seat:', error);
    }
  };

  // Group seats by row for better layout
  const getSeatsByRow = () => {
    const seatsByRow: { [key: string]: Seat[] } = {};
    seats.forEach(seat => {
      if (!seatsByRow[seat.row]) {
        seatsByRow[seat.row] = [];
      }
      seatsByRow[seat.row].push(seat);
    });
    
    // Sort seats in each row by column number
    for (const row of Object.keys(seatsByRow)) {
      seatsByRow[row].sort((a, b) => a.column - b.column);
    }
    
    return seatsByRow;
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.isBooked) return 'bg-red-600 shadow-red-200';
    if (seat.isSelected) return 'bg-blue-600 shadow-blue-200';
    
    // Use actual category colors
    const category = categories.find(c => c.id === seat.categoryId);
    if (category) {
      // Check if category ID contains the category name (for dynamic IDs like premium_${screenId})
      if (category.id.includes('premium') || category.name.toLowerCase().includes('premium')) {
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-200';
      } else if (category.id.includes('standard') || category.name.toLowerCase().includes('standard')) {
        return 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-200';
      } else if (category.id.includes('economy') || category.name.toLowerCase().includes('economy')) {
        return 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200';
      }
      
      // Fallback to exact match for backward compatibility
      switch (category.id) {
        case 'premium':
          return 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-200';
        case 'standard':
          return 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-200';
        case 'economy':
          return 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200';
        default:
          return 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-gray-200';
      }
    }
    return 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-gray-200';
  };

  const getSeatTextColor = (seat: Seat) => {
    if (seat.isBooked || seat.isSelected) return 'text-white font-semibold';
    if (hoveredSeat === seat.id) return 'text-white font-semibold';
    return 'text-gray-800 font-medium';
  };

  const getSeatHoverEffects = (seat: Seat) => {
    if (seat.isBooked) return '';
    if (seat.isSelected) return 'hover:bg-blue-700 hover:scale-105';
    if (hoveredSeat === seat.id) return 'scale-110 shadow-lg';
    return 'hover:scale-105 hover:shadow-md transition-all duration-200';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading seat map...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Preparing your perfect seats</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Error loading seat map: {error}</p>
      </div>
    );
  }

  const seatsByRow = getSeatsByRow();
  const rowKeys = Object.keys(seatsByRow).sort((a, b) => a.localeCompare(b));

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      {/* Enhanced Screen */}
      <div className="text-center mb-12">
        <div className="relative">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6 px-16 rounded-xl shadow-lg transform -skew-x-3">
            <div className="transform skew-x-3">
              <h3 className="text-2xl font-bold tracking-wider">SCREEN</h3>
              <div className="flex items-center justify-center mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm opacity-75">This way for best viewing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Seat Map */}
      <div className="mb-8 overflow-x-auto">
        <div className="space-y-3 min-w-max">
          {rowKeys.map((rowKey) => {
            const rowSeats = seatsByRow[rowKey];
            return (
              <div key={rowKey} className="flex items-center gap-4">
                {/* Row Label */}
                <div className="w-8 text-center">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{rowKey}</span>
                </div>
                
                {/* Seats in Row */}
                <div className="flex gap-1">
                  {rowSeats.map((seat, index) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      disabled={seat.isBooked}
                      className={`
                        relative w-10 h-10 text-xs font-medium rounded-lg border-2
                        ${getSeatColor(seat)}
                        ${getSeatTextColor(seat)}
                        ${getSeatHoverEffects(seat)}
                        ${seat.isBooked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                        transition-all duration-300 ease-in-out transform
                        shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      `}
                      title={`${seat.seatNumber} - ₹${seat.price}${seat.isBooked ? ' (Booked)' : seat.isSelected ? ' (Selected)' : ''}`}
                      style={{
                        animationDelay: `${index * 20}ms`
                      }}
                    >
                      <span className="relative z-10">{seat.seatNumber}</span>
                      
                      {/* Selection indicator */}
                      {seat.isSelected && (
                        <div className="absolute inset-0 bg-blue-600 rounded-lg animate-pulse">
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover effect overlay */}
                      {hoveredSeat === seat.id && !seat.isBooked && !seat.isSelected && (
                        <div className="absolute inset-0 bg-white bg-opacity-20 rounded-lg animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Seat Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div 
                className={`w-8 h-8 rounded-lg ${
                  category.id.includes('premium') || category.name.toLowerCase().includes('premium') ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                  category.id.includes('standard') || category.name.toLowerCase().includes('standard') ? 'bg-gradient-to-br from-green-400 to-green-600' :
                  category.id.includes('economy') || category.name.toLowerCase().includes('economy') ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                  'bg-gradient-to-br from-gray-300 to-gray-500'
                } shadow-sm`}
              ></div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  ₹{category.price}
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-red-600 shadow-sm"></div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Booked</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Unavailable</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-600 shadow-sm"></div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Selected</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">By You</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Selected Seats
            </h4>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Reserved for you
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSeats.map((seat, index) => (
                <span 
                  key={seat.id}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors animate-bounce"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {seat.seatNumber}
                </span>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-blue-200 dark:border-blue-600">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              ₹{selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              {selectedSeats.length} seat{selectedSeats.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Instructions */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Seat Selection Tips</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click on available seats to select them. Selected seats will be held for 10 minutes to complete your booking.
        </p>
      </div>
    </div>
  );
};

export default SeatMap;
