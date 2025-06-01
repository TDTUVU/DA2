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

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Đảm bảo URL frontend đúng
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json()); // Middleware để parse JSON
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi server', error: err.message });
});

module.exports = app;