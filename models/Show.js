const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    showId: {
      type: String,
      required: [true, 'Show ID is required'],
      unique: true,
      trim: true
    },
    adminEmail: {
      type: String,
      required: [true, 'Admin email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid admin email']
    },
    tickets: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    showtime: {
      type: String,
      required: [true, 'Showtime is required'],
      trim: true
    },
    showdate: {
      type: Date,
      required: [true, 'Showdate is required']
    },
    theatreName: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true
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

module.exports = mongoose.model('Show', showSchema);
