const { Show } = require('../models');

// @desc    Get all shows
// @route   GET /api/shows
const getAllShows = async (req, res, next) => {
  try {
    const { movieId, theatreName } = req.query;
    const filter = {};
    if (movieId) filter.movieId = movieId;
    if (theatreName) filter.theatreName = theatreName;

    const shows = await Show.find(filter);
    res.status(200).json({ success: true, count: shows.length, data: shows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get show by showId
// @route   GET /api/shows/:showId
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findOne({ showId: req.params.showId });
    if (!show) {
      return res.status(404).json({ success: false, error: 'Show not found' });
    }
    res.status(200).json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new show
// @route   POST /api/shows
const createShow = async (req, res, next) => {
  try {
    const show = await Show.create(req.body);
    res.status(201).json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show by showId
// @route   PUT /api/shows/:showId
const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findOneAndUpdate(
      { showId: req.params.showId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!show) {
      return res.status(404).json({ success: false, error: 'Show not found' });
    }
    res.status(200).json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete show by showId
// @route   DELETE /api/shows/:showId
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findOneAndDelete({ showId: req.params.showId });
    if (!show) {
      return res.status(404).json({ success: false, error: 'Show not found' });
    }
    res.status(200).json({ success: true, message: 'Show deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow
};
