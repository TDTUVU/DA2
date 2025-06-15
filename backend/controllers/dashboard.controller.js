const Payment = require('../models/Payment');
const moment = require('moment');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Message = require('../models/Message');

exports.getRevenueStats = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const last7Days = moment().subtract(6, 'days').startOf('day');
    const last30Days = moment().subtract(29, 'days').startOf('day');
    const startOfMonth = moment().startOf('month');

    const totalRevenue = await Payment.aggregate([
      { $match: { payment_status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const dailyRevenue = await Payment.aggregate([
      { $match: { payment_status: 'Paid', payment_date: { $gte: today.toDate() } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const weeklyRevenue = await Payment.aggregate([
        { $match: { payment_status: 'Paid', payment_date: { $gte: last7Days.toDate() } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const monthlyRevenue = await Payment.aggregate([
        { $match: { payment_status: 'Paid', payment_date: { $gte: startOfMonth.toDate() } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueByDay = await Payment.aggregate([
        { $match: { payment_status: 'Paid', payment_date: { $gte: last30Days.toDate() } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$payment_date" } },
                total: { $sum: "$amount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      dailyRevenue: dailyRevenue.length > 0 ? dailyRevenue[0].total : 0,
      weeklyRevenue: weeklyRevenue.length > 0 ? weeklyRevenue[0].total : 0,
      monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
      revenueByDay: revenueByDay
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getDashboardMetrics = async (req, res) => {
  try {
    console.log('Fetching dashboard metrics...');

    // Lấy tổng số người dùng và tăng trưởng
    console.log('Fetching user metrics...');
    const totalUsers = await User.countDocuments({ role: 'user' });
    console.log('Total users:', totalUsers);

    const lastMonthUsers = await User.countDocuments({
      role: 'user',
      createdAt: { 
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
      }
    });
    console.log('Last month users:', lastMonthUsers);

    const userGrowth = totalUsers === 0 ? 0 : Math.round((lastMonthUsers / totalUsers) * 100);
    console.log('User growth:', userGrowth);

    // Lấy đơn hàng mới và tăng trưởng
    console.log('Fetching booking metrics...');
    const newOrders = await Booking.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
      }
    });
    console.log('New orders:', newOrders);

    const lastWeekOrders = await Booking.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 14)),
        $lt: new Date(new Date().setDate(new Date().getDate() - 7))
      }
    });
    console.log('Last week orders:', lastWeekOrders);

    const orderGrowth = lastWeekOrders === 0 ? 0 : Math.round(((newOrders - lastWeekOrders) / lastWeekOrders) * 100);
    console.log('Order growth:', orderGrowth);

    // Lấy doanh thu tháng này và tăng trưởng
    console.log('Fetching revenue metrics...');
    const currentMonthRevenue = await Booking.aggregate([
      {
        $match: {
          booking_status: 'Completed',
          createdAt: {
            $gte: new Date(new Date().setDate(1))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_amount' }
        }
      }
    ]);
    console.log('Current month revenue:', currentMonthRevenue);

    const lastMonthRevenue = await Booking.aggregate([
      {
        $match: {
          booking_status: 'Completed',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)),
            $lt: new Date(new Date().setDate(1))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_amount' }
        }
      }
    ]);
    console.log('Last month revenue:', lastMonthRevenue);

    const monthlyRevenue = currentMonthRevenue[0]?.total || 0;
    const previousMonthRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousMonthRevenue === 0 ? 0 : 
      Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);
    console.log('Revenue growth:', revenueGrowth);

    // Lấy tin nhắn mới và tăng trưởng
    console.log('Fetching message metrics...');
    const newMessages = await Message.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 1))
      }
    });
    console.log('New messages:', newMessages);

    const yesterdayMessages = await Message.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 2)),
        $lt: new Date(new Date().setDate(new Date().getDate() - 1))
      }
    });
    console.log('Yesterday messages:', yesterdayMessages);

    const messageGrowth = yesterdayMessages === 0 ? 0 : 
      Math.round(((newMessages - yesterdayMessages) / yesterdayMessages) * 100);
    console.log('Message growth:', messageGrowth);

    // Lấy 5 người dùng mới nhất
    console.log('Fetching recent users...');
    const newUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username createdAt');
    console.log('Recent users:', newUsers);

    // Lấy 5 đơn hàng mới nhất
    console.log('Fetching recent bookings...');
    const newBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user_id', 'username')
      .select('user_id total_amount booking_status createdAt')
      .lean()
      .then(bookings => bookings.map(booking => ({
        user: {
          username: booking.user_id?.username || 'Unknown User'
        },
        totalAmount: booking.total_amount || 0,
        status: (booking.booking_status || 'pending').toLowerCase(),
        createdAt: booking.createdAt
      })));
    console.log('Recent bookings:', newBookings);

    const response = {
      totalUsers,
      userGrowth,
      newOrders,
      orderGrowth,
      monthlyRevenue,
      revenueGrowth,
      newMessages,
      messageGrowth,
      recentActivities: {
        newUsers,
        newOrders: newBookings
      }
    };

    console.log('Sending response:', response);
    res.json(response);

  } catch (error) {
    console.error('Error in getDashboardMetrics:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Lỗi khi lấy dữ liệu dashboard', 
      error: error.message,
      stack: error.stack 
    });
  }
}; 