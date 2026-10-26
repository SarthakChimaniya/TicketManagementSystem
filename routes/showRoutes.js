const express = require('express');
const router = express.Router();
const {
  getFilteredShowsAndMovies,
  getSeatLayoutAndAvailability,
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow
} = require('../controllers/showController');

// Search & Browse shows filtered by genre, language, date, ratings
router.get('/browse', getFilteredShowsAndMovies);

// Get real-time seat layout and availability for a selected show
router.get('/:showId/seats', getSeatLayoutAndAvailability);

// Standard Show CRUD routes
router.route('/')
  .get(getAllShows)
  .post(createShow);

router.route('/:showId')
  .get(getShowById)
  .put(updateShow)
  .delete(deleteShow);

module.exports = router;
