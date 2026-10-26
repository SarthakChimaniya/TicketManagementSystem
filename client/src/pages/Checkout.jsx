import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, AlertTriangle, ArrowLeft, Shield, Ticket, QrCode, Loader2 } from 'lucide-react';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const stateData = location.state || {};
  const { showId, showData, selectedSeats = [], totalAmount = 0 } = stateData;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // If accessed directly without selection, redirect
  if (!showId || selectedSeats.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No active checkout session found</h2>
        <p className="text-sm text-slate-400">Please select a movie and seats to begin checkout.</p>
        <button
          onClick={() => navigate('/movies')}
          className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-md"
        >
          Browse Movies
        </button>
      </div>
    );
  }

  const seatNumbers = selectedSeats.map((s) => s.seatNumber);
  const convenienceFee = Math.round(totalAmount * 0.05); // 5% fee
  const grandTotal = totalAmount + convenienceFee;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // 1. Process payment via backend endpoint
      const res = await bookingAPI.processPayment({
        showId,
        seats: seatNumbers,
        paymentMethod,
        forceFail: simulateFailure
      });

      if (res.data.success) {
        setConfirmedBooking({
          booking: res.data.booking,
          eTicket: res.data.notification?.eTicket
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 'Payment transaction failed. Your reserved seats were released.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Top Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Seat Map</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Payment Method & Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-rose-500" />
                <span>Payment Details</span>
              </h2>
              <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>256-Bit SSL Secured</span>
              </span>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-start space-x-2.5">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Transaction Failed</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Credit/Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold text-center transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Net Banking
              </button>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayNow} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Security Code (CVV)
                  </label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Sandbox Gateway Testing Simulator Toggle */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200">Gateway Test Simulation Mode</span>
                  <p className="text-[11px] text-slate-400">Toggle to test automatic lock release upon decline</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulateFailure(!simulateFailure)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    simulateFailure
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {simulateFailure ? 'Simulate Decline' : 'Simulate Success'}
                </button>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-base shadow-xl shadow-rose-600/30 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Gateway Transaction...</span>
                  </>
                ) : (
                  <span>Authorize & Pay ₹{grandTotal}</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Booking Order Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-white text-base border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Ticket className="w-4 h-4 text-rose-500" />
              <span>Booking Summary</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Auditorium / Theatre:</span>
                <span className="font-bold text-slate-200">{showData?.theatreName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Showtime:</span>
                <span className="font-bold text-slate-200">{showData?.showtime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-slate-200">{user?.email || 'Guest'}</span>
              </div>
            </div>

            {/* Selected Seats breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
              <p className="font-bold text-slate-300">Selected Seats ({selectedSeats.length}):</p>
              {selectedSeats.map((s, idx) => (
                <div key={idx} className="flex justify-between text-slate-400">
                  <span>Seat {s.seatNumber} ({s.tier})</span>
                  <span>₹{s.price}</span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tickets Subtotal:</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Convenience & Processing Fee:</span>
                <span>₹{convenienceFee}</span>
              </div>
              <div className="flex justify-between text-base font-black text-rose-400 pt-2 border-t border-slate-800">
                <span>Total Amount:</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation & E-Ticket Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Booking Confirmed!</h3>
              <p className="text-xs text-slate-400 mt-1">
                E-Ticket has been dispatched to your email ({user?.email}) & registered phone.
              </p>
            </div>

            {/* E-Ticket Card Display */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Booking ID</span>
                  <p className="text-sm font-extrabold text-rose-400">{confirmedBooking.booking?.bookingId}</p>
                </div>
                <QrCode className="w-8 h-8 text-slate-300" />
              </div>

              <div className="text-xs space-y-1">
                <p className="text-slate-400">Seats: <span className="font-bold text-white">{seatNumbers.join(', ')}</span></p>
                <p className="text-slate-400">Theatre: <span className="font-bold text-white">{showData?.theatreName}</span></p>
                <p className="text-slate-400">Showtime: <span className="font-bold text-white">{showData?.showtime}</span></p>
                <p className="text-slate-400">Paid: <span className="font-bold text-emerald-400">₹{confirmedBooking.booking?.totalAmount}</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/profile?tab=bookings')}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30"
              >
                View in Booking History
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-sm"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
