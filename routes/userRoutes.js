const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  submitReview,
  getMyReviews,
  getMyBookings,
  getBookingDetails
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect all user routes with verifyToken middleware
router.use(verifyToken);

// User Profile routes
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// Watchlist (Favorites) routes
router.route('/watchlist')
  .get(getWatchlist)
  .post(addToWatchlist);

router.delete('/watchlist/:movieId', removeFromWatchlist);

// Movie Reviews routes
router.route('/reviews')
  .get(getMyReviews)
  .post(submitReview);

// Historical Bookings routes
router.route('/bookings')
  .get(getMyBookings);

router.route('/bookings/:bookingId')
  .get(getBookingDetails);

module.exports = router;
