import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock, MapPin, Users, Ticket, CreditCard, Check, Download, Share2, Calendar, Film } from 'lucide-react';
import SeatMap from './SeatMap';
import { TheaterSelection } from './TheaterSelection';
import { useAuth } from '../contexts/AuthContext';
import { TicketCard } from './TicketCard';
import { useCity } from '../contexts/CityContext';
import jsPDF from 'jspdf';

interface BookingPageProps {
  onNavigate: (page: string, id?: string) => void;
  showtimeId?: string;
}

interface SelectedSeat {
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

const BookingPage: React.FC<BookingPageProps> = ({ onNavigate, showtimeId }) => {
  const { user, isAuthenticated } = useAuth();
  const { selectedCity } = useCity();
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  // If showtimeId is provided, skip theater selection - go straight to seats
  const [currentStep, setCurrentStep] = useState<'theater' | 'seats' | 'summary' | 'payment' | 'confirmation'>(showtimeId ? 'seats' : 'theater');
  const [selectedTheater, setSelectedTheater] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showtimeInfo, setShowtimeInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [bookingResponse, setBookingResponse] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Fetch showtime information
  useEffect(() => {
    const fetchShowtimeInfo = async () => {
      if (!showtimeId) {
        setError('No showtime selected');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching showtime info for ID:', showtimeId);
        
        const response = await fetch(`http://localhost:5000/api/seats/showtime/${showtimeId}`);
        
        console.log('Showtime API response status:', response.status);
        
        let data: any;
        
        // Get response data even if status is not ok
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Failed to parse server response');
        }

        console.log('Showtime API data:', data);

        // Handle showtime exists but seats not configured (200 with warning or 404 with data)
        if ((response.status === 200 && data.warning) || (response.status === 404 && data.data && data.data.showtime)) {
          // Showtime exists but no seats configured
          setShowtimeInfo(data.data.showtime);
          setError(data.message || 'No seats are configured for this screen. Please contact the theater administrator to set up seats.');
          return;
        }

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Showtime not found. It may have been cancelled or removed. Please select a different showtime.');
          } else {
            throw new Error(data.message || `Failed to fetch showtime information (${response.status})`);
          }
        }
        
        if (data.success && data.data && data.data.showtime) {
          setShowtimeInfo(data.data.showtime);
          
          // Auto-set theater from showtime (skip theater selection step)
          if (data.data.showtime.screen?.theater) {
            setSelectedTheater(data.data.showtime.screen.theater);
          }
        } else if (data.warning && data.data && data.data.showtime) {
          // Handle warning case (seats being generated)
          setShowtimeInfo(data.data.showtime);
          
          // Auto-set theater from showtime (skip theater selection step)
          if (data.data.showtime.screen?.theater) {
            setSelectedTheater(data.data.showtime.screen.theater);
          }
        } else {
          throw new Error(data.message || 'Failed to load showtime information');
        }
      } catch (error) {
        console.error('Error fetching showtime info:', error);
        setError(error instanceof Error ? error.message : 'Failed to load show information. Please try again or select a different showtime.');
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimeInfo();
  }, [showtimeId]);

  // Pre-fill customer info if user is logged in
  useEffect(() => {
    if (user && isAuthenticated) {
      setCustomerInfo({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });
    }
  }, [user, isAuthenticated]);

  const handleSeatSelection = (seats: SelectedSeat[], price: number) => {
    setSelectedSeats(seats);
    setTotalPrice(price);
  };

