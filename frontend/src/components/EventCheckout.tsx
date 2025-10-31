import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, CheckCircle, CreditCard, Share2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { useLanguage } from '../contexts/LanguageContext';

interface EventCheckoutProps {
  eventId: string;
  onNavigate: (page: string, id?: string) => void;
}

interface EventInfo {
  id: string;
  title: string;
  titleNe: string;
  description: string;
  descriptionNe: string;
  imageUrl: string;
  venue: string;
  venueNe: string;
  location: string;
  locationNe: string;
  eventDate: string;
  endDate?: string;
  priceMin: number;
  priceMax: number;
  category: string; // Added category for the event poster
}

export function EventCheckout({ eventId, onNavigate }: EventCheckoutProps) {
  const { language } = useLanguage();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'summary' | 'payment' | 'done'>('summary');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${eventId}`);
        const data = await res.json();
        if (data?.success && data.data?.event) setEvent(data.data.event as EventInfo);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const price = event ? Math.max(event.priceMin || 0, 0) : 0;
  const total = price * qty;

// Stepper subcomponent for EventCheckout
function Stepper({step}:{step:'summary'|'payment'|'done'}) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className={`flex items-center ${step === 'summary' ? 'text-red-600' : 'text-green-700'}`}>
        <CheckCircle className={`w-6 h-6 mr-2 ${step === 'summary' ? 'text-red-600' : 'text-green-600'}`} />
        <span className="font-bold">Summary</span>
      </div>
      <span className="mx-2 h-1 w-8 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></span>
      <div className={`flex items-center ${step === 'payment' || step === 'done' ? 'text-red-600' : 'text-gray-300'}`}>
        <CreditCard className={`w-6 h-6 mr-2 ${step === 'payment' || step === 'done' ? 'text-red-600' : 'text-gray-300'}`} />
        <span className="font-bold">Payment</span>
      </div>
    </div>
  );
}

  // --- Payment simulation ---
  function handlePayment() {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setStep('done');
      // Persist minimal booking info for success page
      try {
        const payload = { qty, price, total, ts: Date.now(), eventId };
        sessionStorage.setItem('eventBookingSuccess', JSON.stringify(payload));
      } catch {}
      onNavigate('event-booking-success', eventId); // Route to new success page
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 animate-page-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => onNavigate('event-detail', eventId)}
          className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Event</span>
        </button>

        {loading || !event ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Stepper step={step} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch animate-slide-up">
              {/* MAIN PANE: Event poster and details */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col gap-8 relative overflow-hidden select-none">
                {event.imageUrl && (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover rounded-2xl shadow-md mb-7 border-4 border-white dark:border-gray-900" style={{maxHeight: '15rem'}} />
                )}
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {language === 'en' ? event.title : event.titleNe}
                  </h1>
                  <p className="text-lg text-red-600 font-semibold mb-4">{event.category}</p>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">{new Date(event.eventDate).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">{language === 'en' ? event.venue : event.venueNe}</span>
                  </div>
                  <div className="font-light text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {language === 'en' ? event.description : event.descriptionNe}
                  </div>
                </div>
                {/* Ticket quantity selector, styled */}
                <div className="flex items-center gap-6 mt-5 mb-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
                  <button
                    aria-label="Decrease tickets"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2 rounded-full border-2 border-red-300 bg-white hover:bg-red-50 dark:bg-gray-900 dark:hover:bg-red-950 text-xl font-bold text-gray-800 dark:text-gray-100 transition-all shadow active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    –
                  </button>
                  <div className="px-6 py-3 rounded-full border-2 border-gray-300 bg-gray-100 dark:bg-gray-800 font-bold text-lg text-gray-900 dark:text-white min-w-[60px] text-center">
                    {qty}
                  </div>
                  <button
                    aria-label="Increase tickets"
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-2 rounded-full border-2 border-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-800 text-xl font-bold text-red-600 transition-all shadow active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* SUMMARY CARD + PAYMENT ACTION */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col justify-center min-h-[400px]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Order Summary</h2>
                <div className="flex items-center justify-between text-lg mb-3">
                  <span className="text-gray-700 dark:text-gray-400">Tickets</span>
                  <span className="font-bold text-gray-900 dark:text-white">{qty}</span>
                </div>
                <div className="flex items-center justify-between text-lg mb-3">
                  <span className="text-gray-700 dark:text-gray-400">Price per Ticket</span>
                  <span className="font-semibold text-gray-900 dark:text-white">NPR {price}</span>
                </div>
                <div className="border-t my-3" />
                <div className="flex items-center justify-between text-gray-900 dark:text-white font-extrabold text-2xl mb-6">
                  <span>Total</span>
                  <span>NPR {total}</span>
                </div>
                {/* Only show proceed/pay on summary */}
                {step === 'summary' && (
                  <button
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-bold shadow-lg text-lg mt-4 lift hover:scale-105"
                    onClick={() => setStep('payment')}
                  >
                    Proceed to Pay
                  </button>
                )}
                {/* Payment Step: placeholder for payment screen */}
                {step === 'payment' && (
                  <>
                    <div className="mb-5 py-8 flex flex-col items-center">
                      <CreditCard className="w-12 h-12 text-red-600 mb-4 animate-bounce" />
                      <div className="font-bold text-xl mb-2">Payment</div>
                      <div className="text-gray-700 dark:text-gray-300 text-lg mb-4">(Mock UI) Pay now to confirm your tickets.</div>
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-bold shadow-lg text-lg mt-4 lift hover:scale-105 disabled:opacity-60"
                      onClick={handlePayment}
                      disabled={paying}
                    >
                      {paying ? 'Processing Payment...' : 'Pay Now'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Stub for EventBookingSuccess page ---
export function EventBookingSuccess({ eventId, onNavigate }: { eventId: string, onNavigate: (page: string, id?: string) => void }) {
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [info, setInfo] = useState<{qty:number; price:number; total:number; ts:number}|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${eventId}`);
        const data = await res.json();
        if (data?.success && data.data?.event) setEvent(data.data.event as EventInfo);
      } catch {}
      try {
        const raw = sessionStorage.getItem('eventBookingSuccess');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.eventId === eventId) setInfo({ qty: parsed.qty, price: parsed.price, total: parsed.total, ts: parsed.ts });
        }
      } catch {}
    })();
  }, [eventId]);

  const handleShare = async () => {
    const shareText = `Booked ${info?.qty || 1} ticket(s) for ${event?.title || 'Event'} on ${event?.eventDate ? new Date(event.eventDate).toLocaleString() : ''} via ShowSewa.`;
    const url = globalThis.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ShowSewa Ticket', text: shareText, url });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${url}`);
        alert('Link copied to clipboard');
      }
    } catch {}
  };

  const handleDownload = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a6' });
    const pad = 18;
    doc.setFillColor(237, 28, 36); // red header
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 72, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(16);
    doc.text('ShowSewa • Event Ticket', pad, 44);
    doc.setTextColor(20,20,20);
    doc.setFontSize(14);
    doc.text(event?.title || 'Event', pad, 98, { maxWidth: 280 });
    doc.setFontSize(11);
    if (event?.eventDate) doc.text(`Date: ${new Date(event.eventDate).toLocaleString()}`, pad, 118);
    if (event?.venue) doc.text(`Venue: ${event.venue}`, pad, 136);
    if (info) {
      doc.text(`Tickets: ${info.qty}`, pad, 156);
      doc.text(`Price: NPR ${info.price}`, pad, 174);
      doc.setFontSize(13);
      doc.text(`Total: NPR ${info.total}`, pad, 198);
    }
    doc.setDrawColor(230);
    doc.line(pad, 210, doc.internal.pageSize.getWidth()-pad, 210);
    doc.setFontSize(9);
    doc.text('Thank you for booking with ShowSewa', pad, 232);
    doc.save(`ShowSewa-${event?.title || 'Ticket'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-green-100 dark:bg-green-900/40 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
            <h1 className="text-3xl font-extrabold text-green-700 dark:text-green-300">Booking Confirmed</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2">Your tickets are confirmed. Enjoy the event!</p>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <div className="flex gap-5 items-start">
                <div className="w-28 h-36 rounded-xl overflow-hidden bg-gray-200 shadow">
                  {event?.imageUrl ? <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{event?.title}</div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span>{event?.eventDate ? new Date(event.eventDate).toLocaleString() : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>{event?.venue}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 pt-2">
                    <span className="font-semibold">Tickets:</span> {info?.qty || 1}
                    <span className="ml-4 font-semibold">Total:</span> NPR {info?.total || info?.price || 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleShare} className="btn-secondary w-full flex items-center justify-center">
                <Share2 className="w-5 h-5" /> Share
              </button>
              <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center">
                <Download className="w-5 h-5" /> Download Ticket (PDF)
              </button>
              <button onClick={() => onNavigate('home')} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600">Go to Home</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


