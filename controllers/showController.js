const { Show, Movie, Theatre, Booking } = require('../models');
const seatLockService = require('../services/seatLockService');

// @desc    Retrieve movies and show timings based on user filters (genre, language, date, ratings)
// @route   GET /api/shows/browse
const getFilteredShowsAndMovies = async (req, res, next) => {
  try {
    const { genre, language, date, ratings, minRating, theatreName, search } = req.query;

    // 1. Build Movie Query Filters
    const movieFilter = {};
    if (genre) {
      movieFilter.genres = { $regex: genre, $options: 'i' };
    }
    if (language) {
      movieFilter.language = { $regex: language, $options: 'i' };
    }
    if (ratings || minRating) {
      const minRate = Number(ratings || minRating);
      if (!isNaN(minRate)) {
        movieFilter.averageRating = { $gte: minRate };
      }
    }
    if (search) {
      movieFilter.movieName = { $regex: search, $options: 'i' };
    }

    const matchingMovies = await Movie.find(movieFilter);
    const movieMap = new Map();
    matchingMovies.forEach((m) => movieMap.set(m.movieId, m));

    // 2. Build Show Query Filters
    const showFilter = {};

    // Filter shows matching eligible movies
    if (matchingMovies.length > 0) {
      showFilter.movieId = { $in: Array.from(movieMap.keys()) };
    } else if (genre || language || ratings || minRating || search) {
      // If movie filters were applied and no movie matched, return empty results
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // Filter by date (YYYY-MM-DD or full date)
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const startOfDay = new Date(parsedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedDate);
        endOfDay.setHours(23, 59, 59, 999);
        showFilter.showdate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    if (theatreName) {
      showFilter.theatreName = { $regex: theatreName, $options: 'i' };
    }

    const shows = await Show.find(showFilter).sort({ showdate: 1, showtime: 1 });

    // Look up theatre info for pricing & location
    const theatreNames = [...new Set(shows.map((s) => s.theatreName))];
    const theatres = await Theatre.find({ theatreName: { $in: theatreNames } });
    const theatreMap = new Map();
    theatres.forEach((t) => theatreMap.set(t.theatreName, t));

    // Also populate movies for any shows that didn't have movie in movieMap yet
    const missingMovieIds = shows.map((s) => s.movieId).filter((id) => !movieMap.has(id));
    if (missingMovieIds.length > 0) {
      const additionalMovies = await Movie.find({ movieId: { $in: missingMovieIds } });
      additionalMovies.forEach((m) => movieMap.set(m.movieId, m));
    }

    const enrichedResults = shows.map((show) => {
      const movie = movieMap.get(show.movieId);
      const theatre = theatreMap.get(show.theatreName);

      return {
        showId: show.showId,
        showtime: show.showtime,
        showdate: show.showdate,
        theatreName: show.theatreName,
        theatreDetails: theatre
          ? {
              location: theatre.location,
              pricing: {
                lower: theatre.lowerSeatPrice,
                middle: theatre.middleSeatPrice,
                balcony: theatre.balconySeatPrice
              }
            }
          : null,
        movieId: show.movieId,
        movieDetails: movie
          ? {
              movieName: movie.movieName,
              media: movie.media,
              genres: movie.genres,
              language: movie.language,
              runtime: movie.runtime,
              certification: movie.certification,
              averageRating: movie.averageRating,
              cast: movie.cast
            }
          : null
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedResults.length,
      data: enrichedResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch specific seat layout and real-time availability for a selected show
// @route   GET /api/shows/:showId/seats
const getSeatLayoutAndAvailability = async (req, res, next) => {
  try {
    const { showId } = req.params;

    const show = await Show.findOne({ showId: showId.trim() });
    if (!show) {
      return res.status(404).json({
        success: false,
        error: `Show with showId '${showId}' not found.`
      });
    }

    // Retrieve theatre for seating configuration & tier pricing
    const theatre = await Theatre.findOne({ theatreName: show.theatreName });

    // Fallback capacity defaults if theatre not found or default screen
    const lowerCapacity = theatre ? theatre.lowerSeats : 30;
    const middleCapacity = theatre ? theatre.middleSeats : 40;
    const balconyCapacity = theatre ? theatre.balconySeats : 20;

    const lowerPrice = theatre ? theatre.lowerSeatPrice : 150;
    const middlePrice = theatre ? theatre.middleSeatPrice : 250;
    const balconyPrice = theatre ? theatre.balconySeatPrice : 400;

    // Retrieve permanently booked seats from Booking collection
    const confirmedBookings = await Booking.find({
      showId: showId.trim(),
      bookingStatus: 'confirmed'
    });

    const bookedSeatsSet = new Set();
    confirmedBookings.forEach((b) => {
      if (Array.isArray(b.ticketsData)) {
        b.ticketsData.forEach((seat) => {
          if (typeof seat === 'string') {
            bookedSeatsSet.add(seat.trim().toUpperCase());
          } else if (seat && seat.seatNumber) {
            bookedSeatsSet.add(seat.seatNumber.trim().toUpperCase());
          }
        });
      }
    });

    // Also include any booked seats stored directly on Show document tickets field
    if (Array.isArray(show.tickets)) {
      show.tickets.forEach((t) => {
        if (typeof t === 'string') bookedSeatsSet.add(t.trim().toUpperCase());
      });
    }

    // Retrieve real-time temporarily locked seats from SeatLockService
    const activeLocks = seatLockService.getLockedSeats(showId.trim());
    const lockedSeatsMap = new Map();
    activeLocks.forEach((lock) => {
      lockedSeatsMap.set(lock.seatNumber.trim().toUpperCase(), lock);
    });

    // Helper to generate seat grid for a tier
    const generateTierSeats = (prefix, count, tierName, price) => {
      const seats = [];
      for (let i = 1; i <= count; i++) {
        const seatNumber = `${prefix}${i}`;
        let status = 'available';
        let lockInfo = null;

        if (bookedSeatsSet.has(seatNumber)) {
          status = 'booked';
        } else if (lockedSeatsMap.has(seatNumber)) {
          status = 'locked';
          const lock = lockedSeatsMap.get(seatNumber);
          lockInfo = {
            expiresAt: lock.expiresAt,
            remainingSeconds: lock.remainingSeconds
          };
        }

        seats.push({
          seatNumber,
          tier: tierName,
          price,
          status,
          lockInfo
        });
      }
      return seats;
    };

    const balcony = generateTierSeats('B', balconyCapacity, 'balcony', balconyPrice);
    const middle = generateTierSeats('M', middleCapacity, 'middle', middlePrice);
    const lower = generateTierSeats('L', lowerCapacity, 'lower', lowerPrice);

    const allSeats = [...balcony, ...middle, ...lower];
    const totalSeatsCount = allSeats.length;
    const bookedCount = allSeats.filter((s) => s.status === 'booked').length;
    const lockedCount = allSeats.filter((s) => s.status === 'locked').length;
    const availableCount = allSeats.filter((s) => s.status === 'available').length;

    res.status(200).json({
      success: true,
      showId: show.showId,
      theatreName: show.theatreName,
      showdate: show.showdate,
      showtime: show.showtime,
      movieId: show.movieId,
      summary: {
        totalSeats: totalSeatsCount,
        availableSeats: availableCount,
        lockedSeats: lockedCount,
        bookedSeats: bookedCount
      },
      tierPricing: {
        balcony: balconyPrice,
        middle: middlePrice,
        lower: lowerPrice
      },
      layout: {
        balcony,
        middle,
        lower
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Standard Show CRUD Handlers
// ==========================================

const getAllShows = async (req, res, next) => {
  try {
    const { movieId, theatreName } = req.query;
    const filter = {};
    if (movieId) filter.movieId = movieId;
    if (theatreName) filter.theatreName = theatreName;

    const shows = await Show.find(filter).sort({ showdate: 1 });
    res.status(200).json({ success: true, count: shows.length, data: shows });
  } catch (error) {
    next(error);
  }
};

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

const createShow = async (req, res, next) => {
  try {
    const show = await Show.create(req.body);
    res.status(201).json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

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
  getFilteredShowsAndMovies,
  getSeatLayoutAndAvailability,
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow
};
