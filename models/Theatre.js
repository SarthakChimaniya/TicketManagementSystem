const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    theatreId: {
      type: String,
      required: [true, 'Theatre ID is required'],
      unique: true,
      trim: true
    },
    theatreName: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true
    },
    adminName: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    // Seating Capacities
    lowerSeats: {
      type: Number,
      required: [true, 'Lower seats capacity is required'],
      min: [0, 'Capacity cannot be negative'],
      default: 0
    },
    middleSeats: {
      type: Number,
      required: [true, 'Middle seats capacity is required'],
      min: [0, 'Capacity cannot be negative'],
      default: 0
    },
    balconySeats: {
      type: Number,
      required: [true, 'Balcony seats capacity is required'],
      min: [0, 'Capacity cannot be negative'],
      default: 0
    },
    // Respective Pricing
    lowerSeatPrice: {
      type: Number,
      required: [true, 'Lower seat price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    middleSeatPrice: {
      type: Number,
      required: [true, 'Middle seat price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    balconySeatPrice: {
      type: Number,
      required: [true, 'Balcony seat price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Theatre', theatreSchema);
