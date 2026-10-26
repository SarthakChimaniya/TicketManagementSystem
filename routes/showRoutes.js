const express = require('express');
const router = express.Router();
const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow
} = require('../controllers/showController');

router.route('/')
  .get(getAllShows)
  .post(createShow);

router.route('/:showId')
  .get(getShowById)
  .put(updateShow)
  .delete(deleteShow);

module.exports = router;
