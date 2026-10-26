const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid user email']
    },
    movieId: {
      type: String,
      required: [true, 'Movie ID is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate watchlist entries for the same user and movie
favoriteSchema.index({ userEmail: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
