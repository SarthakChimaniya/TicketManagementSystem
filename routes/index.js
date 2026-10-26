const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');
const movieRoutes = require('./movieRoutes');
const theatreRoutes = require('./theatreRoutes');
const showRoutes = require('./showRoutes');
const bookingRoutes = require('./bookingRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const reviewRoutes = require('./reviewRoutes');

// Mount Auth, User, and Admin Sub-routers
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);

// Mount Platform Resource Sub-routers
router.use('/movies', movieRoutes);
router.use('/theatres', theatreRoutes);
router.use('/shows', showRoutes);
router.use('/bookings', bookingRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
