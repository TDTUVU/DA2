const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Điều chỉnh đường dẫn nếu cần
const dotenv = require('dotenv');

dotenv.config(); // Tải các biến môi trường từ .env

// --- THÔNG TIN ADMIN CẦN TẠO ---
const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'adminpassword';
// ---------------------------------

const MONGODB_URI = process.env.MONGODB_URI;

const createAdminAccount = async () => {
  if (!MONGODB_URI) {
    console.error('Lỗi: Vui lòng cung cấp MONGODB_URI trong tệp .env');
    process.exit(1);
  }

  try {
    console.log('Đang kết nối tới MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Kết nối MongoDB thành công.');

    // 1. Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ $or: [{ email: ADMIN_EMAIL }, { username: ADMIN_USERNAME }] });
    if (existingAdmin) {
      console.log(`Tài khoản admin với email ${ADMIN_EMAIL} hoặc username ${ADMIN_USERNAME} đã tồn tại.`);
      return;
    }

    // 2. Tạo tài khoản admin mới
    console.log('Đang tạo tài khoản admin...');
    const adminUser = new User({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // Mật khẩu sẽ được hash tự động bởi middleware trong User model
      role: 'admin',
      full_name: 'Administrator', // Có thể thay đổi
    });

    await adminUser.save();
    console.log('Tạo tài khoản admin thành công!');
    console.log(`   - Tên đăng nhập: ${ADMIN_USERNAME}`);
    console.log(`   - Email: ${ADMIN_EMAIL}`);
    console.log(`   - Mật khẩu: ${ADMIN_PASSWORD}`);

  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
  } finally {
    // 3. Đóng kết nối
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối khỏi MongoDB.');
  }
};

createAdminAccount(); 