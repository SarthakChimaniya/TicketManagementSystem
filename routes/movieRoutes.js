const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');

router.route('/')
  .get(getAllMovies)
  .post(createMovie);

router.route('/:movieId')
  .get(getMovieById)
  .put(updateMovie)
  .delete(deleteMovie);

module.exports = router;
