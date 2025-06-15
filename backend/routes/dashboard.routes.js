const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: API thống kê cho admin
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Lấy thống kê doanh thu (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê doanh thu
 *       401:
 *         description: Không có quyền admin
 */
router.get('/stats', verifyToken, isAdmin, dashboardController.getRevenueStats);

// Route lấy metrics cho dashboard
router.get('/metrics', verifyToken, isAdmin, dashboardController.getDashboardMetrics);

module.exports = router; 