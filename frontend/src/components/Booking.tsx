import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface BookingProps {
  itemId: string;
  onNavigate: (page: string, id?: string) => void;
}

export function Booking({ itemId, onNavigate }: BookingProps) {
  const { t } = useLanguage();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [pricePerSeat, setPricePerSeat] = useState(500);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 12;
  const bookedSeats = ['A5', 'A6', 'C3', 'C4', 'E7', 'E8', 'F5'];

  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) return;

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const totalAmount = selectedSeats.length * pricePerSeat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('bookings')
      .insert([{
        booking_type: 'event',
        item_id: itemId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        seats: selectedSeats,
        total_amount: totalAmount,
        booking_status: 'confirmed'
      }]);

    if (!error) {
      alert('Booking confirmed! Check your email for details.');
      onNavigate('home');
    } else {
      alert('Booking failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('home')}
          className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {t('booking.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('booking.select_seats')}
              </h2>

              <div className="mb-6">
                <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-2"></div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  {t('booking.screen')}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {rows.map(row => (
                  <div key={row} className="flex items-center justify-center gap-2">
                    <div className="w-8 text-center font-semibold text-gray-600 dark:text-gray-400">
                      {row}
                    </div>
                    {Array.from({ length: seatsPerRow }, (_, i) => {
                      const seatNumber = i + 1;
                      const seatId = `${row}${seatNumber}`;
                      const isBooked = bookedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId)}
                          disabled={isBooked}
                          className={`w-8 h-8 rounded-t-lg text-xs font-semibold transition-all ${
                            isBooked
                              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                              : isSelected
                              ? 'bg-red-600 text-white scale-110'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {seatNumber}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-t-lg"></div>
                  <span className="text-gray-600 dark:text-gray-400">{t('booking.available')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-t-lg"></div>
                  <span className="text-gray-600 dark:text-gray-400">{t('booking.selected')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 dark:bg-gray-600 rounded-t-lg"></div>
                  <span className="text-gray-600 dark:text-gray-400">{t('booking.booked')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('booking.customer_details')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('booking.name')}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('booking.email')}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('booking.phone')}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Booking Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Selected Seats:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedSeats.length || '-'}
                  </span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedSeats.join(', ')}
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Price per seat:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    NPR {pricePerSeat.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>{t('booking.total_amount')}</span>
                  <span className="text-red-600">
                    NPR {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t('booking.payment_methods')}
                </h3>
                <div className="flex gap-3">
                  <div className="flex-1 p-3 border-2 border-red-600 rounded-lg flex items-center justify-center">
                    <img
                      src="https://esewa.com.np/common/images/esewa_logo.png"
                      alt="eSewa"
                      className="h-6"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex-1 p-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
                    <img
                      src="https://khalti.com/logo.png"
                      alt="Khalti"
                      className="h-6"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || selectedSeats.length === 0}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {t('booking.confirm_booking')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}