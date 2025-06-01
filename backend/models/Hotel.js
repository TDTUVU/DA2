const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
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
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Thêm phương thức để khởi tạo đúng ID
hotelSchema.pre('save', function(next) {
  // Nếu _id là chuỗi và có định dạng hợp lệ của ObjectId, chuyển đổi thành ObjectId
  if (typeof this._id === 'string' && mongoose.Types.ObjectId.isValid(this._id)) {
    this._id = new mongoose.Types.ObjectId(this._id);
  }
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);