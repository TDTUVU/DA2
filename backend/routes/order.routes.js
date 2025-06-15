const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Route lấy danh sách đơn hàng (cần đăng nhập)
router.get('/', verifyToken, orderController.getOrders);

// Route tạo đơn hàng mới (cần đăng nhập)
router.post('/', verifyToken, orderController.createOrder);

// Route cập nhật trạng thái đơn hàng (chỉ admin)
router.patch('/:orderId/status', verifyToken, isAdmin, orderController.updateOrderStatus);

// Route lấy chi tiết đơn hàng (cần đăng nhập)
router.get('/:orderId', verifyToken, orderController.getOrderDetails);

module.exports = router; 