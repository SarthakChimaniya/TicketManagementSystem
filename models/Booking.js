const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      unique: true,
      trim: true
    },
    showId: {
      type: String,
      required: [true, 'Show ID is required'],
      trim: true
    },
    ticketsData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Tickets data (selected seat numbers) is required']
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid user email']
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'confirmed'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
