const Flight = require('../models/Flight');
const mongoose = require('mongoose');

// Lấy danh sách chuyến bay
exports.getAllFlights = async (req, res) => {
  try {
    console.log('Fetching all flights...');
    
    // Tìm kiếm tất cả flights
    const flights = await Flight.find({}).lean();
    console.log('Number of flights found:', flights.length);
    
    // Trả về danh sách
    res.json(flights);
  } catch (error) {
    console.error('Error in getAllFlights:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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
    const flightId = req.params.id;
    console.log('Flight ID received:', flightId);
    
    // Thêm debug để kiểm tra ID có hợp lệ không
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(flightId));
    
    // Lấy tất cả chuyến bay để kiểm tra ID có tồn tại không
    const allFlights = await Flight.find({}).lean();
    console.log('All flight IDs in database:', allFlights.map(f => ({ id: f._id, type: typeof f._id, toString: String(f._id) })));
    
    let flight;
    
    // Phương pháp 1: Tìm trực tiếp bằng ID
    try {
      console.log('Trying findById...');
      flight = await Flight.findById(flightId).lean();
      console.log('findById result:', flight ? 'Found' : 'Not found');
    } catch (err) {
      console.log('Error when finding by ID:', err.message);
    }
    
    // Phương pháp 2: Khớp chính xác _id
    if (!flight) {
      try {
        console.log('Trying findOne with exact _id...');
        flight = await Flight.findOne({ _id: flightId }).lean();
        console.log('findOne result:', flight ? 'Found' : 'Not found');
      } catch (err) {
        console.log('Error when finding by _id with findOne:', err.message);
      }
    }
    
    // Phương pháp 3: Tìm kiếm theo _id dạng string
    if (!flight) {
      try {
        console.log('Trying as string ID...');
        flight = await Flight.findOne({ _id: String(flightId) }).lean();
        console.log('findOne with String(id) result:', flight ? 'Found' : 'Not found');
      } catch (err) {
        console.log('Error when finding by string ID:', err.message);
      }
    }
    
    // Phương pháp 4: Tạo một ObjectID mới và tìm kiếm
    if (!flight) {
      try {
        console.log('Trying with new ObjectId...');
        const objectId = new mongoose.Types.ObjectId(flightId);
        flight = await Flight.findOne({ _id: objectId }).lean();
        console.log('findOne with new ObjectId result:', flight ? 'Found' : 'Not found');
      } catch (err) {
        console.log('Error when finding with new ObjectId:', err.message);
      }
    }
    
    console.log('Flight found:', flight ? 'Yes' : 'No');
    
    if (!flight) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
    }
    
    // Đảm bảo các trường luôn có giá trị
    if (!flight.images || !Array.isArray(flight.images)) {
      flight.images = [];
    }
    
    // Đảm bảo dữ liệu thời gian có định dạng đúng
    if (flight.departure_time && !(flight.departure_time instanceof Date)) {
      flight.departure_time = new Date(flight.departure_time);
    }
    
    if (flight.arrival_time && !(flight.arrival_time instanceof Date)) {
      flight.arrival_time = new Date(flight.arrival_time);
    }
    
    res.json(flight);
  } catch (error) {
    console.error('Error in getFlightById:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm chuyến bay mới (admin)
exports.createFlight = async (req, res) => {
  try {
    console.log('Creating flight with data:', req.body);
    
    // Chuyển đổi chuỗi thời gian thành Date
    const flightData = {
      ...req.body,
      departure_time: new Date(req.body.departure_time),
      arrival_time: new Date(req.body.arrival_time)
    };

    const flight = new Flight(flightData);
    await flight.save();
    
    res.status(201).json({
      message: 'Thêm chuyến bay thành công',
      flight
    });
  } catch (error) {
    console.error('Error in createFlight:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật thông tin chuyến bay (admin)
exports.updateFlight = async (req, res) => {
  try {
    const flightId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(flightId)) {
      return res.status(400).json({ message: 'ID chuyến bay không hợp lệ' });
    }

    // Chuyển đổi chuỗi thời gian thành Date nếu có
    const updateData = { ...req.body };
    if (req.body.departure_time) {
      updateData.departure_time = new Date(req.body.departure_time);
    }
    if (req.body.arrival_time) {
      updateData.arrival_time = new Date(req.body.arrival_time);
    }

    const flight = await Flight.findByIdAndUpdate(
      flightId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!flight) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
    }

    res.json({
      message: 'Cập nhật thông tin chuyến bay thành công',
      flight
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa chuyến bay (admin)
exports.deleteFlight = async (req, res) => {
  try {
    const flightId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(flightId)) {
      return res.status(400).json({ message: 'ID chuyến bay không hợp lệ' });
    }

    const flight = await Flight.findByIdAndDelete(flightId);
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