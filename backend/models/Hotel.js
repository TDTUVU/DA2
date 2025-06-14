const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  price_per_night: {
    type: Number,
    required: true
  },
  available_rooms: {
    type: Number,
    required: true
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  description: {
    type: String,
    default: ''
  },
  check_in_time: {
    type: String,
    default: '14:00'
  },
  check_out_time: {
    type: String,
    default: '12:00'
  },
  policies: [{
    type: String
  }],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);