const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flight.controller');
const { verifyToken, isAdmin, softVerifyToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Flights
 *   description: API quản lý chuyến bay
 */

// ===============================================
// PUBLIC ROUTES
// ===============================================

/**
 * @swagger
 * /api/flights:
 *   get:
 *     summary: Lấy danh sách tất cả chuyến bay (có phân trang và tìm kiếm). Admin sẽ thấy cả chuyến bay ẩn.
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Số lượng kết quả mỗi trang
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Tìm kiếm theo tên chuyến bay
 *     responses:
 *       200:
 *         description: Danh sách chuyến bay
 */
router.get('/', softVerifyToken, flightController.getAllFlights);

/**
 * @swagger
 * /api/flights/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết một chuyến bay
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chi tiết chuyến bay
 *       404:
 *         description: Không tìm thấy chuyến bay
 */
router.get('/:id', flightController.getFlightById);


// ===============================================
// ADMIN ROUTES
// ===============================================

/**
 * @swagger
 * /api/flights:
 *   post:
 *     summary: Tạo một chuyến bay mới (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               flight_name: { type: string }
 *               departure: { type: string }
 *               arrival: { type: string }
 *               departure_time: { type: string, format: date-time }
 *               arrival_time: { type: string, format: date-time }
 *               price: { type: number }
 *               available_seats: { type: number }
 *               airline: { type: string }
 *               rating: { type: number }
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Tạo chuyến bay thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post(
    '/', 
    verifyToken, 
    isAdmin, 
    upload.array('images', 5), 
    flightController.createFlight
);

/**
 * @swagger
 * /api/flights/{id}:
 *   patch:
 *     summary: Cập nhật một chuyến bay (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               flight_name: { type: string }
 *               departure: { type: string }
 *               arrival: { type: string }
 *               departure_time: { type: string, format: date-time }
 *               arrival_time: { type: string, format: date-time }
 *               price: { type: number }
 *               available_seats: { type: number }
 *               airline: { type: string }
 *               rating: { type: number }
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               existingImages:
 *                 type: string
 *                 description: JSON string of existing image URLs
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy chuyến bay
 */
router.patch(
    '/:id', 
    verifyToken, 
    isAdmin, 
    upload.array('images', 5), 
    flightController.updateFlight
);

/**
 * @swagger
 * /api/flights/{id}:
 *   delete:
 *     summary: Xóa một chuyến bay (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy chuyến bay
 */
router.delete('/:id', verifyToken, isAdmin, flightController.deleteFlight);

/**
 * @swagger
 * /api/flights/{id}/toggle-visibility:
 *   patch:
 *     summary: Bật/tắt hiển thị chuyến bay (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy chuyến bay
 */
router.patch('/:id/toggle-visibility', verifyToken, isAdmin, flightController.toggleFlightVisibility);

module.exports = router;