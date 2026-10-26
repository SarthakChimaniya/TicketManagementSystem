const { Movie, Theatre, Show, Booking, Review, User } = require('../models');

// ==========================================
// 1. Movie Management (Full CRUD)
// ==========================================

// @desc    Admin: Create a new movie
// @route   POST /api/admin/movies
const createMovie = async (req, res, next) => {
  try {
    const { movieId, movieName, media, shows, genres, releaseDate, description, runtime, certification, cast, castMembers } = req.body;

    if (!movieId || !movieName || !releaseDate || runtime === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide movieId, movieName, releaseDate, and runtime.'
      });
    }

    const existingMovie = await Movie.findOne({ movieId: movieId.trim() });
    if (existingMovie) {
      return res.status(409).json({
        success: false,
        error: `Movie with movieId '${movieId}' already exists.`
      });
    }

    const movie = await Movie.create({
      movieId: movieId.trim(),
      movieName: movieName.trim(),
      media: media || {},
      shows: shows || [],
      genres: genres || [],
      releaseDate,
      description: description ? description.trim() : '',
      runtime: Number(runtime),
      certification: certification ? certification.trim() : 'U',
      cast: cast || castMembers || [],
      castMembers: castMembers || cast || []
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully.',
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all movies
// @route   GET /api/admin/movies
const getAllMovies = async (req, res, next) => {
  try {
    const { search, genre } = req.query;
    const query = {};

    if (search) {
      query.movieName = { $regex: search, $options: 'i' };
    }
    if (genre) {
      query.genres = genre;
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get single movie by movieId
// @route   GET /api/admin/movies/:movieId
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ movieId: req.params.movieId.trim() });
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: `Movie with ID '${req.params.movieId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update movie by movieId
// @route   PUT /api/admin/movies/:movieId
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { movieId: req.params.movieId.trim() },
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: `Movie with ID '${req.params.movieId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully.',
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete movie by movieId
// @route   DELETE /api/admin/movies/:movieId
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOneAndDelete({ movieId: req.params.movieId.trim() });

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: `Movie with ID '${req.params.movieId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Movie '${movie.movieName}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. Theatre Management (Full CRUD)
// ==========================================

// @desc    Admin: Create a new theatre
// @route   POST /api/admin/theatres
const createTheatre = async (req, res, next) => {
  try {
    const {
      theatreId,
      theatreName,
      adminName,
      location,
      lowerSeats,
      middleSeats,
      balconySeats,
      lowerSeatPrice,
      middleSeatPrice,
      balconySeatPrice
    } = req.body;

    if (!theatreId || !theatreName || !adminName || !location) {
      return res.status(400).json({
        success: false,
        error: 'Please provide theatreId, theatreName, adminName, and location.'
      });
    }

    const existingTheatre = await Theatre.findOne({ theatreId: theatreId.trim() });
    if (existingTheatre) {
      return res.status(409).json({
        success: false,
        error: `Theatre with theatreId '${theatreId}' already exists.`
      });
    }

    const theatre = await Theatre.create({
      theatreId: theatreId.trim(),
      theatreName: theatreName.trim(),
      adminName: adminName.trim(),
      location: location.trim(),
      lowerSeats: Number(lowerSeats || 0),
      middleSeats: Number(middleSeats || 0),
      balconySeats: Number(balconySeats || 0),
      lowerSeatPrice: Number(lowerSeatPrice || 0),
      middleSeatPrice: Number(middleSeatPrice || 0),
      balconySeatPrice: Number(balconySeatPrice || 0)
    });

    res.status(201).json({
      success: true,
      message: 'Theatre created successfully.',
      data: theatre
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all theatres
// @route   GET /api/admin/theatres
const getAllTheatres = async (req, res, next) => {
  try {
    const theatres = await Theatre.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: theatres.length,
      data: theatres
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get theatre by theatreId
// @route   GET /api/admin/theatres/:theatreId
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findOne({ theatreId: req.params.theatreId.trim() });

    if (!theatre) {
      return res.status(404).json({
        success: false,
        error: `Theatre with ID '${req.params.theatreId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: theatre
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update theatre by theatreId
// @route   PUT /api/admin/theatres/:theatreId
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findOneAndUpdate(
      { theatreId: req.params.theatreId.trim() },
      req.body,
      { new: true, runValidators: true }
    );

    if (!theatre) {
      return res.status(404).json({
        success: false,
        error: `Theatre with ID '${req.params.theatreId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theatre updated successfully.',
      data: theatre
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete theatre by theatreId
// @route   DELETE /api/admin/theatres/:theatreId
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findOneAndDelete({ theatreId: req.params.theatreId.trim() });

    if (!theatre) {
      return res.status(404).json({
        success: false,
        error: `Theatre with ID '${req.params.theatreId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Theatre '${theatre.theatreName}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. Monitor Active System Bookings
// ==========================================

// @desc    Admin: Monitor active and all system bookings
// @route   GET /api/admin/bookings
const getSystemBookings = async (req, res, next) => {
  try {
    const { status, showId, userEmail } = req.query;
    const filter = {};

    if (status) {
      filter.bookingStatus = status;
    }
    if (showId) {
      filter.showId = showId;
    }
    if (userEmail) {
      filter.userEmail = userEmail;
    }

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });

    // Summarize active vs cancelled counts
    const activeCount = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
    const cancelledCount = bookings.filter((b) => b.bookingStatus === 'cancelled').length;
    const pendingCount = bookings.filter((b) => b.bookingStatus === 'pending').length;

    res.status(200).json({
      success: true,
      totalCount: bookings.length,
      metrics: {
        active: activeCount,
        cancelled: cancelledCount,
        pending: pendingCount
      },
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update status of a booking (e.g. cancel, confirm)
// @route   PUT /api/admin/bookings/:bookingId/status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingStatus } = req.body;

    if (!['confirmed', 'cancelled', 'pending'].includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'confirmed', 'cancelled', or 'pending'."
      });
    }

    const booking = await Booking.findOneAndUpdate(
      { bookingId: req.params.bookingId.trim() },
      { bookingStatus },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking with ID '${req.params.bookingId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${bookingStatus}'.`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. Payment / Revenue Reports
// ==========================================

// @desc    Admin: Retrieve payment and revenue reports
// @route   GET /api/admin/reports/revenue
const getRevenueReport = async (req, res, next) => {
  try {
    // Aggregation for overall revenue metrics
    const overallStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, '$totalAmount', 0]
            }
          },
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] }
          },
          averageBookingValue: {
            $avg: {
              $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, '$totalAmount', null]
            }
          }
        }
      }
    ]);

    // Revenue grouped by show
    const showRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: '$showId',
          revenue: { $sum: '$totalAmount' },
          ticketsBooked: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    const report = overallStats.length > 0 ? overallStats[0] : {
      totalRevenue: 0,
      totalBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      averageBookingValue: 0
    };
    delete report._id;

    res.status(200).json({
      success: true,
      report: {
        summary: report,
        topRevenueShows: showRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. Review Moderation (Approve / Delete)
// ==========================================

// @desc    Admin: Get all reviews for moderation
// @route   GET /api/admin/reviews
const getAllReviewsForModeration = async (req, res, next) => {
  try {
    const { status, movieId } = req.query;
    const filter = {};

    if (status === 'moderated') {
      filter.adminModeration = true;
    } else if (status === 'pending') {
      filter.adminModeration = false;
    }

    if (movieId) {
      filter.movieId = movieId;
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Moderate (approve/reject) a review
// @route   PUT /api/admin/reviews/:id/moderate
const moderateReview = async (req, res, next) => {
  try {
    const { adminModeration } = req.body;

    if (typeof adminModeration !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: "Please provide a boolean value for 'adminModeration' (true to approve, false to unapprove)."
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { adminModeration },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Review moderation status updated to ${adminModeration ? 'Approved' : 'Pending'}.`,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete a review to maintain platform integrity
// @route   DELETE /api/admin/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review permanently deleted to maintain platform integrity.'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. Admin Dashboard Overview
// ==========================================

// @desc    Admin: Get aggregated dashboard metrics
// @route   GET /api/admin/dashboard
const getDashboardOverview = async (req, res, next) => {
  try {
    const [
      totalMovies,
      totalTheatres,
      totalShows,
      totalBookings,
      totalUsers,
      pendingReviews
    ] = await Promise.all([
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments(),
      Review.countDocuments({ adminModeration: false })
    ]);

    const revenueResult = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        totalUsers,
        pendingReviewsToModerate: pendingReviews,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
