const Review = require('../models/Review');
const Hotel = require('../models/Hotel');

// Tạo review mới
exports.createReview = async (req, res) => {
  try {
    const { hotel_id, rating, review_text } = req.body;

    // Kiểm tra khách sạn tồn tại
    const hotel = await Hotel.findById(hotel_id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    // Kiểm tra user đã đặt phòng tại khách sạn này chưa
    const hasBooking = await Booking.findOne({
      user_id: req.user.userId,
      hotel_id,
      payment_status: 'Paid'
    });

    if (!hasBooking) {
      return res.status(403).json({ message: 'Bạn cần đặt và thanh toán phòng trước khi đánh giá' });
    }

    const review = new Review({
      user_id: req.user.userId,
      hotel_id,
      rating,
      review_text
    });

    await review.save();

    // Cập nhật rating trung bình của khách sạn
    const reviews = await Review.find({ hotel_id });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    hotel.rating = averageRating;
    await hotel.save();

    res.status(201).json({
      message: 'Tạo đánh giá thành công',
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách review của khách sạn
exports.getHotelReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hotel_id: req.params.hotelId })
      .populate('user_id', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật review
exports.updateReview = async (req, res) => {
  try {
    const { rating, review_text } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    // Kiểm tra quyền truy cập
    if (review.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật đánh giá này' });
    }

    review.rating = rating;
    review.review_text = review_text;
    await review.save();

    // Cập nhật rating trung bình của khách sạn
    const reviews = await Review.find({ hotel_id: review.hotel_id });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    await Hotel.findByIdAndUpdate(review.hotel_id, { rating: averageRating });

    res.json({
      message: 'Cập nhật đánh giá thành công',
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    // Kiểm tra quyền truy cập
    if (review.user_id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
    }

    const hotel_id = review.hotel_id;
    await review.remove();

    // Cập nhật rating trung bình của khách sạn
    const reviews = await Review.find({ hotel_id });
    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0;
    await Hotel.findByIdAndUpdate(hotel_id, { rating: averageRating });

    res.json({ message: 'Xóa đánh giá thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách tất cả reviews (admin)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user_id', 'username')
      .populate('hotel_id', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 