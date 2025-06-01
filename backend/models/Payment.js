const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  payment_date: {
    type: Date,
    required: true
  },
  payment_status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  payment_method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'VNPay'],
    required: true
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  payment_details: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema); 