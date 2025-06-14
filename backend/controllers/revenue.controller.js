const Booking = require('../models/Booking');
const moment = require('moment');

// Hàm helper để nhóm doanh thu theo khoảng thời gian
const groupRevenueByPeriod = (bookings, periodType) => {
  const periods = {};
  
  bookings.forEach(booking => {
    let periodKey;
    const date = moment(booking.booking_date);
    
    switch (periodType) {
      case 'day':
        periodKey = date.format('DD/MM/YYYY');
        break;
      case 'month':
        periodKey = date.format('MM/YYYY');
        break;
      case 'quarter':
        const quarter = Math.floor((date.month() + 3) / 3);
        periodKey = `Q${quarter}/${date.year()}`;
        break;
      default:
        periodKey = date.format('MM/YYYY');
    }
    
    if (!periods[periodKey]) {
      periods[periodKey] = 0;
    }
    periods[periodKey] += booking.total_amount;
  });

  // Chuyển đổi thành mảng và sắp xếp
  return Object.entries(periods).map(([period, revenue]) => ({
    period,
    revenue
  })).sort((a, b) => {
    if (periodType === 'day') {
      return moment(a.period, 'DD/MM/YYYY').valueOf() - moment(b.period, 'DD/MM/YYYY').valueOf();
    } else if (periodType === 'month') {
      return moment(a.period, 'MM/YYYY').valueOf() - moment(b.period, 'MM/YYYY').valueOf();
    } else {
      // Sắp xếp theo quý
      const [quarterA, yearA] = a.period.split('/');
      const [quarterB, yearB] = b.period.split('/');
      const dateA = new Date(parseInt(yearA), (parseInt(quarterA.slice(1)) * 3) - 1);
      const dateB = new Date(parseInt(yearB), (parseInt(quarterB.slice(1)) * 3) - 1);
      return dateA.valueOf() - dateB.valueOf();
    }
  });
};

// Lấy thống kê doanh thu
const getRevenueStats = async (req, res) => {
  try {
    const { periodType = 'month' } = req.query;
    
    // Lấy ngày bắt đầu dựa vào loại khoảng thời gian
    let startDate;
    switch (periodType) {
      case 'day':
        startDate = moment().subtract(30, 'days').startOf('day');
        break;
      case 'month':
        startDate = moment().subtract(12, 'months').startOf('month');
        break;
      case 'quarter':
        startDate = moment().subtract(8, 'quarters').startOf('quarter');
        break;
      default:
        startDate = moment().subtract(12, 'months').startOf('month');
    }
    
    // Query bookings trong khoảng thời gian
    const bookings = await Booking.find({
      booking_date: { $gte: startDate.toDate() },
      payment_status: 'Paid'
    }).sort({ booking_date: 1 });

    // Tính tổng doanh thu
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);
    
    // Tính số lượng booking
    const totalBookings = bookings.length;
    
    // Tính giá trị trung bình mỗi booking
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Tính doanh thu theo loại dịch vụ
    const revenueByService = {
      hotels: bookings.filter(b => b.hotel_id).reduce((sum, b) => sum + b.total_amount, 0),
      flights: bookings.filter(b => b.flight_id).reduce((sum, b) => sum + b.total_amount, 0),
      tours: bookings.filter(b => b.tour_id).reduce((sum, b) => sum + b.total_amount, 0)
    };

    // Tính doanh thu theo khoảng thời gian
    const revenueByPeriod = groupRevenueByPeriod(bookings, periodType);

    res.json({
      totalRevenue,
      totalBookings,
      avgBookingValue,
      revenueByService,
      revenueByPeriod
    });
  } catch (error) {
    console.error('Error in getRevenueStats:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê doanh thu', error: error.message });
  }
};

// Xuất báo cáo doanh thu
const exportRevenueReport = async (req, res) => {
  try {
    const { periodType = 'month' } = req.query;
    
    // Lấy ngày bắt đầu dựa vào loại khoảng thời gian
    let startDate;
    switch (periodType) {
      case 'day':
        startDate = moment().subtract(30, 'days').startOf('day');
        break;
      case 'month':
        startDate = moment().subtract(12, 'months').startOf('month');
        break;
      case 'quarter':
        startDate = moment().subtract(8, 'quarters').startOf('quarter');
        break;
      default:
        startDate = moment().subtract(12, 'months').startOf('month');
    }
    
    // Query bookings trong khoảng thời gian
    const bookings = await Booking.find({
      booking_date: { $gte: startDate.toDate() },
      payment_status: 'Paid'
    })
    .populate('user_id', 'full_name email')
    .sort({ booking_date: -1 });

    // Format data cho file Excel
    const data = bookings.map(booking => ({
      'Mã đơn hàng': booking._id,
      'Khách hàng': booking.user_id?.full_name || 'N/A',
      'Email': booking.user_id?.email || 'N/A',
      'Ngày đặt': moment(booking.booking_date).format('DD/MM/YYYY'),
      'Loại dịch vụ': booking.hotel_id ? 'Khách sạn' : booking.flight_id ? 'Chuyến bay' : 'Tour',
      'Tổng tiền': booking.total_amount,
      'Trạng thái': booking.payment_status
    }));

    // Gửi response với header để download file
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (error) {
    console.error('Error in exportRevenueReport:', error);
    res.status(500).json({ message: 'Lỗi khi xuất báo cáo', error: error.message });
  }
};

module.exports = {
  getRevenueStats,
  exportRevenueReport
}; 