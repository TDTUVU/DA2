const cloudinary = require('../config/cloudinary.config');

exports.uploadBase64 = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Không có dữ liệu ảnh base64' });
    }

    // Upload ảnh lên Cloudinary với các tùy chọn tối ưu
    const result = await cloudinary.uploader.upload(image, {
      resource_type: 'auto',
      quality: 100,
      fetch_format: 'auto',
      flags: 'preserve_transparency',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto:best', fetch_format: 'auto' }
      ]
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

exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            quality: 100,
            fetch_format: 'auto',
            flags: 'preserve_transparency',
            transformation: [
              { width: 1920, height: 1080, crop: 'limit' },
              { quality: 'auto:best', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );

        stream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    
    res.status(200).json({
      message: 'Tải ảnh lên thành công',
      urls: results.map(result => result.secure_url),
      public_ids: results.map(result => result.public_id)
    });
  } catch (error) {
    console.error('Lỗi khi tải nhiều ảnh:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 