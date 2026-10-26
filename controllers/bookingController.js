const { Booking } = require('../models');

// @desc    Get all bookings
// @route   GET /api/bookings
const getAllBookings = async (req, res, next) => {
  try {
    const { userEmail, showId } = req.query;
    const filter = {};
    if (userEmail) filter.userEmail = userEmail;
    if (showId) filter.showId = showId;

    const bookings = await Booking.find(filter);
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by bookingId
// @route   GET /api/bookings/:bookingId
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

// @desc    Create a new booking
// @route   POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/Update booking by bookingId
// @route   PUT /api/bookings/:bookingId
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
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking
};
