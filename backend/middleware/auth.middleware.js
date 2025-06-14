const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra user có tồn tại không
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra nếu user đã đổi mật khẩu sau khi token được tạo
    if (user.passwordChangedAt) {
      const tokenTimestamp = decoded.iat;
      const passwordChangedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      
      if (passwordChangedTimestamp > tokenTimestamp) {
        return res.status(401).json({ 
          message: 'Phiên đăng nhập đã hết hạn do mật khẩu đã được thay đổi',
          code: 'PASSWORD_CHANGED'
        });
      }
    }

    // Thêm thông tin user vào request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập' });
  }
};

const softVerifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Bỏ qua lỗi, coi như người dùng chưa đăng nhập
    // Lỗi có thể là token hết hạn hoặc không hợp lệ
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  softVerifyToken,
}; 