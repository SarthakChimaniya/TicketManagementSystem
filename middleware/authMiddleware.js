const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');

// Verify JSON Web Token Middleware
const verifyToken = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No authorization token provided.'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026_dev'
    );

    // Look for user or admin based on decoded payload
    let account = null;
    if (decoded.role === 'admin' || decoded.role === 'superadmin') {
      account = await Admin.findById(decoded.id);
      if (!account) {
        // Fallback check in User model if stored as user with admin role
        account = await User.findById(decoded.id);
      }
    } else {
      account = await User.findById(decoded.id);
      if (!account) {
        account = await Admin.findById(decoded.id);
      }
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token: User account no longer exists.'
      });
    }

    // Attach authenticated user profile to request object
    req.user = {
      id: account._id.toString(),
      email: account.email,
      username: account.username,
      role: account.role || decoded.role || 'user'
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authorization token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid or malformed authorization token.'
    });
  }
};

// Admin-only Access Middleware
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Access forbidden: Administrator privileges required.'
    });
  }

  next();
};

// Role-based Access Middleware helper
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Role '${req.user.role}' is not authorized.`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  isAdmin,
  authorizeRoles
};
