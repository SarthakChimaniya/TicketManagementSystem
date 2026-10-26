const { Theatre } = require('../models');

// @desc    Get all theatres
// @route   GET /api/theatres
const getAllTheatres = async (req, res, next) => {
  try {
    const theatres = await Theatre.find();
    res.status(200).json({ success: true, count: theatres.length, data: theatres });
  } catch (error) {
    next(error);
  }
};

// @desc    Get theatre by theatreId
// @route   GET /api/theatres/:theatreId
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findOne({ theatreId: req.params.theatreId });
    if (!theatre) {
      return res.status(404).json({ success: false, error: 'Theatre not found' });
    }
    res.status(200).json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new theatre
// @route   POST /api/theatres
const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theatre by theatreId
// @route   PUT /api/theatres/:theatreId
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findOneAndUpdate(
      { theatreId: req.params.theatreId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!theatre) {
      return res.status(404).json({ success: false, error: 'Theatre not found' });
    }
    res.status(200).json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre by theatreId
// @route   DELETE /api/theatres/:theatreId
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findOneAndDelete({ theatreId: req.params.theatreId });
    if (!theatre) {
      return res.status(404).json({ success: false, error: 'Theatre not found' });
    }
    res.status(200).json({ success: true, message: 'Theatre deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre
};
