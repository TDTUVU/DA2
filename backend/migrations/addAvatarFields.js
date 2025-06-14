const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function addAvatarFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Thêm trường avatar và avatar_public_id cho tất cả user hiện có
    const result = await User.updateMany(
      { avatar: { $exists: false } }, // Tìm những document chưa có trường avatar
      { 
        $set: { 
          avatar: null,
          avatar_public_id: null
        } 
      }
    );

    console.log(`Đã cập nhật ${result.modifiedCount} user`);
    console.log('Migration hoàn tất');
    process.exit(0);
  } catch (error) {
    console.error('Migration thất bại:', error);
    process.exit(1);
  }
}

addAvatarFields(); 