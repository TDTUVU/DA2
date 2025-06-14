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
  duration_display: {
    type: String
  },
  total_amount: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  booking_status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  cancellation_reason: {
    type: String
  },
  cancellation_date: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Hook trước khi lưu để log và xử lý logic trạng thái
bookingSchema.pre('save', function(next) {
  // Log thông tin
  console.log('Saving booking with ID:', this._id);
  console.log('Current payment status:', this.payment_status);
  console.log('Current booking status:', this.booking_status);
  console.log('Modified paths:', this.modifiedPaths());

  // Tự động cập nhật trạng thái booking dựa trên payment_status
  if (this.isModified('payment_status')) {
    switch (this.payment_status) {
      case 'Paid':
        if (this.booking_status === 'Pending') {
          this.booking_status = 'Confirmed';
        }
        break;
      case 'Cancelled':
        this.booking_status = 'Cancelled';
        break;
    }
  }

  // Nếu booking bị hủy, lưu thời gian hủy
  if (this.isModified('booking_status') && this.booking_status === 'Cancelled' && !this.cancellation_date) {
    this.cancellation_date = new Date();
  }

  next();
});

module.exports = mongoose.model('Booking', bookingSchema);