const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');

// Lấy danh sách khách sạn
exports.getAllHotels = async (req, res) => {
  try {
    console.log('Fetching all hotels...');
    
    // Tìm kiếm tất cả hotels
    const hotels = await Hotel.find({}).lean();
    console.log('Number of hotels found:', hotels.length);
    
    // Trả về danh sách
    res.json(hotels);
  } catch (error) {
    console.error('Error in getAllHotels:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết khách sạn
exports.getHotelById = async (req, res) => {
  try {
    console.log('Getting hotel details for ID:', req.params.id);
    const hotelId = req.params.id;
    
    // Thêm debug để kiểm tra ID có hợp lệ không
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(hotelId));
    
    // Lấy tất cả khách sạn để kiểm tra ID có tồn tại không
    const allHotels = await Hotel.find({}).lean();
    console.log('All hotel IDs in database:', allHotels.map(h => ({ id: h._id, type: typeof h._id, toString: String(h._id) })));
    
    let hotel;
    
    // Phương pháp 1: Tìm trực tiếp bằng ID
    try {
      console.log('Trying findById...');
      hotel = await Hotel.findById(hotelId).lean();
      console.log('findById result:', hotel ? 'Found' : 'Not found');
    } catch (err) {
      console.log('Error when finding by ID:', err.message);
    }
    
    // Phương pháp 2: Khớp chính xác _id
    if (!hotel) {
      try {
        console.log('Trying findOne with exact _id...');
        hotel = await Hotel.findOne({ _id: hotelId }).lean();
        console.log('findOne result:', hotel ? 'Found' : 'Not found');
      } catch (err) {
        console.log('Error when finding by _id with findOne:', err.message);
      }
    }
    
    // Phương pháp 3: Tìm kiếm theo _id dạng string
    if (!hotel) {
      try {
        console.log('Trying as string ID...');
        hotel = await Hotel.findOne({ _id: String(hotelId) }).lean();
        console.log('findOne with String(id) result:', hotel ? 'Found' : 'Not found');
      } catch (err) {
        console.log('Error when finding by string ID:', err.message);
      }
    }
    
    // Phương pháp 4: Tạo một ObjectID mới và tìm kiếm
    if (!hotel) {
      try {
        console.log('Trying with new ObjectId...');
        const objectId = new mongoose.Types.ObjectId(hotelId);
        hotel = await Hotel.findOne({ _id: objectId }).lean();
        console.log('findOne with new ObjectId result:', hotel ? 'Found' : 'Not found');
      } catch (err) {
        console.log('Error when finding with new ObjectId:', err.message);
      }
    }
    
    console.log('Hotel found:', hotel ? 'Yes' : 'No');
    
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }
    
    // Đảm bảo các trường cần thiết luôn có
    if (!hotel.amenities) hotel.amenities = [];
    if (!hotel.images) hotel.images = [];
    if (!hotel.policies) hotel.policies = [];
    
    res.json(hotel);
  } catch (error) {
    console.error('Error in getHotelById:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm khách sạn mới (admin)
exports.createHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json({
      message: 'Thêm khách sạn thành công',
      hotel
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật thông tin khách sạn (admin)
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    res.json({
      message: 'Cập nhật thông tin khách sạn thành công',
      hotel
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa khách sạn (admin)
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }
    res.json({ message: 'Xóa khách sạn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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