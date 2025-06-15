const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Lấy lịch sử chat giữa user và admin
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.query; // Lấy userId từ query params
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Chuyển đổi string ID thành ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    const messages = await Message.find({
      $or: [
        { sender: userObjectId, receiver: currentUserObjectId },
        { sender: currentUserObjectId, receiver: userObjectId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username full_name')
    .populate('receiver', 'username full_name');

    res.json(messages);
  } catch (error) {
    console.error('Error in getChatHistory:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách các cuộc trò chuyện của admin
exports.getAdminConversations = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const adminId = new mongoose.Types.ObjectId(req.user._id);

    // Lấy danh sách unique users đã chat với admin
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: adminId },
            { receiver: adminId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', adminId] },
              then: '$receiver',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$content' },
          lastMessageDate: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', adminId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Populate thông tin user
    const populatedConversations = await User.populate(conversations, {
      path: '_id',
      select: 'username full_name'
    });

    res.json(populatedConversations);
  } catch (error) {
    console.error('Error in getAdminConversations:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đánh dấu tin nhắn đã đọc
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    
    await Message.updateMany(
      {
        sender: senderId,
        receiver: req.user._id,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    res.json({ message: 'Đã cập nhật trạng thái tin nhắn' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 