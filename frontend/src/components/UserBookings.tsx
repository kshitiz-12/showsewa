import { useState, useEffect } from 'react';
import { Ticket, Calendar, Clock, MapPin, Download, Eye, Film } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';

interface Booking {
  id: string;
  bookingReference: string;
  movieTitle: string;
  moviePosterUrl?: string;
  theaterName: string;
  showDate: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  status: string;
  createdAt: string;
  screenType?: string;
  movieId?: string;
}

interface UserBookingsProps {
  onNavigate: (page: string, id?: string) => void;
}

export function UserBookings({ onNavigate }: Readonly<UserBookingsProps>) {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadBookings();
    }
  }, [isAuthenticated, user]);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookings(data.data.bookings || []);
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleDownloadTicket = async (booking: Booking) => {
    try {
      console.log('Download ticket for booking:', booking);
      // Helpers
      const toDataURL = async (url: string) => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(blob);
        });
      };

      // Fetch QR payload from backend and build QR image
      let qrDataUrl: string | null = null;
      try {
        const qrRes = await fetch(`http://localhost:5000/api/qr/generate/${booking.id}`);
        const qrJson = await qrRes.json();
        const qrString: string | undefined = qrJson?.data?.qrString;
        if (qrString) {
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrString)}`;
          qrDataUrl = await toDataURL(qrUrl);
        }
      } catch (e) {
        console.warn('QR generation fallback – proceeding without image');
      }

      // Create a new PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Set up colors
      const primaryColor: [number, number, number] = [220, 38, 38]; // Red color
      const secondaryColor: [number, number, number] = [75, 85, 99]; // Gray color
      const accentColor: [number, number, number] = [59, 130, 246]; // Blue color
      
      // Header card with poster and title (BookMyShow-like)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 14, 186, 38, 4, 4, 'F');
      doc.setDrawColor(235, 235, 235);
      doc.roundedRect(12, 14, 186, 38, 4, 4);
      // Poster thumb
      if (booking.moviePosterUrl) {
        try {
          const posterDataUrl = await toDataURL(booking.moviePosterUrl);
          doc.addImage(posterDataUrl, 'JPEG', 16, 18, 24, 30, undefined, 'FAST');
        } catch {}
      }
      // Titles
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(booking.movieTitle, 44, 26);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      doc.setFontSize(11);
      doc.text(`${booking.screenType || '2D'} • ${new Date(booking.showDate).toLocaleDateString()} • ${booking.showTime}`, 44, 33);
      doc.text(booking.theaterName, 44, 40);
      
      let yPosition = 60;
      
      // Add a decorative border
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.rect(15, 45, 180, 240);
      
      // Ticket card body container
      doc.setDrawColor(235, 235, 235);
      doc.roundedRect(12, yPosition, 186, 170, 4, 4);

      // Left column: QR
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', 22, yPosition + 12, 48, 48);
      } else {
        doc.setDrawColor(200, 200, 200);
        doc.rect(22, yPosition + 12, 48, 48);
      }
      
      // Right column: meta
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Tickets', 80, yPosition + 18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.text(`${booking.seats.length} Ticket(s)`, 80, yPosition + 30);
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Screen / Audi`, 80, yPosition + 44);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${booking.screenType || 'Audi'}`, 136, yPosition + 44, { align: 'right' });
      
      // Booking details divider
      doc.setDrawColor(240, 240, 240);
      doc.line(22, yPosition + 70, 190, yPosition + 70);
      
      // Seats line
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      doc.text('Seats', 22, yPosition + 84);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const seatsText = booking.seats.join(', ');
      doc.text(seatsText, 22, yPosition + 96);
      // Booking ID
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      doc.text('BOOKING ID:', 22, yPosition + 112);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(booking.bookingReference, 60, yPosition + 112);
      
      // Seat Information Section
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SEAT INFORMATION', 20, yPosition);
      
      // Add underline
      doc.line(20, yPosition + 1, 80, yPosition + 1);
      
      yPosition += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      for (const seat of booking.seats) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`Seat ${seat}`, 20, yPosition);
        yPosition += 7;
      }
      
      doc.text(`Total Seats: ${booking.seats.length}`, 20, yPosition);
      yPosition += 15;
      
      // Bottom bar (total)
      yPosition += 118;
      doc.setFillColor(249, 250, 251);
      doc.rect(12, yPosition, 186, 22, 'F');
      
      // Add underline
      doc.line(20, yPosition + 1, 85, yPosition + 1);
      
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Total Amount', 20, yPosition + 14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`NPR ${booking.totalAmount.toLocaleString()}`, 55, yPosition + 14);
      
      // Add a separator line
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 12;
      
      // Footer with better styling
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Show this ticket at the theater entrance', 20, yPosition);
      yPosition += 7;
      doc.text('Enjoy your movie experience!', 20, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Generated by ShowSewa', 20, yPosition);
      
      // Status note
      doc.setTextColor(140, 140, 140);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Cancellation may not be available at this venue', 120, yPosition + 14, { align: 'right' });
      
      // Save the PDF
      const fileName = `ShowSewa_Ticket_${booking.bookingReference}.pdf`;
      doc.save(fileName);

      // Show success message
      alert('Ticket downloaded successfully as PDF!');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to view your bookings
          </h1>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all your movie and event bookings
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No bookings yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start exploring and book your first movie or event!
          </p>
          <button
            onClick={() => onNavigate('movies')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex gap-4 flex-1">
                    {/* Movie Poster */}
                    <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {booking.moviePosterUrl ? (
                        <img 
                          src={booking.moviePosterUrl} 
                          alt={booking.movieTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${booking.moviePosterUrl ? 'hidden' : ''}`}>
                        <Film className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {booking.movieTitle}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {booking.theaterName}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.showDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{booking.showTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.seats.length} seat(s)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {booking.seats.map((seat) => (
                        <span
                          key={seat}
                          className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Booking Reference
                          </p>
                          <p className="font-mono text-sm text-gray-900 dark:text-white">
                            {booking.bookingReference}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            रू {booking.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:ml-6">
                    <button 
                      onClick={() => onNavigate('movie-detail', booking.movieId)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button 
                      onClick={() => handleDownloadTicket(booking)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
