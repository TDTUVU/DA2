const express = require('express');
const router = express.Router();
const {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
  getFlightsByRoute,
  getFlightsByAirline,
  createSampleFlights,
  recreateFlights
} = require('../controllers/flight.controller');
const { verifyToken } = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * @swagger
 * tags:
 *   name: Flights
 *   description: API quản lý chuyến bay
 */

/**
 * @swagger
 * /api/flights:
 *   get:
 *     summary: Lấy danh sách chuyến bay
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng chuyến bay mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách chuyến bay
 */
router.get('/', getAllFlights);

/**
 * @swagger
 * /api/flights/create-samples:
 *   post:
 *     summary: Tạo dữ liệu mẫu cho chuyến bay
 *     tags: [Flights]
 *     responses:
 *       200:
 *         description: Dữ liệu mẫu đã được tạo thành công
 */
router.post('/create-samples', createSampleFlights);

/**
 * @swagger
 * /api/flights/recreate:
 *   post:
 *     summary: Tạo lại dữ liệu cho chuyến bay
 *     tags: [Flights]
 *     responses:
 *       200:
 *         description: Dữ liệu đã được tạo lại thành công
 */
router.post('/recreate', recreateFlights);

/**
 * @swagger
 * /api/flights/route/{departure}/{arrival}:
 *   get:
 *     summary: Lấy danh sách chuyến bay theo tuyến đường
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: departure
 *         required: true
 *         schema:
 *           type: string
 *         description: Nơi khởi hành
 *       - in: path
 *         name: arrival
 *         required: true
 *         schema:
 *           type: string
 *         description: Nơi đến
 *     responses:
 *       200:
 *         description: Danh sách chuyến bay theo tuyến đường
 */
router.get('/route/:departure/:arrival', getFlightsByRoute);

/**
 * @swagger
 * /api/flights/airline/{airline}:
 *   get:
 *     summary: Lấy danh sách chuyến bay theo hãng hàng không
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: airline
 *         required: true
 *         schema:
 *           type: string
 *         description: Tên hãng hàng không
 *     responses:
 *       200:
 *         description: Danh sách chuyến bay theo hãng hàng không
 */
router.get('/airline/:airline', getFlightsByAirline);

/**
 * @swagger
 * /api/flights:
 *   post:
 *     summary: Thêm chuyến bay mới (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     x-security-role: admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Thêm chuyến bay thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', verifyToken, admin, createFlight);

/**
 * @swagger
 * /api/flights/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết chuyến bay
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của chuyến bay
 *     responses:
 *       200:
 *         description: Thông tin chi tiết chuyến bay
 *       404:
 *         description: Không tìm thấy chuyến bay
 */
router.get('/:id', getFlightById);

/**
 * @swagger
 * /api/flights/{id}:
 *   put:
 *     summary: Cập nhật thông tin chuyến bay (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     x-security-role: admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của chuyến bay
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy chuyến bay
 */
router.put('/:id', verifyToken, admin, updateFlight);

/**
 * @swagger
 * /api/flights/{id}:
 *   delete:
 *     summary: Xóa chuyến bay (Admin only)
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *     x-security-role: admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của chuyến bay
 *     responses:
 *       200:
 *         description: Xóa chuyến bay thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy chuyến bay
 */
router.delete('/:id', verifyToken, admin, deleteFlight);

module.exports = router;