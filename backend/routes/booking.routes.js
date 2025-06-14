const express = require('express');
const { verifyToken } = require('../middleware/auth');
const admin = require('../middleware/admin');
const bookingController = require('../controllers/booking.controller'); // Đảm bảo import đúng
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: API quản lý đặt chỗ
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Tạo booking mới
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_type
 *             properties:
 *               booking_type:
 *                 type: string
 *                 enum: [hotel, flight, tour]
 *                 description: Loại booking (khách sạn, chuyến bay, tour)
 *               hotel_id:
 *                 type: string
 *                 description: ID của khách sạn (nếu booking_type là hotel)
 *               flight_id:
 *                 type: string
 *                 description: ID của chuyến bay (nếu booking_type là flight)
 *               tour_id:
 *                 type: string
 *                 description: ID của tour (nếu booking_type là tour)
 *               check_in:
 *                 type: string
 *                 format: date
 *                 description: Ngày check-in (nếu booking_type là hotel)
 *               check_out:
 *                 type: string
 *                 format: date
 *                 description: Ngày check-out (nếu booking_type là hotel)
 *               guests:
 *                 type: integer
 *                 description: Số lượng khách
 *               special_requests:
 *                 type: string
 *                 description: Yêu cầu đặc biệt
 *     responses:
 *       201:
 *         description: Tạo booking thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', verifyToken, bookingController.createBooking);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Lấy danh sách booking của user hiện tại
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách booking của user
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/my-bookings', verifyToken, bookingController.getUserBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của booking
 *     responses:
 *       200:
 *         description: Thông tin chi tiết booking
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy booking
 */
router.get('/:id', verifyToken, bookingController.getBookingDetails);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Hủy booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của booking
 *     responses:
 *       200:
 *         description: Hủy booking thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy booking
 */
router.put('/:id/cancel', verifyToken, bookingController.cancelBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Lấy danh sách tất cả booking (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Danh sách tất cả booking
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/', verifyToken, admin, bookingController.getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái booking (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 description: Trạng thái mới của booking
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy booking
 */
router.put('/:id/status', verifyToken, admin, bookingController.updateBookingStatus);

/**
 * @swagger
 * /api/bookings/{bookingId}/mark-as-paid:
 *   post:
 *     summary: Đánh dấu booking đã thanh toán (giả lập)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của booking
 *     responses:
 *       200:
 *         description: Đánh dấu booking đã thanh toán thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/:bookingId/mark-as-paid', verifyToken, bookingController.markBookingAsPaid);

module.exports = router;