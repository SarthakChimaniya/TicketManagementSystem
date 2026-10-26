const crypto = require('crypto');
const { Booking, Show, Movie, Theatre } = require('../models');
const seatLockService = require('../services/seatLockService');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');

// Helper to calculate total pricing for selected seats based on Theatre tiers
const calculateSeatPricing = (theatre, seats) => {
  const balconyPrice = theatre ? theatre.balconySeatPrice : 400;
  const middlePrice = theatre ? theatre.middleSeatPrice : 250;
  const lowerPrice = theatre ? theatre.lowerSeatPrice : 150;

  let total = 0;
  const breakdown = [];

  seats.forEach((s) => {
    const seatStr = typeof s === 'string' ? s.trim().toUpperCase() : s.seatNumber.trim().toUpperCase();
    let price = middlePrice;
    let tier = 'middle';

    if (seatStr.startsWith('B')) {
      price = balconyPrice;
      tier = 'balcony';
    } else if (seatStr.startsWith('L')) {
      price = lowerPrice;
      tier = 'lower';
    } else {
      price = middlePrice;
      tier = 'middle';
    }

    total += price;
    breakdown.push({ seatNumber: seatStr, tier, price });
  });

  return { total, breakdown };
};

// ==========================================
// 1. Real-Time Seat Locking & Release
// ==========================================

