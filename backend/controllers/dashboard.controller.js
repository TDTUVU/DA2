const Payment = require('../models/Payment');
const moment = require('moment');

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