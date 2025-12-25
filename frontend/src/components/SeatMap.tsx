import React, { useState, useEffect } from 'react';
import { Ticket, ArrowLeft, Pencil } from 'lucide-react';
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
  showtimeInfo?: any;
}

const SeatMap: React.FC<SeatMapProps> = ({ showtimeId, onSeatSelection, showtimeInfo }) => {
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
    // BookMyShow style: green for selected, white for available, light gray for sold
    if (seat.isBooked) return 'bg-gray-300 dark:bg-gray-600';
    if (seat.isSelected) return 'bg-green-500';
    return 'bg-white border border-gray-300';
  };

  const getSeatTextColor = (seat: Seat) => {
    if (seat.isBooked) return 'text-gray-500 font-medium';
    if (seat.isSelected) return 'text-white font-bold';
    return 'text-gray-900 font-medium';
  };

  const getSeatHoverEffects = (seat: Seat) => {
    if (seat.isBooked) return 'cursor-not-allowed';
    if (seat.isSelected) return 'hover:bg-green-600';
    return 'hover:bg-gray-100 hover:border-gray-400 cursor-pointer';
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

  // Group seats by row and category for pricing display
  const getRowCategory = (rowKey: string) => {
    // Get the first seat in the row to determine its category and price
    const rowSeats = seatsByRow[rowKey];
    if (!rowSeats || rowSeats.length === 0) {
      return { name: '', price: 0 };
    }
    
    const firstSeat = rowSeats[0];
    const category = categories.find(c => c.id === firstSeat.categoryId);
    
    // Map category names to row labels
    const categoryName = category?.name?.toUpperCase() || '';
    let rowLabel = '';
    if (categoryName.includes('PREMIUM') || categoryName.includes('PRIME')) {
      rowLabel = 'PRIME ROWS';
    } else if (categoryName.includes('PLUS') || categoryName.includes('CLASSIC PLUS')) {
      rowLabel = 'CLASSIC PLUS ROWS';
    } else if (categoryName.includes('CLASSIC') || categoryName.includes('STANDARD')) {
      rowLabel = 'CLASSIC ROWS';
    } else {
      // Fallback: use actual category name or default
      rowLabel = categoryName || 'ROWS';
    }
    
    return { 
      name: rowLabel, 
      price: firstSeat.price || category?.price || 200 
    };
  };
  
  // Format date like "Sun, 14 December, 2025"
  const formatDate = (dateString?: string) => {
    if (!dateString || !showtimeInfo?.showDate) return '';
    const date = new Date(showtimeInfo.showDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900">
      {/* Header - Movie Info */}
      <div className="mb-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {showtimeInfo?.movie?.title || 'Movie Title'} {showtimeInfo?.movie?.language && `- (${showtimeInfo.movie.language[0] || 'Hindi'})`}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {showtimeInfo?.screen?.theater?.name || 'Theater'} {showtimeInfo?.screen?.theater?.city && `| ${showtimeInfo.screen.theater.city}`} | {formatDate()} | {showtimeInfo?.showTime || '09:45 PM'}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
            <Pencil className="w-4 h-4" />
            <span>{selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''}</span>
          </button>
        </div>

        {/* Showtime Selection Bar */}
        <div className="flex gap-3 mt-4">
          {['05:50 PM', '09:45 PM', '10:00 PM'].map((time) => (
            <button
              key={time}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                time === (showtimeInfo?.showTime || '09:45 PM')
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Seating Layout */}
      <div className="px-4 mb-8 overflow-x-auto">
        <div className="space-y-4 min-w-max">
          {rowKeys.map((rowKey, rowIndex) => {
            const rowSeats = seatsByRow[rowKey];
            const rowCategory = getRowCategory(rowKey);
            const prevRowCategory = rowIndex > 0 ? getRowCategory(rowKeys[rowIndex - 1]) : null;
            const showCategoryLabel = !prevRowCategory || prevRowCategory.name !== rowCategory.name;

            return (
              <div key={rowKey}>
                {/* Category Label */}
                {showCategoryLabel && (
                  <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ₹{rowCategory.price} {rowCategory.name}
                  </div>
                )}
                
                {/* Row with Seats */}
                <div className="flex items-center gap-3">
                  {/* Row Label */}
                  <div className="w-6 text-left">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{rowKey}</span>
                  </div>
                  
                  {/* Seats */}
                  <div className="flex gap-1">
                    {rowSeats.map((seat) => {
                      // Extract seat number (remove row letter)
                      const seatNumStr = seat.seatNumber.replace(rowKey, '').replace(/^0+/, '') || seat.seatNumber.replace(rowKey, '');
                      const seatNum = parseInt(seatNumStr);
                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.isBooked}
                          className={`
                            relative w-12 h-12 sm:w-14 sm:h-14 text-sm font-bold rounded transition-all duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]
                            ${getSeatColor(seat)}
                            ${getSeatTextColor(seat)}
                            ${getSeatHoverEffects(seat)}
                            ${seat.isBooked ? 'opacity-75' : ''}
                          `}
                          aria-label={`${seat.seatNumber} seat, ${seat.isBooked ? 'Sold' : seat.isSelected ? 'Selected' : 'Available'}, Price: ₹${seat.price}`}
                          title={`${seat.seatNumber} - ₹${seat.price}${seat.isBooked ? ' (Sold)' : seat.isSelected ? ' (Selected)' : ' (Available)'}`}
                        >
                          <span>{seatNumStr}</span>
                          
                          {/* Wheelchair indicator for accessible seats (first and last seats) */}
                          {(seat.column === 1 || seat.column === rowSeats.length) && (
                            <span className="absolute -top-1 -right-1 text-xs">♿</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen Indicator */}
      <div className="px-4 mb-8">
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg py-4 text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">All eyes this way please</p>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-green-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-white border border-gray-300"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Sold</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span>YES Private Debit Card Offer</span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">1/3</div>
      </div>
    </div>
  );
};

export default SeatMap;
