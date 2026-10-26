const { Movie } = require('../models');

// @desc    Get all movies
// @route   GET /api/movies
const getAllMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({ success: true, count: movies.length, data: movies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by movieId
// @route   GET /api/movies/:movieId
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ movieId: req.params.movieId });
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new movie (Admin)
// @route   POST /api/movies
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie by movieId
// @route   PUT /api/movies/:movieId
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { movieId: req.params.movieId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie by movieId
// @route   DELETE /api/movies/:movieId
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOneAndDelete({ movieId: req.params.movieId });
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    res.status(200).json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};
