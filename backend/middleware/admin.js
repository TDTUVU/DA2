const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    console.log('Admin middleware - user from token:', req.user);
    
    if (!req.user || !req.user._id) {
      console.log('No user or user ID in token');
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    // Kiểm tra role trực tiếp từ token trước
    if (req.user.role === 'admin') {
      console.log('User is admin based on token');
      return next();
    }

    // Double check với database nếu cần
    const user = await User.findById(req.user._id);
    console.log('Admin middleware - user from database:', user);
    
    if (!user || user.role !== 'admin') {
      console.log('User not found or not admin in database');
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = admin; 