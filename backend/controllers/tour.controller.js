const Tour = require('../models/Tour');
const mongoose = require('mongoose');

// Lấy danh sách tour
exports.getAllTours = async (req, res) => {
  try {
    console.log('Fetching all tours...');
    
    // Tìm kiếm tất cả tours
    const tours = await Tour.find({}).lean();
    console.log('Number of tours found:', tours.length);
    
    // Trả về danh sách
    res.json(tours);
  } catch (error) {
    console.error('Error in getAllTours:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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

// Lấy chi tiết tour
exports.getTourById = async (req, res) => {
  try {
    console.log('Getting tour details for ID:', req.params.id);
    const tourId = req.params.id;
    
    // Thêm debug để kiểm tra ID có hợp lệ không
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(tourId));
    
    // Lấy tất cả tour để kiểm tra ID có tồn tại không
    const allTours = await Tour.find({}).lean();
    console.log('All tour IDs in database:', allTours.map(t => ({ id: t._id, type: typeof t._id, toString: String(t._id) })));
    
    let tour;
    
    // Phương pháp 1: Tìm trực tiếp bằng ID
    try {
      console.log('Trying findById...');
      tour = await Tour.findById(tourId).lean();
      console.log('findById result:', tour ? 'Found' : 'Not found');
    } catch (err) {
      console.log('Error when finding by ID:', err.message);
    }
    
    // Phương pháp 2: Khớp chính xác _id
    if (!tour) {
      try {
        console.log('Trying findOne with exact _id...');
        tour = await Tour.findOne({ _id: tourId }).lean();
        console.log('findOne result:', tour ? 'Found' : 'Not found');
      } catch (err) {
        console.log('Error when finding by _id with findOne:', err.message);
      }
    }
    
    // Phương pháp 3: Tìm kiếm theo _id dạng string
    if (!tour) {
      try {
        console.log('Trying as string ID...');
        tour = await Tour.findOne({ _id: String(tourId) }).lean();
        console.log('findOne with String(id) result:', tour ? 'Found' : 'Not found');
      } catch (err) {
        console.log('Error when finding by string ID:', err.message);
      }
    }
    
    // Phương pháp 4: Tạo một ObjectID mới và tìm kiếm
    if (!tour) {
      try {
        console.log('Trying with new ObjectId...');
        const objectId = new mongoose.Types.ObjectId(tourId);
        tour = await Tour.findOne({ _id: objectId }).lean();
        console.log('findOne with new ObjectId result:', tour ? 'Found' : 'Not found');
      } catch (err) {
        console.log('Error when finding with new ObjectId:', err.message);
      }
    }
    
    console.log('Tour found:', tour ? 'Yes' : 'No');
    
    if (!tour) {
      return res.status(404).json({ message: 'Không tìm thấy tour' });
    }
    
    // Đảm bảo các trường cần thiết luôn có
    if (!tour.itinerary) tour.itinerary = [];
    if (!tour.inclusions) tour.inclusions = [];
    if (!tour.exclusions) tour.exclusions = [];
    if (!tour.images) tour.images = [];
    if (!tour.policies) tour.policies = [];
    if (!tour.highlights) tour.highlights = [];
    if (!tour.requirements) tour.requirements = [];
    
    res.json(tour);
  } catch (error) {
    console.error('Error in getTourById:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm tour mới (admin)
exports.createTour = async (req, res) => {
  try {
    const tour = new Tour(req.body);
    await tour.save();
    res.status(201).json({
      message: 'Thêm tour thành công',
      tour
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật thông tin tour (admin)
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!tour) {
      return res.status(404).json({ message: 'Không tìm thấy tour' });
    }

    res.json({
      message: 'Cập nhật thông tin tour thành công',
      tour
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa tour (admin)
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Không tìm thấy tour' });
    }
    res.json({ message: 'Xóa tour thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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