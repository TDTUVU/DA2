export const getOptimizedImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
} = {}) => {
  if (!url || !url.includes('cloudinary')) return url;

  // Tách URL thành các phần
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) return url;

  // Xây dựng transformation string
  const transformations = [
    'q_100', // Chất lượng tối đa
    'f_webp', // Format webp cho chất lượng tốt và dung lượng nhỏ
    'c_fill', // Fill để đảm bảo không bị cắt khuyết
    'g_auto', // Tự động chọn vùng focus
  ];

  // Thêm các tùy chọn từ tham số
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.quality) transformations.push(`q_${options.quality}`);

  // Ghép URL lại với transformations
  return `${urlParts[0]}/upload/${transformations.join(',')}/fl_preserve_transparency/${urlParts[1]}`;
};

// Hàm riêng cho ảnh flight
export const getFlightImageUrl = (url: string) => {
  return getOptimizedImageUrl(url, {
    width: 800,
    height: 600,
    quality: 100
  });
};

// Hàm riêng cho ảnh hotel
export const getHotelImageUrl = (url: string) => {
  return getOptimizedImageUrl(url, {
    width: 1200,
    height: 800,
    quality: 100
  });
};

// Hàm riêng cho ảnh tour
export const getTourImageUrl = (url: string) => {
  return getOptimizedImageUrl(url, {
    width: 1000,
    height: 700,
    quality: 100
  });
};

// Hàm riêng cho ảnh thumbnail
export const getThumbnailUrl = (url: string) => {
  return getOptimizedImageUrl(url, {
    width: 300,
    height: 200,
    quality: 100
  });
}; 