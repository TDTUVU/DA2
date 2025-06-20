const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const { verifyToken, isAdmin, softVerifyToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Tours
 *   description: API quản lý tour du lịch
 */

/**
 * @swagger
 * /api/tours:
 *   get:
 *     summary: Lấy danh sách tour
 *     tags: [Tours]
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
 *         description: Số lượng tour mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách tour
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   destination:
 *                     type: string
 *                   duration:
 *                     type: number
 *                   price:
 *                     type: number
 */
router.get('/', softVerifyToken, tourController.getAllTours);

/**
 * @swagger
 * /api/tours/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tour
 *     responses:
 *       200:
 *         description: Thông tin chi tiết tour
 *       404:
 *         description: Không tìm thấy tour
 */
router.get('/:id', tourController.getTourById);

/**
 * @swagger
 * /api/tours:
 *   post:
 *     summary: Thêm tour mới (Admin only)
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     x-security-role: admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - destination
 *               - duration
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên tour
 *               description:
 *                 type: string
 *                 description: Mô tả tour
 *               destination:
 *                 type: string
 *                 description: Điểm đến
 *               duration:
 *                 type: number
 *                 description: Thời gian tour (số ngày)
 *               price:
 *                 type: number
 *                 description: Giá tour
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách URL hình ảnh
 *               included:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Các dịch vụ bao gồm trong tour
 *     responses:
 *       201:
 *         description: Thêm tour thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', verifyToken, isAdmin, upload.array('images', 5), tourController.createTour);

/**
 * @swagger
 * /api/tours/{id}:
 *   put:
 *     summary: Cập nhật thông tin tour (Admin only)
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     x-security-role: admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               destination:
 *                 type: string
 *               duration:
 *                 type: number
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               included:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy tour
 */
router.patch('/:id', verifyToken, isAdmin, upload.array('images', 5), tourController.updateTour);

/**
 * @swagger
 * /api/tours/{id}:
 *   delete:
 *     summary: Xóa tour (Admin only)
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     x-security-role: admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tour
 *     responses:
 *       200:
 *         description: Xóa tour thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy tour
 */
router.delete('/:id', verifyToken, isAdmin, tourController.deleteTour);

/**
 * @swagger
 * /api/tours/{id}/toggle-visibility:
 *   patch:
 *     summary: Bật/tắt trạng thái hiển thị của tour (Admin only)
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tour
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy tour
 */
router.patch('/:id/toggle-visibility', verifyToken, isAdmin, tourController.toggleTourVisibility);

module.exports = router;