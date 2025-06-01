const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
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
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Thêm phương thức để khởi tạo đúng ID
flightSchema.pre('save', function(next) {
  // Nếu _id là chuỗi và có định dạng hợp lệ của ObjectId, chuyển đổi thành ObjectId
  if (typeof this._id === 'string' && mongoose.Types.ObjectId.isValid(this._id)) {
    this._id = new mongoose.Types.ObjectId(this._id);
  }
  next();
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;