const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const admin = require('../middleware/admin');
const paymentController = require('../controllers/payment.controller');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: API quản lý thanh toán
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Tạo thanh toán mới
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *               - payment_method
 *             properties:
 *               booking_id:
 *                 type: string
 *                 description: ID của booking
 *               payment_method:
 *                 type: string
 *                 enum: [credit_card, debit_card, paypal, bank_transfer, VNPay]
 *                 description: Phương thức thanh toán
 *     responses:
 *       201:
 *         description: Tạo thanh toán thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', verifyToken, paymentController.createPayment);

/**
 * @swagger
 * /api/payments/vnpay:
 *   post:
 *     summary: Tạo URL thanh toán VNPay
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *             properties:
 *               booking_id:
 *                 type: string
 *                 description: ID của booking
 *     responses:
 *       200:
 *         description: Tạo URL thanh toán VNPay thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/vnpay', verifyToken, paymentController.createVnpayPayment);

/**
 * @swagger
 * /api/payments/vnpay-return:
 *   get:
 *     summary: Xử lý callback từ VNPay
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         description: Mã phản hồi từ VNPay
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Mã tham chiếu giao dịch
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         description: Chữ ký VNPay
 *     responses:
 *       302:
 *         description: Chuyển hướng đến trang kết quả thanh toán
 */
router.get('/vnpay-return', paymentController.vnpayReturn);

/**
 * @swagger
 * /api/payments/vnpay-ipn:
 *   get:
 *     summary: Xử lý IPN từ VNPay
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         description: Mã phản hồi từ VNPay
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Mã tham chiếu giao dịch
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         description: Chữ ký VNPay
 *     responses:
 *       200:
 *         description: Xác nhận IPN thành công
 */
router.get('/vnpay-ipn', paymentController.vnpayIpn);

/**
 * @swagger
 * /api/payments/result/{paymentId}:
 *   get:
 *     summary: Lấy kết quả thanh toán
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thanh toán
 *     responses:
 *       200:
 *         description: Thông tin kết quả thanh toán
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy thanh toán
 */
router.get('/result/:paymentId', verifyToken, paymentController.getPaymentResult);

/**
 * @swagger
 * /api/payments/my-payments:
 *   get:
 *     summary: Lấy lịch sử thanh toán của user hiện tại
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lịch sử thanh toán của user
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/my-payments', verifyToken, paymentController.getUserPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết thanh toán
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thanh toán
 *     responses:
 *       200:
 *         description: Thông tin chi tiết thanh toán
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy thanh toán
 */
router.get('/:id', verifyToken, paymentController.getPaymentById);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Lấy danh sách tất cả thanh toán (Admin only)
 *     tags: [Payments]
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
 *         description: Danh sách tất cả thanh toán
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/', verifyToken, admin, paymentController.getAllPayments);

/**
 * @swagger
 * /api/payments/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái thanh toán
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thanh toán
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_status
 *             properties:
 *               payment_status:
 *                 type: string
 *                 enum: [Pending, Paid, Failed]
 *                 description: Trạng thái mới của thanh toán
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy thanh toán
 */
router.put('/:id/status', verifyToken, paymentController.updatePaymentStatus);

module.exports = router; 