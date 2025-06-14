const cloudinary = require('../config/cloudinary.config');

exports.uploadBase64 = async (req, res) => {
  try {
    const { image } = req.body; // Mong đợi một chuỗi data URI base64

    if (!image) {
      return res.status(400).json({ message: 'Không có dữ liệu ảnh base64' });
    }

    // Phương thức upload của Cloudinary có thể xử lý trực tiếp data URI
    const result = await cloudinary.uploader.upload(image, {
      resource_type: 'auto',
    });

    res.status(200).json({
      message: 'Tải ảnh lên thành công',
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Lỗi khi tải ảnh base64:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 