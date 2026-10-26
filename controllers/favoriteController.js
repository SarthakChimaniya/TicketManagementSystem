const { Favorite } = require('../models');

// @desc    Get user's favorites / watchlist
// @route   GET /api/favorites
const getFavorites = async (req, res, next) => {
  try {
    const { userEmail } = req.query;
    const filter = userEmail ? { userEmail } : {};
    const favorites = await Favorite.find(filter);
    res.status(200).json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/favorites
const addFavorite = async (req, res, next) => {
  try {
    const { userEmail, movieId } = req.body;
    const favorite = await Favorite.create({ userEmail, movieId });
    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/favorites
const removeFavorite = async (req, res, next) => {
  try {
    const { userEmail, movieId } = req.body;
    const deleted = await Favorite.findOneAndDelete({ userEmail, movieId });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Favorite not found' });
    }
    res.status(200).json({ success: true, message: 'Movie removed from watchlist' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};
