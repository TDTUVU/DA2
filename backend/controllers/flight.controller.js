const Flight = require('../models/Flight');
const mongoose = require('mongoose');
const { uploadToCloudinary } = require('../utils/cloudinary.uploader');

// Lấy danh sách chuyến bay (có phân trang, tìm kiếm và phân quyền)
exports.getAllFlights = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const query = search 
      ? { flight_name: { $regex: search, $options: 'i' } } 
      : {};

    // Chỉ hiển thị các chuyến bay đang hoạt động cho người dùng thông thường
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }

    const total = await Flight.countDocuments(query);
    const flights = await Flight.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.status(200).json({ flights, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách chuyến bay.', error: error.message });
  }
};

// Tạo chuyến bay mẫu để testing
exports.createSampleFlights = async (req, res) => {
  try {
    await Flight.deleteMany({});
    const sampleFlights = [
      {
        flight_name: 'VN123',
        departure: 'Hanoi, Vietnam',
        arrival: 'Ho Chi Minh City, Vietnam',
        departure_time: '2025-04-01T10:00:00',
        arrival_time: '2025-04-01T12:30:00',
        price: 150,
        available_seats: 100,
        airline: 'Vietnam Airlines',
        rating: 4.7,
        images: ['https://i.imgur.com/UQMSkZG.jpeg', 'https://i.imgur.com/1jdkZUy.jpeg']
      }
    ];
    await Flight.insertMany(sampleFlights);
    const flights = await Flight.find({}).lean();
    res.status(201).json({ message: 'Tạo chuyến bay mẫu thành công', flights });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết chuyến bay
exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id).lean();
    if (!flight) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm chuyến bay mới (admin)
exports.createFlight = async (req, res) => {
  try {
    const flightData = req.body;
    const files = req.files;

    let imageUrls = [];
    if (files && files.length > 0) {
        const uploadPromises = files.map(file => uploadToCloudinary(file));
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map(result => result.secure_url);
    }

    const newFlight = new Flight({ 
        ...flightData, 
        images: imageUrls 
    });
    await newFlight.save();
    res.status(201).json(newFlight);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo chuyến bay.', error: error.message });
  }
};

// Cập nhật thông tin chuyến bay (admin)
exports.updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const files = req.files;

    // Xử lý ảnh cũ nếu có
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        updateData.images = existingImages;
      } catch (error) {
        console.error('Error parsing existingImages:', error);
      }
      delete updateData.existingImages;
    }

    // Upload và thêm ảnh mới nếu có
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const uploadResults = await Promise.all(uploadPromises);
      const newImageUrls = uploadResults.map(result => result.secure_url);
      
      // Kết hợp với ảnh cũ nếu có
      updateData.images = updateData.images ? [...updateData.images, ...newImageUrls] : newImageUrls;
    }

    const updatedFlight = await Flight.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedFlight) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
    }

    res.status(200).json(updatedFlight);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật chuyến bay.', error: error.message });
  }
};

// Xóa chuyến bay (admin)
exports.deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
    }
    res.json({ message: 'Xóa chuyến bay thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách chuyến bay theo tuyến đường
exports.getFlightsByRoute = async (req, res) => {
  try {
    const { departure, arrival } = req.params;
    const flights = await Flight.find({
      departure: { $regex: departure, $options: 'i' },
      arrival: { $regex: arrival, $options: 'i' }
    });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách chuyến bay theo hãng hàng không
exports.getFlightsByAirline = async (req, res) => {
  try {
    const { airline } = req.params;
    const flights = await Flight.find({
      airline: { $regex: airline, $options: 'i' }
    });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm vào cuối file, trước module.exports
exports.recreateFlights = async (req, res) => {
  try {
    console.log('Recreating flights collection...');
    
    // Xóa tất cả chuyến bay hiện tại
    await Flight.deleteMany({});
    console.log('All existing flights deleted');
    
    // Tạo mẫu chuyến bay với ID mới
    const sampleFlights = [
      {
        flight_name: 'VN123',
        departure: 'Hanoi, Vietnam',
        arrival: 'Ho Chi Minh City, Vietnam',
        departure_time: new Date('2025-04-01T10:00:00'),
        arrival_time: new Date('2025-04-01T12:30:00'),
        price: 150,
        available_seats: 100,
        airline: 'Vietnam Airlines',
        rating: 4.7,
        images: ['https://i.imgur.com/UQMSkZG.jpeg', 'https://i.imgur.com/1jdkZUy.jpeg']
      },
      {
        flight_name: 'VJ456',
        departure: 'Ho Chi Minh City, Vietnam',
        arrival: 'Da Nang, Vietnam',
        departure_time: new Date('2025-04-05T08:00:00'),
        arrival_time: new Date('2025-04-05T09:30:00'),
        price: 120,
        available_seats: 80,
        airline: 'VietJet Air',
        rating: 4.2,
        images: ['https://i.imgur.com/UQMSkZG.jpeg', 'https://i.imgur.com/1jdkZUy.jpeg']
      }
    ];
    
    // Lưu từng chuyến bay riêng lẻ để đảm bảo trigger pre('save') hoạt động
    for (const flight of sampleFlights) {
      const newFlight = new Flight(flight);
      await newFlight.save();
    }
    
    // Lấy danh sách chuyến bay đã tạo
    const flights = await Flight.find({}).lean();
    
    res.status(201).json({ 
      message: 'Tạo lại dữ liệu chuyến bay thành công', 
      count: flights.length,
      flights: flights.map(f => ({
        id: f._id,
        flight_name: f.flight_name,
        idType: typeof f._id
      }))
    });
  } catch (error) {
    console.error('Error in recreateFlights:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Bật/tắt trạng thái hiển thị của chuyến bay
exports.toggleFlightVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const flight = await Flight.findById(id);
    
    if (!flight) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
    }

    flight.isActive = !flight.isActive;
    await flight.save();

    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái hiển thị.', error: error.message });
  }
};