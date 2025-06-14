const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// ===============================================
// USER ROUTES (Protected)
// ===============================================
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.put('/profile/avatar', verifyToken, userController.updateAvatar);
router.put('/profile/change-password', verifyToken, userController.changePassword);
router.delete('/profile', verifyToken, userController.deleteUser);
router.get('/bookings', verifyToken, userController.getUserBookings);

// ===============================================
// ADMIN ROUTES (Protected by verifyToken and isAdmin)
// ===============================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Danh sách users
 */
router.get('/', verifyToken, isAdmin, userController.getAllUsers);

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
 *             properties:
 *               userId: { type: string }
 *               role: { type: string, enum: ['user', 'admin'] }
 *     responses:
 *       200:
 *         description: Cập nhật role thành công
 */
router.put('/role', verifyToken, isAdmin, userController.updateUserRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa một user bởi Admin (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công
 */
router.delete('/:id', verifyToken, isAdmin, userController.deleteUserByAdmin);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin user bởi Admin (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string }
 *               email: { type: string }
 *               phone_number: { type: string }
 *               address: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thông tin người dùng thành công
 */
router.put('/:id', verifyToken, isAdmin, userController.updateUserByAdmin);

module.exports = router;