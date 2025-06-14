const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  tour_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price_per_person: {
    type: Number,
    required: true
  },
  available_seats: {
    type: Number,
    required: true,
    default: 0
  },
  duration: {
    type: String,
    required: true
  },
  departure_location: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  departure_time: {
    type: String,
    required: true
  },
  itinerary: {
    type: [String],
    default: []
  },
  inclusions: {
    type: [String],
    default: []
  },
  exclusions: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 0
  },
  policies: {
    type: [String],
    default: []
  },
  highlights: {
    type: [String],
    default: []
  },
  requirements: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;