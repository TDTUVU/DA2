import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCreditCard, FiCalendar, FiLock, FiArrowLeft } from 'react-icons/fi';
import { bookingService } from '../../services/booking.service';

const FakeCardPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập gọi API thanh toán
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // CHỈNH SỬA: Gọi API để cập nhật payment_status của booking thành 'Paid' ở backend
    try {
      // Giả sử bạn có một service function để làm việc này:
      await bookingService.markBookingAsPaid(bookingId as string);
      // console.log(`TODO: Gọi API để đánh dấu booking ${bookingId} là đã thanh toán.`);
      
      setLoading(false);
      toast.success('Thanh toán (giả lập) thành công! Booking đã được cập nhật.');
      navigate(`/payment-success/${bookingId}`);

    } catch (apiError) {
      setLoading(false);
      toast.error('Lỗi khi cập nhật trạng thái booking sau thanh toán.');
      // Có thể điều hướng về trang chi tiết booking hoặc hiển thị lỗi
      // navigate(`/bookings/${bookingId}`);
      console.error("Lỗi cập nhật booking sau thanh toán:", apiError);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center">
      <button
        onClick={() => navigate(-1)} // Quay lại trang trước đó (trang đặt chỗ)
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 self-start"
      >
        <FiArrowLeft className="mr-2" />
        Quay lại
      </button>
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
          Thông tin thanh toán
        </h1>
        <form onSubmit={handlePayment} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
              Tên chủ thẻ
            </label>
            <input
              type="text"
              id="cardHolderName"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="NGUYEN VAN A"
              required
            />
          </div>
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Số thẻ
            </label>
            <div className="relative">
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="0000 0000 0000 0000"
                maxLength={19} // Bao gồm dấu cách
                required
              />
              <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày hết hạn (MM/YY)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').slice(0,4))}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0,3))}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="123"
                  maxLength={3}
                  required
                />
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FiCreditCard className="mr-2" />
            )}
            {loading ? 'Đang xử lý...' : `Thanh toán cho đơn #${bookingId}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FakeCardPaymentPage; 