// @desc    Temporarily lock selected seats with TTL
// @route   POST /api/bookings/lock-seats
const lockSeats = async (req, res, next) => {
  try {
    const { showId, seats, ttlSeconds } = req.body;
    const userEmail = req.user ? req.user.email : req.body.userEmail;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide showId and an array of seat numbers.'
      });
    }

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required to lock seats.'
      });
    }

    // Verify show exists
    const show = await Show.findOne({ showId: showId.trim() });
    if (!show) {
      return res.status(404).json({
        success: false,
        error: `Show with showId '${showId}' not found.`
      });
    }

    // Verify seats are not already permanently booked
    const formattedSeats = seats.map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : s));
    const confirmedBookings = await Booking.find({
      showId: showId.trim(),
      bookingStatus: 'confirmed',
      ticketsData: { $in: formattedSeats }
    });

    if (confirmedBookings.length > 0) {
      const alreadyBooked = [];
      confirmedBookings.forEach((b) => {
        b.ticketsData.forEach((st) => {
          if (formattedSeats.includes(st)) alreadyBooked.push(st);
        });
      });

      return res.status(409).json({
        success: false,
        error: `Seats [${[...new Set(alreadyBooked)].join(', ')}] are already booked.`,
        bookedSeats: [...new Set(alreadyBooked)]
      });
    }

    // Lock seats in real-time manager with TTL
    const io = req.app.get('io');
    const lockResult = seatLockService.lockSeats({
      showId: showId.trim(),
      seats: formattedSeats,
      userEmail,
      ttlSeconds,
      io
    });

    if (!lockResult.success) {
      return res.status(409).json(lockResult);
    }

    res.status(200).json({
      success: true,
      message: 'Seats locked successfully.',
      ...lockResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually release temporarily locked seats
// @route   POST /api/bookings/release-seats
const releaseSeats = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    const userEmail = req.user ? req.user.email : req.body.userEmail;

    if (!showId || !Array.isArray(seats)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide showId and an array of seat numbers to release.'
      });
    }

    const io = req.app.get('io');
    const formattedSeats = seats.map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : s));

    const result = seatLockService.releaseSeats({
      showId: showId.trim(),
      seats: formattedSeats,
      userEmail,
      io,
      reason: 'user_released'
    });

    res.status(200).json({
      success: true,
      message: 'Seats released back to available pool.',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. Checkout Flow & Payment Processing
// ==========================================

// @desc    Initiate checkout session & create payment intent
// @route   POST /api/bookings/checkout
const createCheckoutSession = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    const userEmail = req.user ? req.user.email : req.body.userEmail;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide showId and at least one seat to checkout.'
      });
    }

    const show = await Show.findOne({ showId: showId.trim() });
    if (!show) {
      return res.status(404).json({ success: false, error: 'Show not found.' });
    }

    const theatre = await Theatre.findOne({ theatreName: show.theatreName });
    const formattedSeats = seats.map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : s));

    // Ensure seats are locked by user (or lock them now)
    const io = req.app.get('io');
    const ownsLock = seatLockService.verifyUserOwnsLocks(showId.trim(), formattedSeats, userEmail);

    if (!ownsLock) {
      // Attempt lock now
      const lockAttempt = seatLockService.lockSeats({
        showId: showId.trim(),
        seats: formattedSeats,
        userEmail,
        io
      });

      if (!lockAttempt.success) {
        return res.status(409).json(lockAttempt);
      }
    }

    // Calculate total price based on seat tiers
    const { total, breakdown } = calculateSeatPricing(theatre, formattedSeats);

    // Create Payment Intent via Gateway Service
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: total,
      currency: 'inr',
      metadata: {
        showId: showId.trim(),
        userEmail,
        seats: formattedSeats.join(',')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Checkout initialized. Please complete payment to confirm booking.',
      data: {
        showId: show.showId,
        theatreName: show.theatreName,
        movieId: show.movieId,
        seats: formattedSeats,
        pricingBreakdown: breakdown,
        totalAmount: total,
        currency: 'INR',
        payment: paymentIntent
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process transaction and finalize or rollback booking
// @route   POST /api/bookings/process-payment
const processPaymentAndConfirm = async (req, res, next) => {
  try {
    const { showId, seats, paymentIntentId, paymentMethod, forceFail } = req.body;
    const userEmail = req.user ? req.user.email : req.body.userEmail;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide showId and selected seats.'
      });
    }

    const formattedSeats = seats.map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : s));
    const io = req.app.get('io');

    // 1. Process payment via Payment Service
    const paymentResult = await paymentService.processTransaction({
      paymentIntentId,
      paymentMethod,
      forceFail: Boolean(forceFail)
    });

    // 2. Handle Payment Failure: Automatically release seats back to pool
    if (!paymentResult.success) {
      console.warn(`[BookingController] Payment failed for user ${userEmail} on show ${showId}. Releasing seats.`);

      seatLockService.releaseSeats({
        showId: showId.trim(),
        seats: formattedSeats,
        userEmail,
        io,
        reason: 'payment_failed'
      });

      return res.status(400).json({
        success: false,
        error: paymentResult.error || 'Payment failed. Your locked seats have been released.',
        releasedSeats: formattedSeats
      });
    }

    // 3. Payment Succeeded: Finalize booking in database
    const show = await Show.findOne({ showId: showId.trim() });
    const theatre = show ? await Theatre.findOne({ theatreName: show.theatreName }) : null;
    const movie = show ? await Movie.findOne({ movieId: show.movieId }) : null;

    const { total } = calculateSeatPricing(theatre, formattedSeats);
    const bookingId = `BKG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Create confirmed Booking record
    const booking = await Booking.create({
      bookingId,
      showId: showId.trim(),
      ticketsData: formattedSeats,
      userEmail,
      totalAmount: total,
      bookingStatus: 'confirmed'
    });

    // Permanently record seats in Show document tickets field
    if (show) {
      await Show.findOneAndUpdate(
        { showId: showId.trim() },
        { $addToSet: { tickets: { $each: formattedSeats } } }
      );
    }

    // Permanently remove temporary lock & notify clients via WebSocket
    seatLockService.finalizeBookedSeats({
      showId: showId.trim(),
      seats: formattedSeats,
      io
    });

    // 4. Trigger Mock Notification Service (Email / SMS)
    const notificationReport = await notificationService.sendETicketNotification({
      booking,
      movie,
      theatre,
      show,
      userEmail
    });

    res.status(201).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      transaction: paymentResult,
      booking,
      notification: {
        emailDispatched: notificationReport.emailDispatched,
        smsDispatched: notificationReport.smsDispatched,
        eTicket: notificationReport.eTicket
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. Standard Booking Handlers
// ==========================================

const getAllBookings = async (req, res, next) => {
  try {
    const { userEmail, showId } = req.query;
    const filter = {};
    if (userEmail) filter.userEmail = userEmail;
    if (showId) filter.showId = showId;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { bookingId: req.params.bookingId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  lockSeats,
  releaseSeats,
  createCheckoutSession,
  processPaymentAndConfirm,
  getAllBookings,
  getBookingById,
  updateBooking
};
