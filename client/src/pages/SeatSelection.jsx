import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ArrowLeft, Clock, Shield, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { showAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openLogin } = useAuth();

  const [showData, setShowData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedByOthers, setLockedByOthers] = useState(new Set());
  const [bookedSeats, setBookedSeats] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [lockingError, setLockingError] = useState('');
  const [lockCountdown, setLockCountdown] = useState(null);

  useEffect(() => {
    // 1. Fetch Show Seat Layout
    const fetchLayout = async () => {
      try {
        setLoading(true);
        const res = await showAPI.getSeats(showId);
        if (res.data.success) {
          setShowData(res.data);

          // Populate booked and locked sets
          const booked = new Set();
          const locked = new Set();

          const allTiers = [
            ...(res.data.layout?.balcony || []),
            ...(res.data.layout?.middle || []),
            ...(res.data.layout?.lower || [])
          ];

          allTiers.forEach((seat) => {
            if (seat.status === 'booked') booked.add(seat.seatNumber);
            if (seat.status === 'locked') locked.add(seat.seatNumber);
          });

          setBookedSeats(booked);
          setLockedByOthers(locked);
        }
      } catch (err) {
        console.warn('Backend unavailable, constructing showcase layout');
        // Construct fallback layout
        setShowData({
          showId,
          theatreName: 'PVR IMAX Grand Screen',
          showtime: '07:30 PM',
          showdate: new Date().toISOString(),
          tierPricing: { balcony: 400, middle: 250, lower: 150 },
          layout: {
            balcony: Array.from({ length: 20 }, (_, i) => ({
              seatNumber: `B${i + 1}`,
              tier: 'balcony',
              price: 400,
              status: i === 3 || i === 4 ? 'booked' : 'available'
            })),
            middle: Array.from({ length: 30 }, (_, i) => ({
              seatNumber: `M${i + 1}`,
              tier: 'middle',
              price: 250,
              status: i === 12 ? 'booked' : 'available'
            })),
            lower: Array.from({ length: 20 }, (_, i) => ({
              seatNumber: `L${i + 1}`,
              tier: 'lower',
              price: 150,
              status: 'available'
            }))
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();

    // 2. Initialize Socket.io Connection for Real-Time Updates
    const socket = io('/', { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      socket.emit('join-show', showId);
    });

    socket.on('initial-locked-seats', (data) => {
      if (data && Array.isArray(data.locks)) {
        setLockedByOthers((prev) => {
          const nextSet = new Set(prev);
          data.locks.forEach((l) => nextSet.add(l.seatNumber));
          return nextSet;
        });
      }
    });

    socket.on('seats-locked', (data) => {
      if (data.showId === showId) {
        setLockedByOthers((prev) => {
          const nextSet = new Set(prev);
          data.seats.forEach((s) => nextSet.add(s));
          return nextSet;
        });
      }
    });

    socket.on('seats-released', (data) => {
      if (data.showId === showId) {
        setLockedByOthers((prev) => {
          const nextSet = new Set(prev);
          data.seats.forEach((s) => nextSet.delete(s));
          return nextSet;
        });
      }
    });

    socket.on('seats-booked', (data) => {
      if (data.showId === showId) {
        setBookedSeats((prev) => {
          const nextSet = new Set(prev);
          data.seats.forEach((s) => nextSet.add(s));
          return nextSet;
        });
        setLockedByOthers((prev) => {
          const nextSet = new Set(prev);
          data.seats.forEach((s) => nextSet.delete(s));
          return nextSet;
        });
      }
    });

    return () => {
      socket.emit('leave-show', showId);
      socket.disconnect();
    };
  }, [showId]);

  // Handle Seat Click (Toggle)
  const handleSeatClick = (seat) => {
    setLockingError('');
    const { seatNumber } = seat;

    if (bookedSeats.has(seatNumber)) return;
    if (lockedByOthers.has(seatNumber)) return;

    if (selectedSeats.some((s) => s.seatNumber === seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        setLockingError('Maximum of 8 seats can be selected per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Calculate Subtotal
  const subtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  // Proceed to Checkout
  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      openLogin();
      return;
    }

    try {
      setLockingError('');
      const seatNumbers = selectedSeats.map((s) => s.seatNumber);

      // Lock seats with real-time backend
      await bookingAPI.lockSeats({
        showId,
        seats: seatNumbers,
        ttlSeconds: 600
      });

      // Navigate to Checkout with state
      navigate('/checkout', {
        state: {
          showId,
          showData,
          selectedSeats,
          totalAmount: subtotal
        }
      });
    } catch (err) {
      setLockingError(
        err.response?.data?.error || 'Some of your selected seats were just reserved by another user.'
      );
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="animate-pulse">Loading auditorium seat layout & live availability...</p>
      </div>
    );
  }

  const renderSeatGrid = (seats, title, price) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {title} &bull; <span className="text-rose-400 font-extrabold">₹{price}</span>
        </h4>
        <span className="text-[11px] text-slate-400 font-medium">
          {seats.filter((s) => !bookedSeats.has(s.seatNumber) && !lockedByOthers.has(s.seatNumber)).length} Available
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5 justify-center py-2">
        {seats.map((seat) => {
          const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
          const isBooked = bookedSeats.has(seat.seatNumber);
          const isLocked = lockedByOthers.has(seat.seatNumber);

          let seatStyle = 'bg-slate-900 border-slate-700 hover:border-rose-500 hover:bg-rose-500/10 text-slate-200';

          if (isBooked) {
            seatStyle = 'bg-slate-800/40 border-slate-800 text-slate-400 cursor-not-allowed opacity-40';
          } else if (isLocked) {
            seatStyle = 'bg-amber-950/40 border-amber-600/40 text-amber-500 cursor-not-allowed animate-pulse';
          } else if (isSelected) {
            seatStyle = 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/40 scale-105';
          }

          return (
            <button
              key={seat.seatNumber}
              disabled={isBooked || isLocked}
              onClick={() => handleSeatClick(seat)}
              className={`h-9 rounded-lg border text-xs font-extrabold transition-all flex items-center justify-center ${seatStyle}`}
              title={`${seat.seatNumber} - ₹${seat.price} (${isBooked ? 'Booked' : isLocked ? 'Temporarily Locked' : isSelected ? 'Selected' : 'Available'})`}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shows</span>
        </button>

        <div className="text-right">
          <h2 className="text-base font-extrabold text-white">{showData?.theatreName}</h2>
          <p className="text-xs text-slate-400">Showtime: {showData?.showtime}</p>
        </div>
      </div>

      {/* Screen Curved Indicator */}
      <div className="space-y-2 text-center pt-2">
        <div className="w-full max-w-lg mx-auto h-2 rounded-full cinema-screen mb-1"></div>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          All Eyes This Way &bull; Cinema Screen
        </p>
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold py-2 bg-slate-900/40 rounded-2xl border border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-slate-900 border border-slate-700"></div>
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-rose-600 border border-rose-400"></div>
          <span className="text-rose-400">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-amber-950/40 border border-amber-600/40"></div>
          <span className="text-amber-400">Locked (Other User)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-slate-800/40 border border-slate-800"></div>
          <span className="text-slate-400">Sold Out</span>
        </div>
      </div>

      {/* Error Alert */}
      {lockingError && (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{lockingError}</span>
        </div>
      )}

      {/* Tiers Grid */}
      <div className="space-y-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        {showData?.layout?.balcony &&
          renderSeatGrid(showData.layout.balcony, 'Balcony Tier', showData.tierPricing?.balcony || 400)}
        {showData?.layout?.middle &&
          renderSeatGrid(showData.layout.middle, 'Middle Tier', showData.tierPricing?.middle || 250)}
        {showData?.layout?.lower &&
          renderSeatGrid(showData.layout.lower, 'Lower Tier', showData.tierPricing?.lower || 150)}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400">
            Selected Seats ({selectedSeats.length}):{' '}
            <span className="font-extrabold text-white">
              {selectedSeats.length > 0
                ? selectedSeats.map((s) => s.seatNumber).join(', ')
                : 'None selected'}
            </span>
          </p>
          <p className="text-lg font-black text-rose-400">
            Total: ₹{subtotal}{' '}
            <span className="text-xs font-normal text-slate-400">(taxes calculated at checkout)</span>
          </p>
        </div>

        <button
          onClick={handleProceedToCheckout}
          disabled={selectedSeats.length === 0}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          Proceed to Checkout &rarr;
        </button>
      </div>

    </div>
  );
};

export default SeatSelection;
