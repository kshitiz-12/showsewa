import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

interface PaymentFailureProps {
  readonly onNavigate?: (page: string, id?: string) => void;
}

export function PaymentFailure({ onNavigate }: PaymentFailureProps) {
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    setBookingId(params.get('bookingId'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">
          Your payment could not be processed. Please try again or contact support if the problem persists.
        </p>
        {bookingId && (
          <p className="text-sm text-gray-500 mb-6">
            Booking ID: {bookingId}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
              } else {
                globalThis.location.href = '/';
              }
            }}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Go to Home
          </button>
          <button
            onClick={() => globalThis.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
