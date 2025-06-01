const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel_id: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Hotel',
    required: false
  },
  flight_id: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Flight',
    required: false
  },
  tour_id: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Tour',
    required: false
  },
  booking_date: {
    type: Date,
    required: true
  },
  check_in: {
    type: Date
  },
  check_out: {
    type: Date
  },
  total_amount: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Hook trước khi lưu để log
bookingSchema.pre('save', function(next) {
  console.log('Saving booking with ID:', this._id);
  console.log('Current payment status:', this.payment_status);
  console.log('Modified paths:', this.modifiedPaths());
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);