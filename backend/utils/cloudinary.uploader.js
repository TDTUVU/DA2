const cloudinary = require('../config/cloudinary.config');

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

module.exports = { uploadToCloudinary }; 