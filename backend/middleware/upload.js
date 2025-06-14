const multer = require('multer');

// Cấu hình multer để lưu file vào bộ nhớ
const storage = multer.memoryStorage();

// Middleware upload, cho phép upload 1 file có tên là 'image'
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn kích thước file là 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép tải lên file hình ảnh!'), false);
    }
  }
});

module.exports = upload; 