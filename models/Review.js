const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true
    },
    adminModeration: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Review', reviewSchema);
