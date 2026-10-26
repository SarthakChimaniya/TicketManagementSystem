const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');

// Helper to generate JWT
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026_dev',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Input sanitization helper
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

// @desc    Register a standard User or Admin
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    let { email, username, password, role } = req.body;

    email = sanitizeInput(email).toLowerCase();
    username = sanitizeInput(username);
    password = typeof password === 'string' ? password.trim() : '';
    role = role ? sanitizeInput(role).toLowerCase() : 'user';

    // Input Validation
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, username, and password.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters long.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    // Role check and duplicate verification
    if (role === 'admin') {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          error: 'An administrator account with this email already exists.'
        });
      }

      const admin = await Admin.create({ email, username, password, role: 'admin' });
      const token = generateToken({
        id: admin._id,
        email: admin.email,
        username: admin.username,
        role: admin.role
      });

      return res.status(201).json({
        success: true,
        message: 'Administrator registered successfully.',
        token,
        data: {
          id: admin._id,
          email: admin.email,
          username: admin.username,
          role: admin.role
        }
      });
    }

    // Standard User Registration
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'A user account with this email already exists.'
      });
    }

    const user = await User.create({ email, username, password, role: 'user' });
    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register an Admin account directly
// @route   POST /api/auth/register-admin
const registerAdmin = async (req, res, next) => {
  req.body.role = 'admin';
  return register(req, res, next);
};

// @desc    Login for both Users and Admins
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    email = sanitizeInput(email).toLowerCase();
    password = typeof password === 'string' ? password.trim() : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    // Search in Admin first, then User
    let account = await Admin.findOne({ email });
    let isAccountAdmin = !!account;

    if (!account) {
      account = await User.findOne({ email });
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. No account found with this email.'
      });
    }

    // Compare hashed password
    const isMatch = await account.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Password does not match.'
      });
    }

    const role = account.role || (isAccountAdmin ? 'admin' : 'user');
    const token = generateToken({
      id: account._id,
      email: account.email,
      username: account.username,
      role
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      data: {
        id: account._id,
        email: account.email,
        username: account.username,
        role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    // req.user is set by verifyToken middleware
    let account = await User.findById(req.user.id);
    if (!account) {
      account = await Admin.findById(req.user.id);
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: account._id,
        email: account.email,
        username: account.username,
        role: account.role || req.user.role,
        createdAt: account.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerAdmin,
  login,
  getMe
};
