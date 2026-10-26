const { Review } = require('../models');

// @desc    Get reviews for a movie or all reviews
// @route   GET /api/reviews
const getReviews = async (req, res, next) => {
  try {
    const { movieId, moderatedOnly } = req.query;
    const filter = {};
    if (movieId) filter.movieId = movieId;
    if (moderatedOnly === 'true') filter.adminModeration = true;

    const reviews = await Review.find(filter);
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate a review (Admin)
// @route   PUT /api/reviews/:id/moderate
const moderateReview = async (req, res, next) => {
  try {
    const { adminModeration } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { adminModeration },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  createReview,
  moderateReview
};
