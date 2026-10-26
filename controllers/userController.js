const { User, Movie, Favorite, Review, Booking, Show } = require('../models');

// ==========================================
// 1. Profile Management
// ==========================================

// @desc    Get current user profile
// @route   GET /api/user/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile (username, password)
// @route   PUT /api/user/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const { username, password } = req.body;

    if (username) {
      const trimmedName = username.trim();
      if (trimmedName.length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Username must be at least 3 characters long.'
        });
      }
      user.username = trimmedName;
    }

    if (password) {
      const trimmedPassword = password.trim();
      if (trimmedPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long.'
        });
      }
      user.password = trimmedPassword; // will be hashed by pre-save hook
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. Watchlist (Favorites) Management
// ==========================================

// @desc    Get user's watchlist/favorites with movie details
// @route   GET /api/user/watchlist
const getWatchlist = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userEmail: req.user.email }).sort({ createdAt: -1 });

    // Populate corresponding movie metadata
    const movieIds = favorites.map((f) => f.movieId);
    const movies = await Movie.find({ movieId: { $in: movieIds } });
    const movieMap = {};
    movies.forEach((m) => {
      movieMap[m.movieId] = m;
    });

    const enrichedWatchlist = favorites.map((fav) => ({
      _id: fav._id,
      userEmail: fav.userEmail,
      movieId: fav.movieId,
      createdAt: fav.createdAt,
      movie: movieMap[fav.movieId] || null
    }));

    res.status(200).json({
      success: true,
      count: enrichedWatchlist.length,
      data: enrichedWatchlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to user's watchlist/favorites
// @route   POST /api/user/watchlist
const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid movieId.'
      });
    }

    // Verify movie exists
    const movieExists = await Movie.findOne({ movieId: movieId.trim() });
    if (!movieExists) {
      return res.status(404).json({
        success: false,
        error: `Movie with movieId '${movieId}' does not exist.`
      });
    }

    // Check if already in favorites
    const existing = await Favorite.findOne({
      userEmail: req.user.email,
      movieId: movieId.trim()
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Movie is already in your watchlist.'
      });
    }

    const favorite = await Favorite.create({
      userEmail: req.user.email,
      movieId: movieId.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist successfully.',
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from user's watchlist/favorites
// @route   DELETE /api/user/watchlist/:movieId
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const removed = await Favorite.findOneAndDelete({
      userEmail: req.user.email,
      movieId: movieId.trim()
    });

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found in your watchlist.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie removed from watchlist successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. Movie Reviews & Ratings
// ==========================================

// @desc    Submit a movie review with rating
// @route   POST /api/user/reviews
const submitReview = async (req, res, next) => {
  try {
    const { movieId, rating, reviewText } = req.body;

    if (!movieId || rating === undefined || !reviewText) {
      return res.status(400).json({
        success: false,
        error: 'Please provide movieId, rating, and reviewText.'
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be an integer or number between 1 and 5.'
      });
    }

    if (!reviewText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Review text cannot be empty.'
      });
    }

    // Verify movie exists
    const movie = await Movie.findOne({ movieId: movieId.trim() });
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: `Movie with movieId '${movieId}' not found.`
      });
    }

    const review = await Review.create({
      userEmail: req.user.email,
      movieId: movieId.trim(),
      rating: numRating,
      reviewText: reviewText.trim(),
      adminModeration: false // Default unmoderated until approved by admin
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending admin moderation.',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own submitted reviews
// @route   GET /api/user/reviews
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. Historical Booking Data
// ==========================================

// @desc    Retrieve historical bookings for authenticated user
// @route   GET /api/user/bookings
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userEmail: req.user.email }).sort({ createdAt: -1 });

    // Populate show details for each booking
    const showIds = bookings.map((b) => b.showId);
    const shows = await Show.find({ showId: { $in: showIds } });
    const showMap = {};
    shows.forEach((s) => {
      showMap[s.showId] = s;
    });

    const enrichedBookings = bookings.map((b) => ({
      _id: b._id,
      bookingId: b.bookingId,
      showId: b.showId,
      userEmail: b.userEmail,
      ticketsData: b.ticketsData,
      totalAmount: b.totalAmount,
      bookingStatus: b.bookingStatus,
      createdAt: b.createdAt,
      showDetails: showMap[b.showId] || null
    }));

    res.status(200).json({
      success: true,
      count: enrichedBookings.length,
      data: enrichedBookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single historical booking details
// @route   GET /api/user/bookings/:bookingId
const getBookingDetails = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      bookingId: bookingId.trim(),
      userEmail: req.user.email
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking with ID '${bookingId}' not found for your account.`
      });
    }

    const showDetails = await Show.findOne({ showId: booking.showId });

    res.status(200).json({
      success: true,
      data: {
        ...booking.toObject(),
        showDetails: showDetails || null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  submitReview,
  getMyReviews,
  getMyBookings,
  getBookingDetails
};
