import React from 'react';
import { Ticket, Share2, X, QrCode, Calendar, MapPin } from 'lucide-react';

interface TicketCardProps {
  bookingReference: string;
  showtimeInfo: any;
  selectedSeats: any[];
  totalAmount: number;
  qrCodeUrl: string | null;
  onShare?: () => void;
  onClose?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  bookingReference,
  showtimeInfo,
  selectedSeats,
  totalAmount,
  qrCodeUrl,
  onShare,
  onClose
}) => {
  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-md mx-auto">
      {/* Ticket Header */}
      <div className="relative bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Ticket className="w-6 h-6 text-red-600" />
          Your Ticket
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={onShare}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share ticket"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Movie Poster & Title Section */}
      {showtimeInfo && (
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex gap-4 items-start">
            {/* Movie Poster */}
            <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 shadow-md">
              {showtimeInfo.movie?.posterUrl ? (
                <img 
                  src={showtimeInfo.movie.posterUrl} 
                  alt={showtimeInfo.movie?.title || "Movie"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-400 text-xs text-center p-2">No Poster</div>
                </div>
              )}
            </div>
            
            {/* Movie Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {showtimeInfo.movie?.title || 'Movie Title'} ({showtimeInfo.movie?.language?.[0] || 'Hindi'}) ({showtimeInfo.movie?.rating || 'UA'})
              </h4>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                <span>{showtimeInfo.movie?.language?.join(', ') || 'Hindi'}, {showtimeInfo.screen?.screenType || '2D'}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(showtimeInfo.showDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} | {showtimeInfo.showTime}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {showtimeInfo.screen?.theater?.name || 'Theater'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Button */}
      <button className="w-full px-6 py-3 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 border-b border-gray-100 transition-colors text-left">
        Tap for support, details & more actions
      </button>

      {/* QR Code & Ticket Details Section */}
      <div className="px-6 py-6">
        <div className="flex gap-6 items-start">
          {/* QR Code */}
          <div className="flex-shrink-0">
            <div className="w-40 h-40 bg-white border-2 border-gray-200 rounded-lg p-2 flex items-center justify-center">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <QrCode className="w-16 h-16 mb-2" />
                  <span className="text-xs">QR Code</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">{selectedSeats.length} Ticket(s)</div>
              <div className="text-2xl font-bold text-gray-900">{showtimeInfo?.screen?.screenType || 'Audi'} {showtimeInfo?.screen?.screenNumber || '1'}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-1">Seats</div>
              <div className="text-lg font-semibold text-gray-900">
                {selectedSeats.map(s => s.seatNumber || s).join(', ')}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">BOOKING ID</div>
              <div className="text-base font-bold text-gray-900">{bookingReference}</div>
            </div>
          </div>
        </div>

        {/* Cancellation Notice */}
        <div className="mt-5 pt-5 border-t border-gray-200">
          <p className="text-sm text-gray-500">Cancellation not available for this venue</p>
        </div>
      </div>

      {/* Total Amount Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Total Amount</span>
        <span className="text-xl font-bold text-gray-900">NPR {totalAmount.toLocaleString()}</span>
      </div>

      {/* Box Office Pickup Label - Rotated */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 rotate-90 origin-center">
        <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 border border-gray-200 rounded shadow-sm whitespace-nowrap">
          Box Office Pickup
        </span>
      </div>
    </div>
  );
};

