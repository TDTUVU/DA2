import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle, FiExternalLink } from 'react-icons/fi';

const PaymentSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();

  return (
    <div className="max-w-lg mx-auto p-4 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="bg-white rounded-lg shadow-xl p-8 sm:p-12">
        <FiCheckCircle className="text-6xl sm:text-7xl text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Thanh toán thành công!
        </h1>
        <p className="text-gray-600 mb-8 sm:text-lg">
          Cảm ơn bạn đã đặt dịch vụ. Đơn hàng của bạn đã được xác nhận.
        </p>
        {bookingId && (
          <Link
            to={`/bookings/${bookingId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          >
            <FiExternalLink className="mr-2" />
            Xem chi tiết đơn hàng
          </Link>
        )}
        <Link
          to={`/`}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition sm:ml-4"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 