const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');
const { verifyToken, isAdmin, softVerifyToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: API quản lý khách sạn
 */

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Lấy danh sách khách sạn
 *     tags: [Hotels]
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
 *         description: Số lượng khách sạn mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách khách sạn
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
 *                   address:
 *                     type: string
 *                   price_per_night:
 *                     type: number
 *                   rating:
 *                     type: number
 */
router.get('/', softVerifyToken, hotelController.getAllHotels);

/**
 * @swagger
 * /api/hotels/search:
 *   get:
 *     summary: Tìm kiếm khách sạn
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Địa điểm
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *         description: Giá thấp nhất
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *         description: Giá cao nhất
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Đánh giá tối thiểu
 *     responses:
 *       200:
 *         description: Danh sách khách sạn phù hợp
 */
router.get('/search', hotelController.getAllHotels);

/**
 * @swagger
 * /api/hotels/location/{locationId}:
 *   get:
 *     summary: Lấy danh sách khách sạn theo địa điểm
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của địa điểm
 *     responses:
 *       200:
 *         description: Danh sách khách sạn theo địa điểm
 */
router.get('/location/:locationId', hotelController.getHotelsByLocation);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết khách sạn
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khách sạn
 *     responses:
 *       200:
 *         description: Thông tin chi tiết khách sạn
 *       404:
 *         description: Không tìm thấy khách sạn
 */
router.get('/:id', hotelController.getHotelById);

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Thêm khách sạn mới (Admin only)
 *     tags: [Hotels]
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
 *               - address
 *               - description
 *               - price_per_night
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên khách sạn
 *               address:
 *                 type: string
 *                 description: Địa chỉ
 *               description:
 *                 type: string
 *                 description: Mô tả
 *               price_per_night:
 *                 type: number
 *                 description: Giá mỗi đêm
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách URL hình ảnh
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách tiện nghi
 *               location:
 *                 type: string
 *                 description: ID của địa điểm
 *     responses:
 *       201:
 *         description: Thêm khách sạn thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', verifyToken, isAdmin, upload.array('images', 5), hotelController.createHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   put:
 *     summary: Cập nhật thông tin khách sạn (Admin only)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     x-security-role: admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khách sạn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               price_per_night:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy khách sạn
 */
router.patch('/:id', verifyToken, isAdmin, upload.array('images', 5), hotelController.updateHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     summary: Xóa khách sạn (Admin only)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     x-security-role: admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khách sạn
 *     responses:
 *       200:
 *         description: Xóa khách sạn thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy khách sạn
 */
router.delete('/:id', verifyToken, isAdmin, hotelController.deleteHotel);

/**
 * @swagger
 * /api/hotels/{id}/toggle-visibility:
 *   patch:
 *     summary: Bật/tắt trạng thái hiển thị của khách sạn (Admin only)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khách sạn
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy khách sạn
 */
router.patch('/:id/toggle-visibility', verifyToken, isAdmin, hotelController.toggleHotelVisibility);

router.post('/sample-hotels', hotelController.createSampleHotels);

// Thêm route mới cho recreateHotels 
router.post('/recreate', hotelController.recreateHotels);

module.exports = router; 