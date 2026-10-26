const express = require('express');
const router = express.Router();
const {
  register,
  registerAdmin,
  login,
  getMe
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);

// Protected route for currently authenticated user/admin
router.get('/me', verifyToken, getMe);

module.exports = router;
