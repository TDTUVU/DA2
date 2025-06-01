const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Flight = require('../models/Flight');
const Tour = require('../models/Tour');

// Tạo booking mới
exports.createBooking = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log để kiểm tra request body
    console.log('User Info:', req.user); // Log để kiểm tra thông tin user từ token

    const { hotel_id, flight_id, tour_id, check_in, check_out } = req.body;
    const user_id = req.user?.id; // Lấy user_id từ req.user

    if (!user_id) {
      return res.status(400).json({ message: 'User ID không được để trống' });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    let total_amount = 0;

    // Kiểm tra dữ liệu đầu vào cho từng loại booking
    if (hotel_id) {
      if (!check_in || !check_out) {
        return res.status(400).json({ message: 'Thiếu ngày check-in hoặc check-out cho booking khách sạn' });
      }
      const hotel = await Hotel.findOne({ _id: hotel_id });
      if (!hotel) {
        return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
      }
      const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));
      total_amount += hotel.price_per_night * nights;
    }

    if (flight_id) {
      const flight = await Flight.findById(flight_id);
      if (!flight) {
        return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
      }
      total_amount += flight.price;
    }

    if (tour_id) {
      const tour = await Tour.findById(tour_id);
      if (!tour) {
        return res.status(404).json({ message: 'Không tìm thấy tour' });
      }
      total_amount += tour.price_per_person;
    }

    const booking = new Booking({
      user_id, // Đảm bảo user_id được lưu đúng
      hotel_id,
      flight_id,
      tour_id,
      check_in,
      check_out,
      total_amount,
      booking_date: new Date(),
      payment_status: 'Pending'
    });

    await booking.save();
    res.status(201).json({
      message: 'Tạo booking thành công',
      booking
    });
  } catch (error) {
    console.error('Error in createBooking:', error); // Log lỗi chi tiết
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách booking của user
exports.getUserBookings = async (req, res) => {
  try {
    const user_id = req.user?.id; // Lấy user_id từ req.user

    if (!user_id) {
      return res.status(400).json({ message: 'User ID không được để trống' });
    }

    // Lấy booking của user nhưng không populate ngay
    const bookings = await Booking.find({ user_id });
    
    // Mảng kết quả cuối cùng
    const result = [];
    
    // Xử lý từng booking để lấy thông tin liên quan
    for (const booking of bookings) {
      const bookingObject = booking.toObject();
      
      // Xử lý hotel_id nếu có
      if (booking.hotel_id) {
        try {
          let hotel;
          // Kiểm tra xem hotel_id có phải là ObjectId hay không
          if (mongoose.Types.ObjectId.isValid(booking.hotel_id)) {
            hotel = await Hotel.findById(booking.hotel_id);
          } else {
            // Nếu là string, tạo một đối tượng thông tin cơ bản
            hotel = {
              _id: booking.hotel_id,
              name: `Hotel ${booking.hotel_id}`,
              location: 'Unknown',
              price_per_night: booking.total_amount
            };
          }
          
          if (hotel) {
            bookingObject.hotel_id = hotel;
          }
        } catch (err) {
          console.error(`Error populating hotel ${booking.hotel_id}:`, err);
        }
      }
      
      // Xử lý flight_id nếu có
      if (booking.flight_id) {
        try {
          let flight;
          if (mongoose.Types.ObjectId.isValid(booking.flight_id)) {
            flight = await Flight.findById(booking.flight_id);
          } else {
            flight = {
              _id: booking.flight_id,
              flight_name: `Flight ${booking.flight_id}`,
              departure: 'Unknown',
              arrival: 'Unknown',
              price: booking.total_amount
            };
          }
          
          if (flight) {
            bookingObject.flight_id = flight;
          }
        } catch (err) {
          console.error(`Error populating flight ${booking.flight_id}:`, err);
        }
      }
      
      // Xử lý tour_id nếu có
      if (booking.tour_id) {
        try {
          let tour;
          if (mongoose.Types.ObjectId.isValid(booking.tour_id)) {
            tour = await Tour.findById(booking.tour_id);
          } else {
            tour = {
              _id: booking.tour_id,
              tour_name: `Tour ${booking.tour_id}`,
              price_per_person: booking.total_amount
            };
          }
          
          if (tour) {
            bookingObject.tour_id = tour;
          }
        } catch (err) {
          console.error(`Error populating tour ${booking.tour_id}:`, err);
        }
      }
      
      result.push(bookingObject);
    }

    res.json(result);
  } catch (error) {
    console.error('Error in getUserBookings:', error); // Log lỗi chi tiết
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết booking
exports.getBookingDetails = async (req, res) => {
  try {
    // Tìm booking theo ID
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    // Kiểm tra quyền truy cập
    if (booking.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }
    
    // Convert booking thành object để thêm thông tin
    const bookingObject = booking.toObject();
    
    // Xử lý hotel_id nếu có
    if (booking.hotel_id) {
      try {
        let hotel;
        // Kiểm tra xem hotel_id có phải là ObjectId hay không
        if (mongoose.Types.ObjectId.isValid(booking.hotel_id)) {
          hotel = await Hotel.findById(booking.hotel_id);
        } else {
          // Nếu là string, tạo một đối tượng thông tin cơ bản
          hotel = {
            _id: booking.hotel_id,
            name: `Hotel ${booking.hotel_id}`,
            location: 'Unknown',
            price_per_night: booking.total_amount,
            images: ['https://via.placeholder.com/400x200?text=Hotel+Image'],
            amenities: ['Wi-Fi', 'Parking', 'Breakfast']
          };
        }
        
        if (hotel) {
          bookingObject.hotel_id = hotel;
        }
      } catch (err) {
        console.error(`Error populating hotel ${booking.hotel_id}:`, err);
      }
    }
    
    // Xử lý flight_id nếu có
    if (booking.flight_id) {
      try {
        let flight;
        if (mongoose.Types.ObjectId.isValid(booking.flight_id)) {
          flight = await Flight.findById(booking.flight_id);
        } else {
          flight = {
            _id: booking.flight_id,
            flight_name: `Flight ${booking.flight_id}`,
            departure: 'Unknown',
            arrival: 'Unknown',
            departure_time: new Date(),
            arrival_time: new Date(),
            price: booking.total_amount
          };
        }
        
        if (flight) {
          bookingObject.flight_id = flight;
        }
      } catch (err) {
        console.error(`Error populating flight ${booking.flight_id}:`, err);
      }
    }
    
    // Xử lý tour_id nếu có
    if (booking.tour_id) {
      try {
        let tour;
        if (mongoose.Types.ObjectId.isValid(booking.tour_id)) {
          tour = await Tour.findById(booking.tour_id);
        } else {
          tour = {
            _id: booking.tour_id,
            tour_name: `Tour ${booking.tour_id}`,
            location: 'Unknown',
            description: 'Tour information not available',
            duration: '1-2 days',
            images: ['https://via.placeholder.com/400x200?text=Tour+Image'],
            price_per_person: booking.total_amount
          };
        }
        
        if (tour) {
          bookingObject.tour_id = tour;
        }
      } catch (err) {
        console.error(`Error populating tour ${booking.tour_id}:`, err);
      }
    }
    
    res.json(bookingObject);
  } catch (error) {
    console.error('Error in getBookingDetails:', error); // Log lỗi chi tiết
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật trạng thái booking (admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { payment_status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    res.json({
      message: 'Cập nhật trạng thái booking thành công',
      booking
    });
  } catch (error) {
    console.error('Error in updateBookingStatus:', error); // Log lỗi chi tiết
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Hủy booking
exports.cancelBooking = async (req, res) => {
  try {
    console.log('==== Cancel Booking Request ====');
    console.log('Booking ID:', req.params.id);
    console.log('User from token:', JSON.stringify(req.user));

    // Kiểm tra ID có đúng định dạng MongoDB ObjectId không
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid booking ID format');
      return res.status(400).json({ message: 'ID booking không hợp lệ' });
    }

    const booking = await Booking.findById(req.params.id);

    console.log('Booking found:', booking ? 'Yes' : 'No');
    
    if (!booking) {
      console.log('Booking not found, sending 404');
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    console.log('Booking data:', {
      id: booking._id,
      user_id: booking.user_id,
      hotel_id: booking.hotel_id,
      payment_status: booking.payment_status
    });

    console.log('Booking user ID (raw):', booking.user_id);
    console.log('Booking user ID type:', typeof booking.user_id);
    console.log('Is booking.user_id an ObjectId?', booking.user_id instanceof mongoose.Types.ObjectId);
    
    const bookingUserId = booking.user_id.toString();
    const requestUserId = req.user.id;
    
    console.log('Booking user ID (string):', bookingUserId);
    console.log('User ID from token (string):', requestUserId);
    console.log('User role:', req.user.role);
    console.log('IDs match:', bookingUserId === requestUserId);

    // Kiểm tra quyền truy cập
    if (bookingUserId !== requestUserId && req.user.role !== 'admin') {
      console.log('Permission denied, sending 403');
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    // Chỉ cho phép hủy booking chưa thanh toán
    if (booking.payment_status === 'Paid') {
      console.log('Cannot cancel paid booking, sending 400');
      return res.status(400).json({ message: 'Không thể hủy booking đã thanh toán' });
    }

    console.log('Current booking status:', booking.payment_status);
    console.log('Changing status to Cancelled');
    
    booking.payment_status = 'Cancelled';
    try {
      await booking.save();
      console.log('Booking cancelled successfully');
    } catch (saveError) {
      console.error('Error saving booking:', saveError);
      throw new Error(`Lỗi khi lưu booking: ${saveError.message}`);
    }

    res.json({ message: 'Hủy booking thành công' });
  } catch (error) {
    console.error('Error in cancelBooking:', error); // Log lỗi chi tiết
    res.status(500).json({ message: `Lỗi server: ${error.message}` });
  }
};

// Lấy danh sách tất cả bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    // Lấy tất cả booking nhưng không populate ngay
    const bookings = await Booking.find();
    
    // Mảng kết quả cuối cùng
    const result = [];
    
    // Xử lý từng booking
    for (const booking of bookings) {
      const bookingObject = booking.toObject();
      
      // Xử lý user_id
      if (booking.user_id) {
        try {
          const user = await mongoose.model('User').findById(booking.user_id).select('username email');
          if (user) {
            bookingObject.user_id = user;
          }
        } catch (err) {
          console.error(`Error populating user ${booking.user_id}:`, err);
        }
      }
      
      // Xử lý hotel_id
      if (booking.hotel_id) {
        try {
          let hotel;
          if (mongoose.Types.ObjectId.isValid(booking.hotel_id)) {
            hotel = await Hotel.findById(booking.hotel_id).select('name location price_per_night');
          } else {
            hotel = {
              _id: booking.hotel_id,
              name: `Hotel ${booking.hotel_id}`,
              location: 'Unknown',
              price_per_night: booking.total_amount
            };
          }
          
          if (hotel) {
            bookingObject.hotel_id = hotel;
          }
        } catch (err) {
          console.error(`Error populating hotel ${booking.hotel_id}:`, err);
        }
      }
      
      // Xử lý flight_id
      if (booking.flight_id) {
        try {
          let flight;
          if (mongoose.Types.ObjectId.isValid(booking.flight_id)) {
            flight = await Flight.findById(booking.flight_id).select('flight_name departure arrival price');
          } else {
            flight = {
              _id: booking.flight_id,
              flight_name: `Flight ${booking.flight_id}`,
              departure: 'Unknown',
              arrival: 'Unknown',
              price: booking.total_amount
            };
          }
          
          if (flight) {
            bookingObject.flight_id = flight;
          }
        } catch (err) {
          console.error(`Error populating flight ${booking.flight_id}:`, err);
        }
      }
      
      // Xử lý tour_id
      if (booking.tour_id) {
        try {
          let tour;
          if (mongoose.Types.ObjectId.isValid(booking.tour_id)) {
            tour = await Tour.findById(booking.tour_id).select('tour_name price_per_person');
          } else {
            tour = {
              _id: booking.tour_id,
              tour_name: `Tour ${booking.tour_id}`,
              price_per_person: booking.total_amount
            };
          }
          
          if (tour) {
            bookingObject.tour_id = tour;
          }
        } catch (err) {
          console.error(`Error populating tour ${booking.tour_id}:`, err);
        }
      }
      
      result.push(bookingObject);
    }

    res.json(result);
  } catch (error) {
    console.error('Error in getAllBookings:', error); // Log lỗi chi tiết
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  createBooking: exports.createBooking,
  getUserBookings: exports.getUserBookings,
  getBookingDetails: exports.getBookingDetails,
  updateBookingStatus: exports.updateBookingStatus,
  cancelBooking: exports.cancelBooking,
  getAllBookings: exports.getAllBookings,
};