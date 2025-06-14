const Tour = require('../models/Tour');
const mongoose = require('mongoose');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.uploader');

// GET /api/tours - Lấy danh sách tour (có phân trang và tìm kiếm)
exports.getAllTours = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const query = search 
      ? { tour_name: { $regex: search, $options: 'i' } } 
      : {};

    // Chỉ hiển thị các tour đang hoạt động cho người dùng thông thường
    // Admin có thể thấy tất cả
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }

    const total = await Tour.countDocuments(query);
    const tours = await Tour.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.status(200).json({ tours, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách tour.', error: error.message });
  }
};

// Tạo tour mẫu để testing
exports.createSampleTours = async (req, res) => {
  try {
    await Tour.deleteMany({});
    const sampleTours = [
      {
        tour_name: 'Hue Heritage Discovery',
        description: 'Discover the imperial city of Hue with visits to the Citadel, royal tombs, and more.',
        price_per_person: 75,
        available_seats: 25,
        duration: '2 Days 1 Night',
        departure_location: 'Da Nang, Vietnam',
        destination: 'Hue, Vietnam',
        departure_time: '2025-04-15T08:00:00',
        rating: 4.5,
        images: ['https://i.imgur.com/UQMSkZG.jpeg', 'https://i.imgur.com/1jdkZUy.jpeg']
      }
    ];
    await Tour.insertMany(sampleTours);
    const tours = await Tour.find({}).lean();
    res.status(201).json({ message: 'Tạo tour mẫu thành công', tours });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/tours/:id - Lấy chi tiết một tour
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).lean();
    if (!tour) {
      return res.status(404).json({ message: 'Không tìm thấy tour.' });
    }
    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: `Lỗi server khi lấy tour ${req.params.id}.`, error: error.message });
  }
};

// POST /api/tours - Tạo tour mới
exports.createTour = async (req, res) => {
    try {
        // Dữ liệu tour được gửi dưới dạng chuỗi JSON trong trường 'data'
        const tourData = JSON.parse(req.body.data);
        const files = req.files;

        let imageUrls = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map(file => uploadToCloudinary(file));
            const uploadResults = await Promise.all(uploadPromises);
            imageUrls = uploadResults.map(result => result.secure_url);
        }

        const newTour = new Tour({ 
            ...tourData, 
            images: imageUrls 
        });
        await newTour.save();
        res.status(201).json(newTour);
    } catch (error) {
        console.error('Create tour error:', error);
        res.status(400).json({ message: 'Lỗi khi tạo tour.', error: error.message });
    }
};

// PATCH /api/tours/:id - Cập nhật tour
exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tourData = JSON.parse(req.body.data);
    const files = req.files;

    let newImageUrls = [];
    if (files && files.length > 0) {
        const uploadPromises = files.map(file => uploadToCloudinary(file));
        const uploadResults = await Promise.all(uploadPromises);
        newImageUrls = uploadResults.map(result => result.secure_url);
    }
    
    // Kết hợp ảnh cũ (nếu có) và ảnh mới
    const finalImages = [...(tourData.images || []), ...newImageUrls];
    const updatePayload = { ...tourData, images: finalImages };
    
    const updatedTour = await Tour.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    
    if (!updatedTour) {
        return res.status(404).json({ message: 'Không tìm thấy tour để cập nhật.' });
    }
    
    res.status(200).json(updatedTour);
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(400).json({ message: 'Lỗi khi cập nhật tour.', error: error.message });
  }
};

// DELETE /api/tours/:id - Xóa tour
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Không tìm thấy tour để xóa.' });
    }
    res.status(200).json({ message: 'Xóa tour thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa tour.', error: error.message });
  }
};

// Lấy danh sách tour theo điểm đến
exports.getToursByDestination = async (req, res) => {
  try {
    const { destination } = req.params;
    const tours = await Tour.find({
      destination: { $regex: destination, $options: 'i' }
    });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách tour theo thời lượng
exports.getToursByDuration = async (req, res) => {
  try {
    const { duration } = req.params;
    const tours = await Tour.find({
      duration: { $regex: duration, $options: 'i' }
    });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết tour
exports.getTourDetails = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); // Tìm tour bằng `_id`
    if (!tour) {
      return res.status(404).json({ message: 'Không tìm thấy tour' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Error in getTourDetails:', error); // Log lỗi chi tiết
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm vào cuối file, trước module.exports
exports.recreateTours = async (req, res) => {
  try {
    console.log('Recreating tours collection...');
    
    // Xóa tất cả tour hiện tại
    await Tour.deleteMany({});
    console.log('All existing tours deleted');
    
    // Tạo mẫu tour với ID mới
    const sampleTours = [
      {
        tour_name: 'Hue Heritage Discovery',
        description: 'Discover the imperial city of Hue with visits to the Citadel, royal tombs, and more.',
        price_per_person: 75,
        available_seats: 25,
        duration: '2 Days 1 Night',
        departure_location: 'Da Nang, Vietnam',
        destination: 'Hue, Vietnam',
        departure_time: '2025-04-15T08:00:00',
        rating: 4.5,
        images: ['https://i.imgur.com/UQMSkZG.jpeg', 'https://i.imgur.com/1jdkZUy.jpeg'],
        itinerary: ['Day 1: Visit Citadel', 'Day 2: Visit royal tombs'],
        inclusions: ['Hotel', 'Meals', 'Guide'],
        exclusions: ['Personal expenses']
      },
      {
        tour_name: 'Halong Bay Cruise',
        description: 'Explore the stunning limestone islands of Halong Bay on a luxury cruise.',
        price_per_person: 120,
        available_seats: 30,
        duration: '3 Days 2 Nights',
        departure_location: 'Hanoi, Vietnam',
        destination: 'Halong Bay, Vietnam',
        departure_time: '2025-05-10T08:00:00',
        rating: 4.8,
        images: ['https://i.imgur.com/UQMSkZG.jpeg', 'https://i.imgur.com/1jdkZUy.jpeg'],
        itinerary: ['Day 1: Board cruise', 'Day 2: Cave exploration', 'Day 3: Return to Hanoi'],
        inclusions: ['Cabin', 'All meals', 'Activities'],
        exclusions: ['Drinks', 'Tips']
      }
    ];
    
    // Lưu từng tour riêng lẻ để đảm bảo trigger pre('save') hoạt động
    for (const tour of sampleTours) {
      const newTour = new Tour(tour);
      await newTour.save();
    }
    
    // Lấy danh sách tour đã tạo
    const tours = await Tour.find({}).lean();
    
    res.status(201).json({ 
      message: 'Tạo lại dữ liệu tour thành công', 
      count: tours.length,
      tours: tours.map(t => ({
        id: t._id,
        name: t.tour_name,
        idType: typeof t._id
      }))
    });
  } catch (error) {
    console.error('Error in recreateTours:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Toggle visibility của tour
exports.toggleTourVisibility = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Không tìm thấy tour.' });
    }

    tour.isActive = !tour.isActive;
    await tour.save();

    res.status(200).json({
      message: `Tour đã được ${tour.isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công.`,
      tour
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi thay đổi trạng thái tour.', error: error.message });
  }
};