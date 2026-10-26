const express = require('express');
const router = express.Router();
const {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  createTheatre,
  getAllTheatres,
  getTheatreById,
  updateTheatre,
  deleteTheatre,
  getSystemBookings,
  updateBookingStatus,
  getRevenueReport,
  getAllReviewsForModeration,
  moderateReview,
  deleteReview,
  getDashboardOverview
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes with verifyToken and isAdmin middleware
router.use(verifyToken, isAdmin);

// Dashboard Overview
router.get('/dashboard', getDashboardOverview);

// Movie Management CRUD
router.route('/movies')
  .get(getAllMovies)
  .post(createMovie);

router.route('/movies/:movieId')
  .get(getMovieById)
  .put(updateMovie)
  .delete(deleteMovie);

// Theatre Management CRUD
router.route('/theatres')
  .get(getAllTheatres)
  .post(createTheatre);

router.route('/theatres/:theatreId')
  .get(getTheatreById)
  .put(updateTheatre)
  .delete(deleteTheatre);

// Booking Monitoring
router.get('/bookings', getSystemBookings);
router.put('/bookings/:bookingId/status', updateBookingStatus);

// Revenue / Payment Reports
router.get('/reports/revenue', getRevenueReport);

// User Review Moderation
router.get('/reviews', getAllReviewsForModeration);
router.put('/reviews/:id/moderate', moderateReview);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
