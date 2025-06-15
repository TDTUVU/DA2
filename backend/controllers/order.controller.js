const Order = require('../models/Order');
const Tour = require('../models/Tour');

// Lấy danh sách đơn hàng
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    
    // Nếu là user thường, chỉ lấy đơn hàng của họ
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    // Lọc theo trạng thái nếu có
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'username email')
      .populate('tour', 'name price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng' });
  }
};

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { tour, startDate, numberOfPeople, contactInfo } = req.body;

    // Tính tổng tiền (giả sử có giá tour từ tour model)
    const tourDoc = await Tour.findById(tour);
    if (!tourDoc) {
      return res.status(404).json({ message: 'Không tìm thấy tour' });
    }

    const totalAmount = tourDoc.price * numberOfPeople;

    const order = new Order({
      user: req.user._id,
      tour,
      totalAmount,
      startDate,
      numberOfPeople,
      contactInfo
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra quyền: chỉ admin mới được cập nhật trạng thái
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền thực hiện' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('user', 'username email')
      .populate('tour', 'name price description');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra quyền: chỉ admin hoặc chủ đơn hàng mới xem được
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng' });
  }
}; 