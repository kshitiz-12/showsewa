import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface PaymentSuccessProps {
  readonly onNavigate?: (page: string, id?: string) => void;
}

export function PaymentSuccess({ onNavigate }: PaymentSuccessProps) {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams(globalThis.location.search));

  useEffect(() => {
    // Update params when URL changes
    setParams(new URLSearchParams(globalThis.location.search));
  }, []);

  const bookingId = params.get('bookingId');
  const pidx = params.get('pidx'); // Khalti
  const transaction_uuid = params.get('transaction_uuid'); // eSewa
  const total_amount = params.get('total_amount'); // eSewa

  useEffect(() => {
    const verifyPayment = async () => {
      if (!bookingId) {
        setError('Booking ID not found');
        setLoading(false);
        return;
      }

      try {
        // Determine payment method from URL params
        const paymentMethod = pidx ? 'KHALTI' : 'ESEWA';

        // Verify payment
        const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            paymentMethod,
            pidx: pidx || null,
            transaction_uuid: transaction_uuid || null,
            total_amount: total_amount || null,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSuccess(true);
          setBookingData(data.data?.booking);
        } else {
          setError(data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [bookingId, pidx, transaction_uuid, total_amount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => onNavigate ? onNavigate('home') : (window.location.href = '/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your booking has been confirmed. A confirmation email has been sent to your email address.
          </p>
          {bookingData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">Booking Reference</p>
              <p className="text-lg font-semibold">{bookingData.bookingReference}</p>
            </div>
          )}
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
              } else {
                globalThis.location.href = '/';
              }
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}
