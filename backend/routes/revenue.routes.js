const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const admin = require('../middleware/admin');
const revenueController = require('../controllers/revenue.controller');

/**
 * @swagger
 * tags:
 *   name: Revenue
 *   description: API quản lý doanh thu
 */

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     summary: Lấy thống kê doanh thu
 *     tags: [Revenue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Thống kê doanh thu thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/', verifyToken, admin, revenueController.getRevenueStats);

/**
 * @swagger
 * /api/admin/revenue/export:
 *   get:
 *     summary: Xuất báo cáo doanh thu
 *     tags: [Revenue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Xuất báo cáo thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/export', verifyToken, admin, revenueController.exportRevenueReport);

module.exports = router; 