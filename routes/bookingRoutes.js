const express = require('express');
const router = express.Router();
const {
  lockSeats,
  releaseSeats,
  createCheckoutSession,
  processPaymentAndConfirm,
  getAllBookings,
  getBookingById,
  updateBooking
} = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Real-time seat management endpoints
router.post('/lock-seats', verifyToken, lockSeats);
router.post('/release-seats', verifyToken, releaseSeats);

// Checkout and payment transaction processing
router.post('/checkout', verifyToken, createCheckoutSession);
router.post('/process-payment', verifyToken, processPaymentAndConfirm);

// General bookings routes
router.get('/', getAllBookings);
router.route('/:bookingId')
  .get(getBookingById)
  .put(updateBooking);

module.exports = router;
