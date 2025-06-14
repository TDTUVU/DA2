import React from 'react';
import { Booking } from '../../../types/booking.types';

interface BookingDetailModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, newStatus: string) => Promise<void>;
  updatingBookingId: string | null;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
  updatingBookingId
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'Đã thanh toán';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return 'Chờ thanh toán';
    }
  };

  const getBookingDetails = () => {
    if (booking.hotel_id) {
      return {
        type: 'Khách sạn',
        name: booking.hotel_id.name,
        price: booking.hotel_id.price_per_night,
        details: (
          <>
            <p><span className="font-medium">Check-in:</span> {new Date(booking.check_in!).toLocaleDateString('vi-VN')}</p>
            <p><span className="font-medium">Check-out:</span> {new Date(booking.check_out!).toLocaleDateString('vi-VN')}</p>
          </>
        )
      };
    }
    if (booking.flight_id) {
      return {
        type: 'Chuyến bay',
        name: booking.flight_id.flight_name,
        price: booking.flight_id.price,
        details: null
      };
    }
    if (booking.tour_id) {
      return {
        type: 'Tour',
        name: booking.tour_id.tour_name,
        price: booking.tour_id.price_per_person,
        details: null
      };
    }
    return {
      type: 'N/A',
      name: 'N/A',
      price: 0,
      details: null
    };
  };

  const bookingDetails = getBookingDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Chi tiết đơn hàng</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="col-span-1 lg:col-span-2 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">Mã đơn hàng:</p>
              <p className="text-sm font-medium break-all">{booking._id}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">Ngày đặt:</p>
              <p className="text-sm font-medium">
                {new Date(booking.booking_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">Trạng thái:</p>
              <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.payment_status)}`}>
                {getStatusText(booking.payment_status)}
              </p>
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Thông tin khách hàng</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Họ tên:</p>
                <p className="text-sm font-medium">{booking.user_id.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Email:</p>
                <p className="text-sm font-medium break-all">{booking.user_id.email}</p>
              </div>
            </div>
          </div>

          {/* Thông tin dịch vụ */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Thông tin dịch vụ</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-600">Loại dịch vụ:</span>
                  <p className="text-sm">{bookingDetails.type}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Tên dịch vụ:</span>
                  <p className="text-sm">{bookingDetails.name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Giá:</span>
                  <p className="text-sm">{bookingDetails.price.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
              {bookingDetails.details && (
                <div className="mt-2">
                  {bookingDetails.details}
                </div>
              )}
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Thông tin thanh toán</h3>
            <p className="text-base font-bold">
              Tổng tiền: {booking.total_amount.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>

          {/* Nút hành động */}
          {booking.payment_status === 'Pending' && (
            <div className="border-t pt-4 flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => onStatusUpdate(booking._id, 'Cancelled')}
                disabled={updatingBookingId === booking._id}
                className={`w-full sm:w-auto px-4 py-2 text-xs font-medium text-white rounded-md transition-colors ${
                  updatingBookingId === booking._id 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {updatingBookingId === booking._id ? 'Đang xử lý...' : 'Hủy đơn'}
              </button>
              <button
                onClick={() => onStatusUpdate(booking._id, 'Paid')}
                disabled={updatingBookingId === booking._id}
                className={`w-full sm:w-auto px-4 py-2 text-xs font-medium text-white rounded-md transition-colors ${
                  updatingBookingId === booking._id 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {updatingBookingId === booking._id ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal; 