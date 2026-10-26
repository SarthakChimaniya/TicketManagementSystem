const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking
} = require('../controllers/bookingController');

router.route('/')
  .get(getAllBookings)
  .post(createBooking);

router.route('/:bookingId')
  .get(getBookingById)
  .put(updateBooking);

module.exports = router;
