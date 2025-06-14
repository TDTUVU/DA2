const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flight_name: {
    type: String,
    required: true
  },
  departure: {
    type: String,
    required: true
  },
  arrival: {
    type: String,
    required: true
  },
  departure_time: {
    type: Date,
    required: true
  },
  arrival_time: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  available_seats: {
    type: Number,
    required: true,
    default: 0
  },
  airline: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;