  const handleProceedToSummary = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    setCurrentStep('summary');
  };

  const handleProceedToPayment = () => {
    setCurrentStep('payment');
  };

  const handleBackToSeats = () => {
    if (currentStep === 'summary') {
      setCurrentStep('seats');
    } else if (currentStep === 'seats') {
      setCurrentStep('theater');
    }
  };

  const handlePayment = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in all customer details');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      // Show loading state
      setLoading(true);
      
      // Create booking via API
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          showtimeId: showtimeId,
          seatNumbers: selectedSeats.map(seat => seat.seatNumber),
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          userId: user?.id,
          paymentMethod: paymentMethod || 'CASH',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Booking API Error:', data);
        throw new Error(data.message || data.error || 'Failed to create booking');
      }

      if (data.success) {
        const bookingId = data.data?.booking?.id;
        const requiresPayment = data.data?.requiresPayment || false;
        
        // If online payment is required (Khalti/eSewa), initiate payment
        if (requiresPayment && (paymentMethod === 'KHALTI' || paymentMethod === 'ESEWA')) {
          try {
            // Initiate payment
            const paymentResponse = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookingId: bookingId,
                paymentMethod: paymentMethod
              }),
            });

            const paymentData = await paymentResponse.json();
            
            if (paymentData.success && paymentData.data?.paymentUrl) {
              // Redirect to payment gateway
              window.location.href = paymentData.data.paymentUrl;
              return; // Don't proceed further, user will be redirected
            } else {
              throw new Error(paymentData.message || 'Failed to initiate payment');
            }
          } catch (paymentError) {
            console.error('Payment initiation error:', paymentError);
            alert(`Payment initiation failed: ${paymentError instanceof Error ? paymentError.message : 'Unknown error'}`);
            setLoading(false);
            return;
          }
        }

        // For CASH payments or if payment already completed
        // Store booking response
        setBookingResponse(data);
        // Generate booking reference and set payment method
        const bookingRef = data.data?.booking?.bookingReference || data.data?.bookingReference || `SS${Date.now()}`;
        setBookingReference(bookingRef);
        
        // Generate QR code URL if QR code data exists
        if (data.data?.booking?.qrCode) {
          const qrString = data.data.booking.qrCode;
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`);
        } else if (data.data?.booking?.id) {
          // Fetch QR code if not in response
          try {
            const qrResponse = await fetch(`${API_BASE_URL}/api/qr/generate/${data.data.booking.id}`);
            const qrData = await qrResponse.json();
            if (qrData.success && qrData.data?.qrString) {
              setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.data.qrString)}`);
            }
          } catch (qrError) {
            console.warn('Could not fetch QR code:', qrError);
          }
        }
        
        setCurrentStep('confirmation');
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(`Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const convenienceFee = Math.round(totalPrice * 0.05); // 5% convenience fee
  const finalTotal = totalPrice + convenienceFee;

  // Download ticket functionality
  const handleDownloadTicket = async () => {
    try {
      console.log('Download ticket clicked');
      
      // Helper to convert image URL to data URL
      const toDataURL = async (url: string) => {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(blob);
          });
        } catch {
          return '';
        }
      };

      // Get QR code
      let qrDataUrl: string | null = null;
      if (qrCodeUrl) {
        qrDataUrl = await toDataURL(qrCodeUrl);
      } else if (bookingResponse?.data?.booking?.id) {
        try {
          const qrRes = await fetch(`http://localhost:5000/api/qr/generate/${bookingResponse.data.booking.id}`);
          const qrJson = await qrRes.json();
          const qrString: string | undefined = qrJson?.data?.qrString;
          if (qrString) {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrString)}`;
            qrDataUrl = await toDataURL(qrUrl);
          }
        } catch (e) {
          console.warn('QR generation fallback');
        }
      }
      
      // Create a new PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Set up colors
      const primaryColor: [number, number, number] = [220, 38, 38]; // Red color
      const secondaryColor: [number, number, number] = [75, 85, 99]; // Gray color
      const accentColor: [number, number, number] = [59, 130, 246]; // Blue color
      
      // Header with better styling
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('SHOWSEWA', 105, 18, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('MOVIE TICKET', 105, 26, { align: 'center' });
      
      let yPosition = 50;
      
      // Add a decorative border
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.rect(15, 45, 180, 240);
      
      // Booking Details Section
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('BOOKING DETAILS', 20, yPosition);
      
      // Add underline
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.line(20, yPosition + 1, 80, yPosition + 1);
      
      yPosition += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Booking Reference: ${bookingReference || `SS${Date.now()}`}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Booking Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Booking Time: ${new Date().toLocaleTimeString()}`, 20, yPosition);
      yPosition += 15;
      
      // Movie Information Section
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MOVIE INFORMATION', 20, yPosition);
      
      // Add underline
      doc.line(20, yPosition + 1, 85, yPosition + 1);
      
      yPosition += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Movie: ${showtimeInfo?.movie?.title || 'Movie Title'}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Date: ${showtimeInfo ? new Date(showtimeInfo.showDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }) : 'N/A'}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Time: ${showtimeInfo?.showTime || 'N/A'}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Theater: ${showtimeInfo?.screen?.theater?.name || 'N/A'}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Screen: ${showtimeInfo?.screen?.screenNumber || 'N/A'}`, 20, yPosition);
      yPosition += 15;
      
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
      
      selectedSeats.forEach((seat) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`Seat ${seat.seatNumber} - NPR ${seat.price.toLocaleString()}`, 20, yPosition);
        yPosition += 7;
      });
      
      doc.text(`Total Seats: ${selectedSeats.length}`, 20, yPosition);
      yPosition += 15;
      
      // Payment Summary Section
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT SUMMARY', 20, yPosition);
      
      // Add underline
      doc.line(20, yPosition + 1, 85, yPosition + 1);
      
      yPosition += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ticket Price: NPR ${totalPrice.toLocaleString()}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Convenience Fee: NPR ${convenienceFee.toLocaleString()}`, 20, yPosition);
      yPosition += 7;
      doc.setTextColor(...accentColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Total Amount: NPR ${finalTotal.toLocaleString()}`, 20, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Payment Method: ${paymentMethod}`, 20, yPosition);
      yPosition += 15;
      
      // Customer Information Section
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER INFORMATION', 20, yPosition);
      
      // Add underline
      doc.line(20, yPosition + 1, 90, yPosition + 1);
      
      yPosition += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${customerInfo.name}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Email: ${customerInfo.email}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Phone: ${customerInfo.phone}`, 20, yPosition);
      yPosition += 20;
      
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
      
      // Add a QR code placeholder area
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(150, 200, 40, 40);
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('QR Code', 165, 222, { align: 'center' });
      
      // Save the PDF
      const fileName = `ShowSewa_Ticket_${bookingReference || Date.now()}.pdf`;
      doc.save(fileName);

      // Show success message
      alert('Ticket downloaded successfully as PDF!');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  // Share booking functionality
  const handleShareBooking = async () => {
    try {
      const shareData = {
        title: 'My Movie Booking - ShowSewa',
        text: `I just booked tickets for ${showtimeInfo?.movie?.title || 'a movie'} on ShowSewa! 🎬\n\nBooking Reference: ${bookingReference || `SS${Date.now()}`}\nDate: ${showtimeInfo ? new Date(showtimeInfo.showDate).toLocaleDateString() : 'N/A'}\nTime: ${showtimeInfo?.showTime || 'N/A'}\nSeats: ${selectedSeats.map(seat => seat.seatNumber).join(', ')}\nTheater: ${showtimeInfo?.screen?.theater?.name || 'N/A'}`,
        url: window.location.origin
      };

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        const shareText = `${shareData.title}\n\n${shareData.text}\n\nBook your tickets at: ${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert('Booking details copied to clipboard! You can now share it with others.');
      }
    } catch (error) {
      console.error('Error sharing booking:', error);
      
      // Final fallback: Copy to clipboard
      try {
        const fallbackText = `I just booked tickets for ${showtimeInfo?.movie?.title || 'a movie'} on ShowSewa! 🎬\n\nBooking Reference: ${bookingReference || `SS${Date.now()}`}\nDate: ${showtimeInfo ? new Date(showtimeInfo.showDate).toLocaleDateString() : 'N/A'}\nTime: ${showtimeInfo?.showTime || 'N/A'}\nSeats: ${selectedSeats.map(seat => seat.seatNumber).join(', ')}\nTheater: ${showtimeInfo?.screen?.theater?.name || 'N/A'}\n\nBook your tickets at: ${window.location.origin}`;
        await navigator.clipboard.writeText(fallbackText);
        alert('Booking details copied to clipboard! You can now share it with others.');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share automatically. Please copy the booking reference manually.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-page-fade-in">
      {/* Header with Progress Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (currentStep === 'theater') {
                  onNavigate('home');
                } else if (currentStep === 'seats') {
                  setCurrentStep('theater');
                } else if (currentStep === 'summary') {
                  setCurrentStep('seats');
                } else if (currentStep === 'payment') {
                  setCurrentStep('summary');
                } else {
                  onNavigate('home');
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-all duration-300 hover:gap-3 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Your Seats</h1>
            <div className="w-24"></div>
          </div>
          
          {/* Progress Bar - BookMyShow Style */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              {[
                { step: 'theater', label: 'Theater', icon: MapPin },
                { step: 'seats', label: 'Seats', icon: Ticket },
                { step: 'summary', label: 'Summary', icon: Check },
                { step: 'payment', label: 'Payment', icon: CreditCard },
                { step: 'confirmation', label: 'Confirm', icon: Check }
              ].map(({ step, label, icon: Icon }, index) => {
                const stepOrder = ['theater', 'seats', 'summary', 'payment', 'confirmation'];
                const currentStepIndex = stepOrder.indexOf(currentStep);
                const isActive = step === currentStep;
                const isCompleted = stepOrder.indexOf(step) < currentStepIndex;
                
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isActive 
                            ? 'bg-red-600 border-red-600 text-white scale-110' 
                            : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`mt-2 text-xs font-medium ${isActive || isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {label}
                      </span>
                    </div>
                    {index < 4 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                        isCompleted || (stepOrder.indexOf(step) < currentStepIndex)
                          ? 'bg-green-500' 
                          : 'bg-gray-200'
                      }`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Movie Info */}
        <div className="card mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                <div className="text-gray-500 dark:text-gray-400">Loading movie information...</div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ {error}</div>
              <button
                onClick={() => onNavigate('movies')}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Movies
              </button>
            </div>
          ) : showtimeInfo ? (
            <div className="card-body flex items-center gap-6">
              <div className="w-20 h-30 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                {showtimeInfo.movie?.posterUrl ? (
                  <img 
                    src={showtimeInfo.movie.posterUrl} 
                    alt={showtimeInfo.movie?.title || "Movie Poster"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${showtimeInfo.movie?.posterUrl ? 'hidden' : ''}`}>
                  <Film className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {showtimeInfo.movie?.title || 'Loading...'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {showtimeInfo.movie?.description || 'Movie description not available'}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>{showtimeInfo.movie?.duration ? `${Math.floor(showtimeInfo.movie.duration / 60)}h ${showtimeInfo.movie.duration % 60}m` : 'Duration not available'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>{showtimeInfo.theater?.name || 'Theater not available'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>{showtimeInfo.screen?.name || 'Screen not available'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ticket className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>
                      {new Date(showtimeInfo.showDate).toLocaleDateString()} at {showtimeInfo.showTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">Error loading movie information</div>
            </div>
          )}
        </div>

        {/* Step 0: Theater Selection */}
        {currentStep === 'theater' && !error && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Theater</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose a theater in {selectedCity} to continue with your booking</p>
            </div>
            
            <TheaterSelection 
              onSelectTheater={(theater) => {
                setSelectedTheater(theater);
                setCurrentStep('seats');
              }}
              selectedTheater={selectedTheater}
            />
          </div>
        )}

        {/* Step 1: Seat Selection */}
        {currentStep === 'seats' && !error && (
          <div>
            {showtimeId && (
              <SeatMap 
                showtimeId={showtimeId}
                onSeatSelection={handleSeatSelection}
                showtimeInfo={showtimeInfo}
              />
            )}
            
            {selectedSeats.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleProceedToSummary}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                >
                  Review Booking
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Booking Summary */}
        {currentStep === 'summary' && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Movie & Show Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 animate-page-fade-in">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                  <Film className="w-5 h-5 text-blue-600" />
                  Movie & Show Details
                </h3>
                {showtimeInfo && (
                  <div className="flex gap-4">
                    <div className="w-24 h-36 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                      {showtimeInfo.movie?.posterUrl ? (
                        <img 
                          src={showtimeInfo.movie.posterUrl} 
                          alt={showtimeInfo.movie?.title || "Movie Poster"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${showtimeInfo.movie?.posterUrl ? 'hidden' : ''}`}>
                        <Film className="w-10 h-10 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {showtimeInfo.movie?.title || 'Movie Title'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{new Date(showtimeInfo.showDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{showtimeInfo.showTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{showtimeInfo.screen?.theater?.name} - {showtimeInfo.screen?.theater?.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">Screen {showtimeInfo.screen?.screenNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Seats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 animate-page-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                  <Ticket className="w-5 h-5 text-green-600" />
                  Selected Seats
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {selectedSeats.map((seat, index) => (
                    <div 
                      key={seat.id}
                      className="bg-green-100 border-2 border-green-300 rounded-lg p-3 text-center animate-page-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="text-sm font-semibold text-green-800">{seat.seatNumber}</div>
                      <div className="text-xs text-green-600">NPR {seat.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 sticky top-6 animate-page-slide-in-right">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                  <Check className="w-5 h-5 text-blue-600" />
                  Booking Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tickets ({selectedSeats.length})</span>
                    <span className="font-medium text-gray-900">NPR {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Convenience Fee</span>
                    <span className="font-medium text-gray-900">NPR {convenienceFee.toLocaleString()}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-blue-600">NPR {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                  >
                    Continue to Payment
                  </button>
                  <button
                    onClick={handleBackToSeats}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Change Seats
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 'payment' && !error && (
          <div className="space-y-8 animate-page-fade-in">
            {/* Progress Indicator */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  Payment & Booking Details
                </h2>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Step 3 of 4
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{width: '75%'}}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8 animate-page-slide-in-right">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Your Information</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        id="customerName"
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Enter your full name"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="customerEmail" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        id="customerEmail"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Enter your email address"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="w-5 h-5 text-gray-400">@</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="customerPhone" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        id="customerPhone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Enter your phone number"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="w-5 h-5 text-gray-400">📱</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Payment Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8 animate-page-slide-in-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Booking Summary</h3>
              </div>
              
              {/* Movie Info Card */}
              {showtimeInfo && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center shadow-sm">
                      {showtimeInfo.movie?.posterUrl ? (
                        <img 
                          src={showtimeInfo.movie.posterUrl} 
                          alt={showtimeInfo.movie?.title || "Movie Poster"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${showtimeInfo.movie?.posterUrl ? 'hidden' : ''}`}>
                        <Film className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg">{showtimeInfo.movie?.title || 'Movie Title'}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(showtimeInfo.showDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {showtimeInfo.showTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Selected Seats */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Selected Seats ({selectedSeats.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat, index) => (
                    <div 
                      key={seat.id}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {seat.seatNumber}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Price Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Ticket Price ({selectedSeats.length} seats)</span>
                    <span className="font-semibold text-gray-800 dark:text-white">NPR {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Convenience Fee</span>
                    <span className="font-semibold text-gray-800 dark:text-white">NPR {convenienceFee.toLocaleString()}</span>
                  </div>
                  <hr className="border-gray-300 dark:border-gray-600" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800 dark:text-white">Total Amount</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">NPR {finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Choose Payment Method
                </h4>
                <div className="space-y-4">
                  <label className={`group flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                    paymentMethod === 'ESEWA' 
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 dark:border-blue-500 shadow-lg scale-105' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="ESEWA" 
                      className="mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500" 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        paymentMethod === 'ESEWA' 
                          ? 'bg-blue-500 shadow-lg' 
                          : 'bg-blue-100 group-hover:bg-blue-200'
                      }`}>
                        <div className="text-white font-bold text-lg">e</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white text-lg">eSewa</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Digital wallet payment</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Instant payment • Secure</div>
                      </div>
                      {paymentMethod === 'ESEWA' && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </label>
                  
                  <label className={`group flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                    paymentMethod === 'KHALTI' 
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 dark:border-purple-500 shadow-lg scale-105' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="KHALTI" 
                      className="mr-4 w-5 h-5 text-purple-600 focus:ring-purple-500" 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        paymentMethod === 'KHALTI' 
                          ? 'bg-purple-500 shadow-lg' 
                          : 'bg-purple-100 group-hover:bg-purple-200'
                      }`}>
                        <div className="text-white font-bold text-lg">K</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white text-lg">Khalti</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Mobile payment solution</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quick & Easy • Reliable</div>
                      </div>
                      {paymentMethod === 'KHALTI' && (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </label>
                  
                  <label className={`group flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                    paymentMethod === 'CASH' 
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 dark:border-green-500 shadow-lg scale-105' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="CASH" 
                      className="mr-4 w-5 h-5 text-green-600 focus:ring-green-500" 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        paymentMethod === 'CASH' 
                          ? 'bg-green-500 shadow-lg' 
                          : 'bg-green-100 group-hover:bg-green-200'
                      }`}>
                        <div className="text-white font-bold text-lg">₹</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white text-lg">Cash Payment</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Pay at the theater counter</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">No online payment • Traditional</div>
                      </div>
                      {paymentMethod === 'CASH' && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!paymentMethod || loading}
                className="w-full mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    <span>
                      {paymentMethod === 'CASH' 
                        ? 'Complete Booking' 
                        : `Pay NPR ${finalTotal.toLocaleString()}`
                      }
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              {/* Security Notice */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span>Secure payment • SSL encrypted</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Step 4: Confirmation & Ticket Summary */}
        {currentStep === 'confirmation' && (
          <div className="space-y-8 animate-page-fade-in">
            {/* Success Header */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                  <Check className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-lg">🎉</span>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600 text-xl mb-6 max-w-2xl mx-auto">
                Your tickets have been booked successfully. You will receive a confirmation email shortly.
              </p>
              
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-6 py-3 rounded-full text-lg font-semibold shadow-lg">
                <Ticket className="w-5 h-5" />
                <span>Booking Reference: {bookingReference || `SS${Date.now()}`}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(bookingReference || `SS${Date.now()}`)}
                  className="ml-2 p-1 hover:bg-green-300 rounded-full transition-colors"
                  title="Copy booking reference"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ticket Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ticket Details */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg border p-8 animate-page-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Film className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Movie Details</h3>
                  </div>
                  
                  {showtimeInfo && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                      <div className="flex gap-6">
                        <div className="w-24 h-36 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center shadow-lg">
                          {showtimeInfo.movie?.posterUrl ? (
                            <img 
                              src={showtimeInfo.movie.posterUrl} 
                              alt={showtimeInfo.movie?.title || "Movie Poster"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${showtimeInfo.movie?.posterUrl ? 'hidden' : ''}`}>
                            <Film className="w-10 h-10 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-2xl font-bold text-gray-800 mb-3">
                            {showtimeInfo.movie?.title || 'Movie Title'}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {new Date(showtimeInfo.showDate).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <div className="text-gray-500 text-xs">Show Date</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{showtimeInfo.showTime}</div>
                                <div className="text-gray-500 text-xs">Show Time</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{showtimeInfo.screen?.theater?.name}</div>
                                <div className="text-gray-500 text-xs">Theater</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">Screen {showtimeInfo.screen?.screenNumber}</div>
                                <div className="text-gray-500 text-xs">Screen Number</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Seats */}
                <div className="bg-white rounded-xl shadow-lg border p-8 animate-page-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Your Seats</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedSeats.map((seat, index) => (
                      <div 
                        key={seat.id}
                        className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 text-center animate-page-fade-in shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="text-lg font-bold text-green-800 mb-1">{seat.seatNumber}</div>
                        <div className="text-sm text-green-600 font-semibold">NPR {seat.price.toLocaleString()}</div>
                        <div className="text-xs text-green-500 mt-1">Confirmed</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total Seats:</span>
                      <span className="text-xl font-bold text-green-600">{selectedSeats.length}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">NPR {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beautiful BookMyShow-style Ticket Card */}
              <div className="space-y-6">
                <TicketCard
                  bookingReference={bookingReference || `SS${Date.now()}`}
                  showtimeInfo={showtimeInfo}
                  selectedSeats={selectedSeats}
                  totalAmount={finalTotal}
                  qrCodeUrl={qrCodeUrl}
                  onShare={handleShareBooking}
                />

                {/* Booking Summary */}
                <div className="bg-white rounded-xl shadow-lg border p-8 animate-page-slide-in-right" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Payment Summary</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Customer Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-semibold text-gray-800">{customerInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-semibold text-gray-800">{customerInfo.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-semibold text-gray-800">{customerInfo.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Details */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tickets ({selectedSeats.length}):</span>
                          <span className="font-semibold text-gray-800 dark:text-white">NPR {totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Convenience Fee:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">NPR {convenienceFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">{paymentMethod}</span>
                        </div>
                        <hr className="border-gray-300 dark:border-gray-600 my-2" />
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-800 dark:text-white">Total Paid:</span>
                          <span className="text-green-600 dark:text-green-400">NPR {finalTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 animate-page-fade-in" style={{ animationDelay: '0.4s' }}>
                  <button 
                    onClick={() => onNavigate('movie-detail', showtimeInfo?.movie?.id)}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Film className="w-5 h-5" />
                    <span>View Movie Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={handleDownloadTicket}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Ticket</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={handleShareBooking}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => onNavigate('home')}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
