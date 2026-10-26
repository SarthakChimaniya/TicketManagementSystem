import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Ticket, QrCode, Printer, Home, Calendar, Clock, MapPin, Film, Share2 } from 'lucide-react';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const { booking, eTicket, showData, selectedSeats = [] } = state;

  if (!booking && !eTicket) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">No active booking confirmation found</h2>
        <p className="text-xs text-slate-400">
          If you recently purchased a ticket, you can find it under your profile booking history.
        </p>
        <button
          onClick={() => navigate('/profile?tab=bookings')}
          className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase"
        >
          Go to My Bookings
        </button>
      </div>
    );
  }

  const bookingId = eTicket?.bookingId || booking?.bookingId || 'BKG-CONFIRMED';
  const movieName = eTicket?.movieName || showData?.movieDetails?.movieName || 'iMovies Blockbuster';
  const theatreName = eTicket?.theatreName || showData?.theatreName || 'iMovies Cineplex';
  const theatreLocation = eTicket?.location || showData?.theatreDetails?.location || 'Main Auditorium';
  const showDate = eTicket?.showDate || (showData?.showdate ? new Date(showData.showdate).toLocaleDateString() : 'Today');
  const showTime = eTicket?.showTime || showData?.showtime || '07:30 PM';
  const seatsList = Array.isArray(booking?.ticketsData)
    ? booking.ticketsData.join(', ')
    : selectedSeats.map((s) => s.seatNumber).join(', ') || 'Seats Confirmed';
  const totalAmount = eTicket?.totalAmount || booking?.totalAmount || 0;
  const qrToken = eTicket?.qrCodeToken || `IMOVIE-TKT-${bookingId}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Success Notification */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Booking Confirmed!</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your e-ticket has been generated and sent to your registered email & phone. Please present this ticket at the cinema screen entrance.
        </p>
      </div>

      {/* Modern Cinema E-Ticket Pass */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Cinema Ticket Header */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight">iMovies Digital Pass</span>
              <p className="text-[10px] uppercase font-bold text-rose-100 tracking-wider">Official E-Ticket</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Reference ID</span>
            <p className="text-xs font-mono font-black">{bookingId}</p>
          </div>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">{movieName}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 mt-2">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>{showDate}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>{showTime}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center space-x-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{theatreName} ({theatreLocation})</span>
              </span>
            </div>
          </div>

          {/* Seat Tag Grid */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Seats Reserved</span>
              <p className="text-lg font-black text-rose-400 mt-0.5">{seatsList}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Payment Status</span>
              <p className="text-xs font-extrabold text-emerald-400 mt-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PAID & CONFIRMED</span>
              </p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px]">Total Paid</span>
              <p className="text-lg font-black text-white mt-0.5">₹{totalAmount}</p>
            </div>
          </div>

          {/* Scannable QR Code Token & Barcode */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Verification QR Token</span>
              <p className="text-xs font-mono font-bold text-slate-200">{qrToken}</p>
              <p className="text-[10px] text-slate-500">Scan at kiosk or show to theatre usher</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-md">
              <QrCode className="w-14 h-14 text-slate-950" />
            </div>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative border-t-2 border-dashed border-slate-800 my-2">
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-950 border border-slate-800"></div>
          <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-slate-950 border border-slate-800"></div>
        </div>

        {/* Ticket Footer Action Buttons */}
        <div className="p-6 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ticket</span>
          </button>

          <div className="flex items-center space-x-2">
            <Link
              to="/profile?tab=bookings"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
            >
              View in My Bookings
            </Link>
            <Link
              to="/"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Return to Home"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BookingConfirmation;
