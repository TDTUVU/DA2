const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const hotelRoutes = require('./hotel.routes');
const flightRoutes = require('./flight.routes');
const tourRoutes = require('./tour.routes');
const bookingRoutes = require('./booking.routes'); // Đảm bảo import đúng
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');
const locationRoutes = require('./location.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/hotels', hotelRoutes);
router.use('/flights', flightRoutes);
router.use('/tours', tourRoutes);
router.use('/bookings', bookingRoutes); // Đảm bảo sử dụng đúng
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/locations', locationRoutes);

module.exports = router;