const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const vnpayUtils = require('../utils/vnpay.utils');

// Tạo payment mới
exports.createPayment = async (req, res) => {
  try {
    const { booking_id, payment_method } = req.body;

    // Kiểm tra booking tồn tại
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    // Kiểm tra quyền truy cập
    if (booking.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    // Tạo transaction ID
    const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = new Payment({
      user_id: req.user.userId,
      booking_id,
      amount: booking.total_amount,
      payment_date: new Date(),
      payment_status: 'Pending',
      payment_method,
      transaction_id
    });

    await payment.save();

    // Cập nhật trạng thái booking
    booking.payment_status = 'Pending';
    await booking.save();

    res.status(201).json({
      message: 'Tạo payment thành công',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo URL thanh toán VNPay
exports.createVnpayPayment = async (req, res) => {
  try {
    const { booking_id } = req.body;
    
    // Kiểm tra booking tồn tại
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }

    // Kiểm tra quyền truy cập
    if (booking.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    // Tạo transaction ID
    const transaction_id = `vnp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Tạo bản ghi thanh toán
    const payment = new Payment({
      user_id: req.user.userId,
      booking_id,
      amount: booking.total_amount,
      payment_date: new Date(),
      payment_status: 'Pending',
      payment_method: 'VNPay',
      transaction_id
    });

    await payment.save();

    // Cập nhật trạng thái booking
    booking.payment_status = 'Pending';
    await booking.save();

    // Tạo URL thanh toán VNPay
    const ipAddr = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress;

    const paymentUrl = vnpayUtils.createPaymentUrl({
      booking_id: booking._id.toString(),
      amount: booking.total_amount,
      orderId: payment._id.toString()
    }, ipAddr);

    res.status(200).json({
      message: 'Tạo URL thanh toán VNPay thành công',
      paymentUrl,
      paymentId: payment._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xử lý callback từ VNPay
exports.vnpayReturn = async (req, res) => {
  try {
    const vnpParams = req.query;
    
    // Kiểm tra chữ ký
    const isValidSignature = vnpayUtils.verifyReturnUrl(vnpParams);
    if (!isValidSignature) {
      return res.status(400).json({ message: 'Chữ ký không hợp lệ' });
    }

    // Phân tích thông tin thanh toán
    const vnpResponseCode = vnpParams['vnp_ResponseCode'];
    const transactionRef = vnpParams['vnp_TxnRef'];
    const transactionDate = vnpParams['vnp_PayDate'];
    
    // Tách transaction_id từ vnp_TxnRef
    const parts = transactionRef.split('_');
    const timestamp = parts[0];
    const booking_id_part = parts[1];
    
    // Tìm thanh toán liên quan
    const payment = await Payment.findOne({
      transaction_id: { $regex: booking_id_part }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    // Cập nhật trạng thái thanh toán
    if (vnpResponseCode === '00') {
      payment.payment_status = 'Paid';
      
      // Cập nhật thông tin booking
      const booking = await Booking.findById(payment.booking_id);
      if (booking) {
        booking.payment_status = 'Paid';
        await booking.save();
      }
    } else {
      payment.payment_status = 'Failed';
    }
    
    await payment.save();

    // Chuyển hướng người dùng về trang kết quả thanh toán
    res.redirect(`${process.env.FRONTEND_URL}/payment/result?status=${payment.payment_status}&paymentId=${payment._id}`);
  } catch (error) {
    console.error('Lỗi xử lý callback VNPay:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/result?status=error`);
  }
};

// Xử lý IPN từ VNPay (Instant Payment Notification)
exports.vnpayIpn = async (req, res) => {
  try {
    const vnpParams = req.query;
    
    // Kiểm tra chữ ký
    const isValidSignature = vnpayUtils.verifyReturnUrl(vnpParams);
    if (!isValidSignature) {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    // Phân tích thông tin thanh toán
    const vnpResponseCode = vnpParams['vnp_ResponseCode'];
    const transactionRef = vnpParams['vnp_TxnRef'];
    
    // Tách transaction_id từ vnp_TxnRef
    const parts = transactionRef.split('_');
    const timestamp = parts[0];
    const booking_id_part = parts[1];
    
    // Tìm thanh toán liên quan
    const payment = await Payment.findOne({
      transaction_id: { $regex: booking_id_part }
    });

    if (!payment) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    // Cập nhật trạng thái thanh toán
    if (vnpResponseCode === '00') {
      payment.payment_status = 'Paid';
      
      // Cập nhật thông tin booking
      const booking = await Booking.findById(payment.booking_id);
      if (booking) {
        booking.payment_status = 'Paid';
        await booking.save();
      }
      
      await payment.save();
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      payment.payment_status = 'Failed';
      await payment.save();
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    }
  } catch (error) {
    console.error('Lỗi xử lý IPN VNPay:', error);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// Lấy kết quả thanh toán
exports.getPaymentResult = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId)
      .populate('booking_id', 'total_amount payment_status');

    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    // Kiểm tra quyền truy cập
    if (payment.user_id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    res.json({
      message: 'Lấy kết quả thanh toán thành công',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật trạng thái payment
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy payment' });
    }

    // Kiểm tra quyền truy cập
    if (payment.user_id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    payment.payment_status = payment_status;
    await payment.save();

    // Cập nhật trạng thái booking
    const booking = await Booking.findById(payment.booking_id);
    if (booking) {
      booking.payment_status = payment_status;
      await booking.save();
    }

    res.json({
      message: 'Cập nhật trạng thái payment thành công',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy lịch sử payment của user
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user.userId })
      .populate('booking_id', 'total_amount payment_status');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết payment
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking_id', 'total_amount payment_status');

    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy payment' });
    }

    // Kiểm tra quyền truy cập
    if (payment.user_id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách tất cả payments (admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user_id', 'username email')
      .populate('booking_id', 'total_amount payment_status');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 