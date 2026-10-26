require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express Application
const app = express();

// Connect to MongoDB Database
connectDB();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to iMovies Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/user',
      admin: '/api/admin',
      movies: '/api/movies',
      theatres: '/api/theatres',
      shows: '/api/shows',
      bookings: '/api/bookings',
      favorites: '/api/favorites',
      reviews: '/api/reviews'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount Centralized API Routes
app.use('/api', apiRoutes);

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Not Found - ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Server Port Configuration
const PORT = process.env.PORT || 5000;

let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`[iMovies Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[iMovies Server] Base URL: http://localhost:${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = { app, server };
