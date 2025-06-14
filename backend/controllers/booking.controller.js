const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Flight = require('../models/Flight');
const Tour = require('../models/Tour');
const moment = require('moment');

// Hàm tiện ích để lấy số ngày từ chuỗi duration
function getDaysFromDurationString(durationStr) {
  if (!durationStr) return 0;
  const match = durationStr.match(/(\d+)\s*Day/i);
  return match && match[1] ? parseInt(match[1], 10) : 0;
}

// Hàm tiện ích để định dạng chuỗi duration từ ngày bắt đầu và kết thúc
function formatDurationText(start, end) {
  const diffDays = moment(end).diff(moment(start), 'days');
  if (diffDays <= 0) return 'Invalid period'; // Hoặc có thể dựa vào số đêm để chính xác hơn
  
  // Logic tính số đêm có thể cần điều chỉnh tùy theo cách định nghĩa tour (ví dụ, tour 1 ngày có 0 đêm)
  // Giả sử tour N ngày thì có N-1 đêm nếu N > 0
  const nights = diffDays > 0 ? diffDays -1 : 0; // Cần xem xét lại logic tính số đêm cho chính xác
  
  let durationText = `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
  if (nights > 0) {
    durationText += ` ${nights} Night${nights > 1 ? 's' : ''}`;
  } else if (diffDays === 1) {
    // Nếu tour 1 ngày, có thể không cần ghi "0 Nights"
    // durationText += ' (0 Nights)'; // Tùy chọn
  }
  return durationText;
}

// Tạo booking mới
exports.createBooking = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('User Info:', req.user);

    const { hotel_id, flight_id, tour_id, check_in, check_out } = req.body;
    const user_id = req.user?._id; // Thay đổi từ id thành _id

    if (!user_id) {
      return res.status(400).json({ message: 'User ID không được để trống' });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    let total_amount = 0;
    let booking_check_in = req.body.check_in ? new Date(req.body.check_in) : null;
    let booking_check_out = req.body.check_out ? new Date(req.body.check_out) : null;
    let booking_duration_display = null;

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
      // Với hotel, check_in và check_out do người dùng cung cấp
      booking_check_in = new Date(check_in);
      booking_check_out = new Date(check_out);
      // Tính duration_display cho hotel nếu muốn
      // booking_duration_display = formatDurationText(booking_check_in, booking_check_out);
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

      // Xử lý check_in, check_out và duration_display cho tour
      if (tour.departure_time && tour.duration) {
        const check_in_moment = moment(tour.departure_time);
        const numberOfDays = getDaysFromDurationString(tour.duration);

        if (numberOfDays > 0) {
          const check_out_moment = check_in_moment.clone().add(numberOfDays, 'days');
          booking_check_in = check_in_moment.toDate();
          booking_check_out = check_out_moment.toDate();
          booking_duration_display = formatDurationText(booking_check_in, booking_check_out);
        } else {
          // Nếu không phân tích được duration, có thể đặt check_in từ tour và check_out là null hoặc báo lỗi
          booking_check_in = moment(tour.departure_time).toDate();
          // booking_check_out sẽ là null (theo khai báo ban đầu)
          // booking_duration_display sẽ là null
          console.warn(`Không thể phân tích duration cho tour: ${tour_id}. Duration: ${tour.duration}`);
        }
      } else {
        console.warn(`Tour ${tour_id} thiếu departure_time hoặc duration.`);
        // booking_check_in, booking_check_out, booking_duration_display sẽ là null
      }
    }

    const booking = new Booking({
      user_id, // Đảm bảo user_id được lưu đúng
      hotel_id,
      flight_id,
      tour_id,
      check_in: booking_check_in,
      check_out: booking_check_out,
      duration_display: booking_duration_display,
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
    console.error('Error in createBooking:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách booking của user
exports.getUserBookings = async (req, res) => {
  try {
    const user_id = req.user?._id; // Thay đổi từ id thành _id

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
    console.error('Error in getUserBookings:', error);
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
    if (booking.user_id.toString() !== req.user._id && req.user.role !== 'admin') {
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
    console.error('Error in getBookingDetails:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật trạng thái booking (Admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra ID có đúng định dạng MongoDB ObjectId không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID booking không hợp lệ' });
    }

    // Kiểm tra status hợp lệ
    const validStatuses = ['Pending', 'Paid', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Trạng thái không hợp lệ',
        validStatuses 
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    // Cập nhật trạng thái
    booking.payment_status = status;
    await booking.save();

    // Trả về booking đã được populate
    const updatedBooking = await Booking.findById(id)
      .populate('user_id', 'full_name email');

    // Populate thông tin dịch vụ
    const bookingObj = updatedBooking.toObject();

    if (booking.hotel_id) {
      try {
        const hotel = await Hotel.findById(booking.hotel_id);
        if (hotel) {
          bookingObj.hotel_id = hotel;
        }
      } catch (err) {
        console.error(`Error populating hotel ${booking.hotel_id}:`, err);
      }
    }

    if (booking.flight_id) {
      try {
        const flight = await Flight.findById(booking.flight_id);
        if (flight) {
          bookingObj.flight_id = flight;
        }
      } catch (err) {
        console.error(`Error populating flight ${booking.flight_id}:`, err);
      }
    }

    if (booking.tour_id) {
      try {
        const tour = await Tour.findById(booking.tour_id);
        if (tour) {
          bookingObj.tour_id = tour;
        }
      } catch (err) {
        console.error(`Error populating tour ${booking.tour_id}:`, err);
      }
    }

    res.json({
      message: 'Cập nhật trạng thái thành công',
      booking: bookingObj
    });
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
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
    const requestUserId = req.user._id;
    
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

// Lấy tất cả booking (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    console.log('Getting all bookings for admin');
    console.log('User from request:', req.user);

    // Lấy tất cả bookings không populate
    const bookings = await Booking.find({})
      .populate('user_id', 'full_name email')
      .sort({ booking_date: -1 });

    // Xử lý từng booking để populate thông tin dịch vụ
    const populatedBookings = await Promise.all(bookings.map(async (booking) => {
      const bookingObj = booking.toObject();

      // Populate hotel_id
      if (booking.hotel_id) {
        try {
          if (mongoose.Types.ObjectId.isValid(booking.hotel_id)) {
            const hotel = await Hotel.findById(booking.hotel_id);
            if (hotel) {
              bookingObj.hotel_id = hotel;
            }
          } else {
            // Nếu hotel_id là string, tạo object giả
            bookingObj.hotel_id = {
              _id: booking.hotel_id,
              name: `Hotel ${booking.hotel_id}`,
              location: 'Unknown',
              price_per_night: booking.total_amount
            };
          }
        } catch (err) {
          console.error(`Error populating hotel ${booking.hotel_id}:`, err);
        }
      }

      // Populate flight_id
      if (booking.flight_id) {
        try {
          if (mongoose.Types.ObjectId.isValid(booking.flight_id)) {
            const flight = await Flight.findById(booking.flight_id);
            if (flight) {
              bookingObj.flight_id = flight;
            }
          } else {
            bookingObj.flight_id = {
              _id: booking.flight_id,
              flight_name: `Flight ${booking.flight_id}`,
              departure: 'Unknown',
              arrival: 'Unknown',
              price: booking.total_amount
            };
          }
        } catch (err) {
          console.error(`Error populating flight ${booking.flight_id}:`, err);
        }
      }

      // Populate tour_id
      if (booking.tour_id) {
        try {
          if (mongoose.Types.ObjectId.isValid(booking.tour_id)) {
            const tour = await Tour.findById(booking.tour_id);
            if (tour) {
              bookingObj.tour_id = tour;
            }
          } else {
            bookingObj.tour_id = {
              _id: booking.tour_id,
              tour_name: `Tour ${booking.tour_id}`,
              location: 'Unknown',
              price_per_person: booking.total_amount
            };
          }
        } catch (err) {
          console.error(`Error populating tour ${booking.tour_id}:`, err);
        }
      }

      return bookingObj;
    }));

    console.log(`Found ${populatedBookings.length} bookings`);
    res.json(populatedBookings);
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Hàm mới để đánh dấu booking đã thanh toán
exports.markBookingAsPaid = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Kiểm tra ID có đúng định dạng MongoDB ObjectId không
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'ID booking không hợp lệ' });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    // Kiểm tra quyền: chỉ chủ booking hoặc admin mới có thể thực hiện (ví dụ)
    // Hoặc có thể không cần kiểm tra quyền quá chặt ở đây nếu đây là bước cuối của luồng thanh toán thẻ
    // if (booking.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Bạn không có quyền cập nhật booking này' });
    // }

    if (booking.payment_status === 'paid') {
      return res.status(400).json({ message: 'Booking này đã được thanh toán trước đó.', booking });
    }

    if (booking.payment_status === 'cancelled') {
      return res.status(400).json({ message: 'Không thể thanh toán cho booking đã bị hủy.' });
    }

    // Cập nhật trạng thái
    booking.payment_status = 'Paid';
    await booking.save();

    res.status(200).json({
      message: 'Đã cập nhật trạng thái booking thành Paid thành công.',
      booking
    });

  } catch (error) {
    console.error('Error in markBookingAsPaid:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái booking', error: error.message });
  }
};

module.exports = {
  createBooking: exports.createBooking,
  getUserBookings: exports.getUserBookings,
  getBookingDetails: exports.getBookingDetails,
  updateBookingStatus: exports.updateBookingStatus,
  cancelBooking: exports.cancelBooking,
  getAllBookings: exports.getAllBookings,
  markBookingAsPaid: exports.markBookingAsPaid,
};