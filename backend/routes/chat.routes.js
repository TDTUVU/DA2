const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Lấy lịch sử chat
router.get('/history', verifyToken, chatController.getChatHistory);

// Lấy danh sách cuộc trò chuyện (chỉ dành cho admin)
router.get('/conversations', verifyToken, chatController.getAdminConversations);

// Đánh dấu tin nhắn đã đọc
router.put('/mark-read/:senderId', verifyToken, chatController.markMessagesAsRead);

module.exports = router; 