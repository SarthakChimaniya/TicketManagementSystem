const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');

console.log('--- Testing Controller Handler Signatures & Validations ---');
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  // Test User Controller methods exist
  assert(typeof userController.getProfile === 'function', 'userController.getProfile is defined');
  assert(typeof userController.updateProfile === 'function', 'userController.updateProfile is defined');
  assert(typeof userController.getWatchlist === 'function', 'userController.getWatchlist is defined');
  assert(typeof userController.addToWatchlist === 'function', 'userController.addToWatchlist is defined');
  assert(typeof userController.removeFromWatchlist === 'function', 'userController.removeFromWatchlist is defined');
  assert(typeof userController.submitReview === 'function', 'userController.submitReview is defined');
  assert(typeof userController.getMyReviews === 'function', 'userController.getMyReviews is defined');
  assert(typeof userController.getMyBookings === 'function', 'userController.getMyBookings is defined');
  assert(typeof userController.getBookingDetails === 'function', 'userController.getBookingDetails is defined');

  // Test Admin Controller methods exist
  assert(typeof adminController.createMovie === 'function', 'adminController.createMovie is defined');
  assert(typeof adminController.getAllMovies === 'function', 'adminController.getAllMovies is defined');
  assert(typeof adminController.getMovieById === 'function', 'adminController.getMovieById is defined');
  assert(typeof adminController.updateMovie === 'function', 'adminController.updateMovie is defined');
  assert(typeof adminController.deleteMovie === 'function', 'adminController.deleteMovie is defined');
  assert(typeof adminController.createTheatre === 'function', 'adminController.createTheatre is defined');
  assert(typeof adminController.getAllTheatres === 'function', 'adminController.getAllTheatres is defined');
  assert(typeof adminController.getTheatreById === 'function', 'adminController.getTheatreById is defined');
  assert(typeof adminController.updateTheatre === 'function', 'adminController.updateTheatre is defined');
  assert(typeof adminController.deleteTheatre === 'function', 'adminController.deleteTheatre is defined');
  assert(typeof adminController.getSystemBookings === 'function', 'adminController.getSystemBookings is defined');
  assert(typeof adminController.updateBookingStatus === 'function', 'adminController.updateBookingStatus is defined');
  assert(typeof adminController.getRevenueReport === 'function', 'adminController.getRevenueReport is defined');
  assert(typeof adminController.getAllReviewsForModeration === 'function', 'adminController.getAllReviewsForModeration is defined');
  assert(typeof adminController.moderateReview === 'function', 'adminController.moderateReview is defined');
  assert(typeof adminController.deleteReview === 'function', 'adminController.deleteReview is defined');
  assert(typeof adminController.getDashboardOverview === 'function', 'adminController.getDashboardOverview is defined');

  // Test validation in userController.submitReview
  let reviewValidationFailed = false;
  const mockReqReview = { body: {}, user: { email: 'test@example.com' } };
  const mockRes = {
    status: (c) => ({
      json: (d) => {
        if (c === 400 && d.success === false) reviewValidationFailed = true;
      }
    })
  };
  await userController.submitReview(mockReqReview, mockRes, () => {});
  assert(reviewValidationFailed, 'userController.submitReview rejects missing inputs with 400');

  // Test validation in adminController.createMovie
  let movieValidationFailed = false;
  const mockReqMovie = { body: {} };
  await adminController.createMovie(mockReqMovie, {
    status: (c) => ({
      json: (d) => {
        if (c === 400 && d.success === false) movieValidationFailed = true;
      }
    })
  }, () => {});
  assert(movieValidationFailed, 'adminController.createMovie rejects missing fields with 400');

  // Test validation in adminController.createTheatre
  let theatreValidationFailed = false;
  const mockReqTheatre = { body: {} };
  await adminController.createTheatre(mockReqTheatre, {
    status: (c) => ({
      json: (d) => {
        if (c === 400 && d.success === false) theatreValidationFailed = true;
      }
    })
  }, () => {});
  assert(theatreValidationFailed, 'adminController.createTheatre rejects missing fields with 400');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
