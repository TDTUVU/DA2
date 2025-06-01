const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
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
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Thêm phương thức để khởi tạo đúng ID
tourSchema.pre('save', function(next) {
  // Nếu _id là chuỗi và có định dạng hợp lệ của ObjectId, chuyển đổi thành ObjectId
  if (typeof this._id === 'string' && mongoose.Types.ObjectId.isValid(this._id)) {
    this._id = new mongoose.Types.ObjectId(this._id);
  }
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;