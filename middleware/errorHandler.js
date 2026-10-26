// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.stack || err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue);
    return res.status(409).json({
      success: false,
      error: `Duplicate value entered for ${fields.join(', ')}`
    });
  }

  // CastError (invalid ObjectId / type)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid resource identifier: ${err.value}`
    });
  }

  // General fallback error response
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
