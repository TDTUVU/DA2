const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'Email đã được sử dụng' 
          : 'Tên đăng nhập đã được sử dụng'
      });
    }

    // Tạo user mới
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    res.status(201).json({
      message: 'Đăng ký thành công'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      message: 'Đã có lỗi xảy ra khi đăng ký'
    });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Email hoặc mật khẩu không chính xác'
      });
    }

    // Kiểm tra password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Email hoặc mật khẩu không chính xác'
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = generateRefreshToken(user);
    // Lưu refresh token vào cookie HTTPOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Đã có lỗi xảy ra khi đăng nhập'
    });
  }
};

// Tạo admin
const createAdmin = async (req, res) => {
  try {
    const { username, email, password, adminSecret } = req.body;

    // Kiểm tra admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        message: 'Không có quyền tạo tài khoản admin'
      });
    }

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'Email đã được sử dụng' 
          : 'Tên đăng nhập đã được sử dụng'
      });
    }

    // Tạo admin mới
    const admin = new User({
      username,
      email,
      password,
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({
      message: 'Tạo tài khoản admin thành công'
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      message: 'Đã có lỗi xảy ra khi tạo tài khoản admin'
    });
  }
};

// Lấy thông tin người dùng hiện tại
const getCurrentUser = async (req, res) => {
  try {
    // req.user được set bởi authMiddleware.verifyToken
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm hàm sinh refresh token
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}

// Thêm hàm refreshToken
const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Không có refresh token' });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token: accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = {
  register,
  login,
  createAdmin,
  getCurrentUser,
  refreshToken
};