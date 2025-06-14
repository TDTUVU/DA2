const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: API tải lên tệp
 */

/**
 * @swagger
 * /api/upload/base64:
 *   post:
 *     summary: Tải ảnh lên bằng chuỗi base64
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: 'Chuỗi Data URI base64 của ảnh (vd: data:image/png;base64,iVBORw0KGgo...)'
 *     responses:
 *       200:
 *         description: Tải ảnh lên thành công
 *       400:
 *         description: Thiếu dữ liệu ảnh
 */
router.post('/base64', verifyToken, uploadController.uploadBase64);

module.exports = router; 