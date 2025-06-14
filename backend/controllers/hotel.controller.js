const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');
const { uploadToCloudinary } = require('../utils/cloudinary.uploader');

// Lấy danh sách khách sạn (có phân trang, tìm kiếm và phân quyền)
exports.getAllHotels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const query = search 
      ? { name: { $regex: search, $options: 'i' } } 
      : {};

    // Chỉ hiển thị các khách sạn đang hoạt động cho người dùng thông thường
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }

    const total = await Hotel.countDocuments(query);
    const hotels = await Hotel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.status(200).json({ hotels, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách khách sạn.', error: error.message });
  }
};

// Lấy chi tiết khách sạn
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).lean();
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn.' });
    }
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết khách sạn.', error: error.message });
  }
};

// Thêm khách sạn mới (admin)
exports.createHotel = async (req, res) => {
    try {
        const hotelData = req.body;
        const files = req.files;

        let imageUrls = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map(file => uploadToCloudinary(file));
            const uploadResults = await Promise.all(uploadPromises);
            imageUrls = uploadResults.map(result => result.secure_url);
        }

        const newHotel = new Hotel({ 
            ...hotelData, 
            images: imageUrls 
        });
        await newHotel.save();
        res.status(201).json(newHotel);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi tạo khách sạn.', error: error.message });
    }
};

// Cập nhật thông tin khách sạn (admin)
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const files = req.files;

    // Chỉ upload và cập nhật ảnh nếu có file mới
    if (files && files.length > 0) {
        const uploadPromises = files.map(file => uploadToCloudinary(file));
        const uploadResults = await Promise.all(uploadPromises);
        const newImageUrls = uploadResults.map(result => result.secure_url);
        // Thay thế hoàn toàn ảnh cũ bằng ảnh mới
        updateData.images = newImageUrls;
    }
    
    const updatedHotel = await Hotel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!updatedHotel) {
        return res.status(404).json({ message: 'Không tìm thấy khách sạn để cập nhật.' });
    }
    
    res.status(200).json(updatedHotel);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật khách sạn.', error: error.message });
  }
};

// Xóa khách sạn (admin)
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn để xóa.' });
    }
    res.status(200).json({ message: 'Xóa khách sạn thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa khách sạn.', error: error.message });
  }
};

// Lấy danh sách khách sạn theo location
exports.getHotelsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const hotels = await Hotel.find({
      location: { $regex: location, $options: 'i' }
    });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách khách sạn có rating cao
exports.getTopRatedHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ rating: -1 }).limit(10);
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.createSampleHotels = async (req, res) => {
  try {
    await Hotel.deleteMany({});
    const sampleHotels = [
      {
        name: 'Grand Hotel',
        location: 'Hanoi, Vietnam',
        rating: 4.5,
        price_per_night: 100,
        available_rooms: 50,
        amenities: ['Wifi', 'Pool', 'Gym', 'Spa'],
        images: ['https://i.imgur.com/UQMSkZG.jpeg', 'https://i.imgur.com/1jdkZUy.jpeg']
      }
    ];
    await Hotel.insertMany(sampleHotels);
    const hotels = await Hotel.find({}).lean();
    res.status(201).json({ message: 'Tạo khách sạn mẫu thành công', hotels });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.recreateHotels = async (req, res) => {
  try {
    console.log('Recreating hotels collection...');
    
    // Xóa tất cả khách sạn hiện tại
    await Hotel.deleteMany({});
    console.log('All existing hotels deleted');
    
    // Tạo mẫu khách sạn với ID mới
    const sampleHotels = [
      {
        name: 'Grand Hotel Saigon',
        location: 'Ho Chi Minh City, Vietnam',
        rating: 4.5,
        price_per_night: 100,
        available_rooms: 50,
        amenities: ['Wifi', 'Pool', 'Gym', 'Spa'],
        images: ['https://i.imgur.com/UQMSkZG.jpeg', 'https://i.imgur.com/1jdkZUy.jpeg'],
        description: 'Khách sạn sang trọng tại trung tâm thành phố Hồ Chí Minh',
        policies: ['Nhận phòng từ 14:00', 'Trả phòng trước 12:00', 'Không hút thuốc']
      },
      {
        name: 'Hanoi Palace Hotel',
        location: 'Hanoi, Vietnam',
        rating: 4.3,
        price_per_night: 85,
        available_rooms: 40,
        amenities: ['Wifi', 'Breakfast', 'Airport Shuttle'],
        images: ['https://i.imgur.com/UQMSkZG.jpeg', 'https://i.imgur.com/1jdkZUy.jpeg'],
        description: 'Khách sạn thoải mái với vị trí đắc địa tại Hà Nội',
        policies: ['Nhận phòng từ 14:00', 'Trả phòng trước 12:00']
      }
    ];
    
    // Lưu từng khách sạn riêng lẻ để đảm bảo trigger pre('save') hoạt động
    for (const hotel of sampleHotels) {
      const newHotel = new Hotel(hotel);
      await newHotel.save();
    }
    
    // Lấy danh sách khách sạn đã tạo
    const hotels = await Hotel.find({}).lean();
    
    res.status(201).json({ 
      message: 'Tạo lại dữ liệu khách sạn thành công', 
      count: hotels.length,
      hotels: hotels.map(h => ({
        id: h._id,
        name: h.name,
        idType: typeof h._id
      }))
    });
  } catch (error) {
    console.error('Error in recreateHotels:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Bật/tắt trạng thái hiển thị của khách sạn
exports.toggleHotelVisibility = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn.' });
    }

    hotel.isActive = !hotel.isActive;
    await hotel.save();

    res.status(200).json({
      message: `Khách sạn đã được ${hotel.isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công.`,
      hotel
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi thay đổi trạng thái khách sạn.', error: error.message });
  }
}; 