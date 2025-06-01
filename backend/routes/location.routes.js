const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const admin = require('../middleware/admin');
const locationController = require('../controllers/location.controller');

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: API quản lý địa điểm
 */

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Lấy danh sách địa điểm
 *     tags: [Locations]
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
 *         description: Số lượng địa điểm mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách địa điểm
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
 *                   country:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 */
router.get('/', locationController.getAllLocations);

/**
 * @swagger
 * /api/locations/name/{name}:
 *   get:
 *     summary: Lấy danh sách địa điểm theo tên
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Tên địa điểm (tìm kiếm mờ)
 *     responses:
 *       200:
 *         description: Danh sách địa điểm theo tên
 */
router.get('/name/:name', locationController.getLocationsByName);

/**
 * @swagger
 * /api/locations/distance/{latitude}/{longitude}/{distance}:
 *   get:
 *     summary: Lấy danh sách địa điểm theo khoảng cách
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Vĩ độ
 *       - in: path
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Kinh độ
 *       - in: path
 *         name: distance
 *         required: true
 *         schema:
 *           type: number
 *         description: Khoảng cách (km)
 *     responses:
 *       200:
 *         description: Danh sách địa điểm trong khoảng cách
 */
router.get('/distance/:latitude/:longitude/:distance', locationController.getLocationsByDistance);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết địa điểm
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của địa điểm
 *     responses:
 *       200:
 *         description: Thông tin chi tiết địa điểm
 *       404:
 *         description: Không tìm thấy địa điểm
 */
router.get('/:id', locationController.getLocationById);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Thêm địa điểm mới (Admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - country
 *               - coordinates
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên địa điểm
 *               description:
 *                 type: string
 *                 description: Mô tả địa điểm
 *               country:
 *                 type: string
 *                 description: Quốc gia
 *               coordinates:
 *                 type: object
 *                 required:
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     description: Vĩ độ
 *                   longitude:
 *                     type: number
 *                     description: Kinh độ
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách URL hình ảnh
 *     responses:
 *       201:
 *         description: Thêm địa điểm thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', verifyToken, admin, locationController.createLocation);

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Cập nhật thông tin địa điểm (Admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của địa điểm
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
 *               country:
 *                 type: string
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy địa điểm
 */
router.put('/:id', verifyToken, admin, locationController.updateLocation);

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Xóa địa điểm (Admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của địa điểm
 *     responses:
 *       200:
 *         description: Xóa địa điểm thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy địa điểm
 */
router.delete('/:id', verifyToken, admin, locationController.deleteLocation);

module.exports = router; 