const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để upload ảnh
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Lấy thông tin profile của user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile của user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 address:
 *                   type: string
 *                 images:
 *                   type: string
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy user
 */
router.get('/profile', verifyToken, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Cập nhật thông tin profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 address:
 *                   type: string
 *                 images:
 *                   type: string
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy user
 */
router.put('/profile', verifyToken, upload.single('images'), userController.updateProfile);

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Xóa tài khoản
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa tài khoản thành công
 *       401:
 *         description: Không tìm thấy token xác thực
 */
router.delete('/profile', verifyToken, userController.deleteUser);

/**
 * @swagger
 * /api/users/bookings:
 *   get:
 *     summary: Lấy danh sách booking của user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách booking
 *       401:
 *         description: Không tìm thấy token xác thực
 */
router.get('/bookings', verifyToken, userController.getUserBookings);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách users
 *       401:
 *         description: Không có quyền admin
 */
router.get('/', verifyToken, admin, userController.getAllUsers);

/**
 * @swagger
 * /api/users/role:
 *   put:
 *     summary: Cập nhật role của user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Cập nhật role thành công
 *       401:
 *         description: Không có quyền admin
 */
router.put('/role', verifyToken, admin, userController.updateUserRole);

module.exports = router;