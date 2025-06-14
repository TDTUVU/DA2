const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Lấy thông tin profile của user
exports.getProfile = async (req, res) => {
  try {
    console.log('User ID from Token:', req.user.id); // Log ID từ token
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in getProfile:', error); // Log lỗi chi tiết
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin profile
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone_number, address } = req.body;
    let updateData = { full_name, phone_number, address };

    // Xử lý upload ảnh nếu có
    if (req.file) {
      updateData.images = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id, // Lấy user ID từ req.user
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in updateProfile:', error); // Log lỗi chi tiết
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thông tin user
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật thông tin user
exports.updateUserProfile = async (req, res) => {
  try {
    const { full_name, phone_number, address, images } = req.body;
    const updateData = { full_name, phone_number, address, images };

    // Nếu có cập nhật mật khẩu
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật thông tin thành công',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa tài khoản
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ message: 'Xóa tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách booking của user
exports.getUserBookings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('bookings.hotel_id', 'name location price_per_night')
      .populate('bookings.flight_id', 'flight_name departure arrival price')
      .populate('bookings.tour_id', 'tour_name price_per_person');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user.bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách tất cả users (chỉ admin)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    let query = {};
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng.', error: error.message });
  }
};

// Xóa user bởi admin
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    const adminUserId = req.user.id;

    if (userIdToDelete === adminUserId) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của mình.' });
    }

    const user = await User.findByIdAndDelete(userIdToDelete);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa.' });
    }
    res.status(200).json({ message: 'Xóa người dùng thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa người dùng.', error: error.message });
  }
};

// Cập nhật role user (chỉ admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật role thành công',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật thông tin user bởi admin
exports.updateUserByAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const { full_name, email, phone_number, address } = req.body;

    // Kiểm tra xem user cần update có tồn tại không
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra email đã tồn tại chưa (nếu email được cập nhật)
    if (email && email !== userToUpdate.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
    }

    // Tạo object chứa các trường cần update
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;
    if (phone_number) updateData.phone_number = phone_number;
    if (address) updateData.address = address;

    // Cập nhật thông tin user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Cập nhật thông tin người dùng thành công',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in updateUserByAdmin:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật thông tin người dùng',
      error: error.message 
    });
  }
};