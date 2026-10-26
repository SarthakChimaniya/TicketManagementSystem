require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const seatLockService = require('./services/seatLockService');

// Initialize Express Application
const app = express();

// Create HTTP Server & attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach Socket.io instance to Express app for controller access
app.set('io', io);

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
    webSockets: 'Socket.io active',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/user',
      admin: '/api/admin',
      movies: '/api/movies',
      theatres: '/api/theatres',
      shows: '/api/shows',
      showsBrowse: '/api/shows/browse',
      showSeats: '/api/shows/:showId/seats',
      bookings: '/api/bookings',
      bookingsCheckout: '/api/bookings/checkout',
      bookingsLockSeats: '/api/bookings/lock-seats',
      bookingsProcessPayment: '/api/bookings/process-payment',
      favorites: '/api/favorites',
      reviews: '/api/reviews'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeSocketConnections: io.engine.clientsCount
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

// ==========================================
// WebSockets Real-Time Seat Management (Socket.io)
// ==========================================
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Join show room to receive real-time seat lock/release events
  socket.on('join-show', (showId) => {
    if (!showId) return;
    const room = `show_${showId}`;
    socket.join(room);
    console.log(`[Socket.io] Socket ${socket.id} joined room: ${room}`);

    // Send current active locked seats to the joining client
    const currentLocks = seatLockService.getLockedSeats(showId);
    socket.emit('initial-locked-seats', { showId, locks: currentLocks });
  });

  // Leave show room
  socket.on('leave-show', (showId) => {
    if (!showId) return;
    const room = `show_${showId}`;
    socket.leave(room);
    console.log(`[Socket.io] Socket ${socket.id} left room: ${room}`);
  });

  // Client requests seat lock via WebSocket
  socket.on('lock-seats', ({ showId, seats, userEmail, ttlSeconds }) => {
    const result = seatLockService.lockSeats({
      showId,
      seats,
      userEmail: userEmail || `socket_${socket.id}`,
      ttlSeconds,
      io
    });
    socket.emit('lock-result', result);
  });

  // Client releases seats via WebSocket
  socket.on('release-seats', ({ showId, seats, userEmail }) => {
    const result = seatLockService.releaseSeats({
      showId,
      seats,
      userEmail: userEmail || `socket_${socket.id}`,
      io,
      reason: 'user_released'
    });
    socket.emit('release-result', result);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Server Port Configuration
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[iMovies Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[iMovies Server] Base URL: http://localhost:${PORT}`);
    console.log(`[iMovies Server] WebSockets enabled via Socket.io`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = { app, server, io };
