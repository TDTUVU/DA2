const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  try {
    console.log('=== Auth Middleware ===');
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'null');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token not found or invalid format');
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, attempting to verify...');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully');
      console.log('Decoded Token:', {
        _id: decoded._id,
        role: decoded.role
      });
      
      // Đảm bảo decoded có đủ thông tin cần thiết
      if (!decoded._id || !decoded.role) {
        console.log('Token missing required fields');
        return res.status(401).json({ message: 'Token không hợp lệ' });
      }

      // Set user info vào req.user
      req.user = {
        _id: decoded._id,
        role: decoded.role
      };
      
      console.log('User set in request:', req.user);
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

const isAdmin = (req, res, next) => {
  console.log('Checking admin rights:', req.user);
  if (!req.user || req.user.role !== 'admin') {
    console.log('Admin access denied');
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  console.log('Admin access granted');
  next();
};

module.exports = {
  verifyToken,
  isAdmin
};