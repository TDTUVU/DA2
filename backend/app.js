require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const path = require('path');
const hotelRoutes = require('./routes/hotel.routes');
const flightRoutes = require('./routes/flight.routes');
const tourRoutes = require('./routes/tour.routes');
const cookieParser = require('cookie-parser');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const helmet = require('helmet');
const revenueRoutes = require('./routes/revenue.routes');

const app = express();
app.set('trust proxy', 1); // Tin tưởng proxy để lấy IP thật

// Cấu hình CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Đảm bảo URL frontend đúng
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(helmet());

// Middleware
// Tăng giới hạn payload cho JSON để xử lý ảnh base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());

// Serve static files from public folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/revenue', revenueRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã có lỗi xảy ra!', error: err.message });
});

module.exports = app;