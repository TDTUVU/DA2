const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const admin = require('../middleware/admin');
const reviewController = require('../controllers/review.controller');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API quản lý đánh giá
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Tạo đánh giá mới
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotel_id
 *               - rating
 *               - comment
 *             properties:
 *               hotel_id:
 *                 type: string
 *                 description: ID của khách sạn
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Số sao đánh giá (1-5)
 *               comment:
 *                 type: string
 *                 description: Nội dung đánh giá
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách URL hình ảnh
 *     responses:
 *       201:
 *         description: Tạo đánh giá thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', verifyToken, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/hotel/{hotelId}:
 *   get:
 *     summary: Lấy danh sách đánh giá của một khách sạn
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khách sạn
 *     responses:
 *       200:
 *         description: Danh sách đánh giá của khách sạn
 *       404:
 *         description: Không tìm thấy khách sạn
 */
router.get('/hotel/:hotelId', reviewController.getHotelReviews);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Cập nhật đánh giá
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đánh giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Số sao đánh giá (1-5)
 *               comment:
 *                 type: string
 *                 description: Nội dung đánh giá
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách URL hình ảnh
 *     responses:
 *       200:
 *         description: Cập nhật đánh giá thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy đánh giá
 */
router.put('/:id', verifyToken, reviewController.updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Xóa đánh giá
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đánh giá
 *     responses:
 *       200:
 *         description: Xóa đánh giá thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy đánh giá
 */
router.delete('/:id', verifyToken, reviewController.deleteReview);

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Lấy danh sách tất cả đánh giá (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Lọc theo số sao đánh giá
 *     responses:
 *       200:
 *         description: Danh sách tất cả đánh giá
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/', verifyToken, admin, reviewController.getAllReviews);

module.exports = router; 