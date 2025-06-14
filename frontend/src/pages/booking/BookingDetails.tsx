import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { bookingService } from '../../services/booking.service';
import { 
  FiCalendar, FiMapPin, FiCreditCard, FiUsers, FiArrowLeft, 
  FiTrash2, FiCheckCircle, FiXCircle, FiDollarSign 
} from 'react-icons/fi';

interface Booking {
  _id: string;
  booking_type: 'hotel' | 'flight' | 'tour';
  hotel_id?: {
    _id: string;
    name: string;
    location: string;
    images: string[];
    amenities?: string[];
  };
  flight_id?: {
    _id: string;
    flight_name: string;
    departure: string;
    arrival: string;
    departure_time?: string;
    arrival_time?: string;
  };
  tour_id?: {
    _id: string;
    tour_name: string;
    location: string;
    images: string[];
    description?: string;
    duration?: string;
  };
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!id) {
          toast.error('ID không hợp lệ');
          navigate('/bookings');
          return;
        }
        
        const bookingData = await bookingService.getBookingDetails(id);
        console.log('Booking data received:', bookingData);
        setBooking(bookingData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Không thể tải thông tin chi tiết booking');
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, navigate]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy booking này?')) return;

    setCancelling(true);
    try {
      console.log('Bắt đầu xử lý hủy booking:', id);
      const token = localStorage.getItem('token');
      console.log('Token từ localStorage:', token ? 'Có' : 'Không');
      
      console.log('Gửi request hủy booking...');
      await bookingService.cancelBooking(id as string);
      console.log('Hủy booking thành công');
      toast.success('Đã hủy booking thành công');
      navigate('/bookings');
    } catch (error) {
      console.error('Lỗi khi hủy booking:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status:', error.response?.status);
        
        // Hiển thị thông báo lỗi chi tiết hơn
        const errorMessage = error.response?.data?.message || 'Không thể hủy booking';
        toast.error(errorMessage);
      } else {
        toast.error('Không thể hủy booking');
      }
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = () => {
    navigate(`/payment/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="mr-2 text-green-500" />;
      case 'pending':
        return <FiCreditCard className="mr-2 text-yellow-500" />;
      case 'cancelled':
        return <FiXCircle className="mr-2 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <FiArrowLeft className="mr-2" />
        Quay lại
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">
                {booking.booking_type === 'hotel' && booking.hotel_id?.name}
                {booking.booking_type === 'flight' && booking.flight_id?.flight_name}
                {booking.booking_type === 'tour' && booking.tour_id?.tour_name}
              </h1>
              <p className="text-blue-100 mt-1">
                Mã booking: {booking._id}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.payment_status)}`}>
              {getStatusText(booking.payment_status)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Actions Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 pb-6 border-b">
            {booking.payment_status === 'pending' && (
              <button
                onClick={handlePayment}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
              >
                <FiDollarSign className="mr-2" />
                Thanh toán ngay
              </button>
            )}
            {booking.payment_status === 'pending' && (
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-70"
              >
                {cancelling ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FiTrash2 className="mr-2" />
                )}
                {cancelling ? 'Đang hủy...' : 'Hủy booking'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin chính */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Thông tin đặt chỗ</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiCalendar className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày đặt</p>
                    <p>{new Date(booking.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCalendar className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian</p>
                    <p>
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiUsers className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Số lượng khách</p>
                    <p>{booking.guests} người</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCreditCard className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                    <p className="text-lg font-semibold">{booking.total_amount.toLocaleString()} VND</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Chi tiết dịch vụ</h2>
              {booking.booking_type === 'hotel' && booking.hotel_id && (
                <div className="space-y-4">
                  <img
                    src={booking.hotel_id.images[0]}
                    alt={booking.hotel_id.name}
                    className="w-full h-48 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm text-gray-500">Địa điểm</p>
                    <p>{booking.hotel_id.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tiện nghi</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {booking.hotel_id.amenities?.map((amenity, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {booking.booking_type === 'flight' && booking.flight_id && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Điểm khởi hành</p>
                    <p>{booking.flight_id.departure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Điểm đến</p>
                    <p>{booking.flight_id.arrival}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian khởi hành</p>
                    <p>{booking.flight_id.departure_time ? new Date(booking.flight_id.departure_time).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian đến</p>
                    <p>{booking.flight_id.arrival_time ? new Date(booking.flight_id.arrival_time).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              )}

              {booking.booking_type === 'tour' && booking.tour_id && (
                <div className="space-y-4">
                  <img
                    src={booking.tour_id.images[0]}
                    alt={booking.tour_id.tour_name}
                    className="w-full h-48 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm text-gray-500">Địa điểm</p>
                    <p>{booking.tour_id.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian tour</p>
                    <p>{booking.tour_id.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mô tả</p>
                    <p className="text-sm">{booking.tour_id.description?.substring(0, 150)}...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            {booking.payment_status === 'pending' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 w-full sm:w-auto">
                <div className="flex">
                  <div className="flex-shrink-0">
                    {getStatusIcon(booking.payment_status)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Vui lòng thanh toán để hoàn tất đặt chỗ.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {booking.payment_status === 'paid' && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 w-full sm:w-auto">
                <div className="flex">
                  <div className="flex-shrink-0">
                    {getStatusIcon(booking.payment_status)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Đặt chỗ đã được xác nhận và thanh toán.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {booking.payment_status === 'cancelled' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 w-full sm:w-auto">
                <div className="flex">
                  <div className="flex-shrink-0">
                    {getStatusIcon(booking.payment_status)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      Đặt chỗ đã bị hủy.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
