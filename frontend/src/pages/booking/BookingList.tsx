import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiCreditCard, FiFilter, FiSearch, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { bookingService } from '../../services/booking.service';

interface Booking {
  _id: string;
  booking_type: 'hotel' | 'flight' | 'tour';
  hotel_id?: {
    _id: string;
    name: string;
    location: string;
    images: string[];
  };
  flight_id?: {
    _id: string;
    flight_name: string;
    departure: string;
    arrival: string;
  };
  tour_id?: {
    _id: string;
    tour_name: string;
    location: string;
    images: string[];
  };
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getUserBookings();
        setBookings(data);
      } catch (error) {
        toast.error('Không thể tải danh sách booking');
        console.error('Lỗi khi tải bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings
    .filter(booking => {
      const matchesSearch = searchTerm === '' || 
        (booking.hotel_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         booking.flight_id?.flight_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         booking.tour_id?.tour_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || booking.booking_type === filterType;
      
      const matchesStatus = filterStatus === 'all' || booking.payment_status === filterStatus;

      const matchesTab = activeTab === 'all' || booking.payment_status === activeTab;
      
      return matchesSearch && matchesType && matchesStatus && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'price_high') {
        return b.total_amount - a.total_amount;
      } else {
        return a.total_amount - b.total_amount;
      }
    });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="mr-1" />;
      case 'pending':
        return <FiClock className="mr-1" />;
      case 'cancelled':
        return <FiXCircle className="mr-1" />;
      default:
        return null;
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

  const getBookingImage = (booking: Booking) => {
    if (booking.booking_type === 'hotel' && booking.hotel_id?.images?.length) {
      return booking.hotel_id.images[0];
    } else if (booking.booking_type === 'tour' && booking.tour_id?.images?.length) {
      return booking.tour_id.images[0];
    } else {
      return 'https://via.placeholder.com/300x200?text=No+Image';
    }
  };

  // Count bookings by status
  const countByStatus = {
    all: bookings.length,
    pending: bookings.filter(b => b.payment_status === 'pending').length,
    paid: bookings.filter(b => b.payment_status === 'paid').length,
    cancelled: bookings.filter(b => b.payment_status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Đặt chỗ của tôi</h1>

      {/* Status Tabs */}
      <div className="mb-6 border-b">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`inline-flex items-center p-4 rounded-t-lg ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'hover:text-gray-600 hover:border-gray-300 text-gray-500'
              }`}
            >
              Tất cả ({countByStatus.all})
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`inline-flex items-center p-4 rounded-t-lg ${
                activeTab === 'pending'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'hover:text-gray-600 hover:border-gray-300 text-gray-500'
              }`}
            >
              <FiClock className="mr-1" />
              Chờ thanh toán ({countByStatus.pending})
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('paid')}
              className={`inline-flex items-center p-4 rounded-t-lg ${
                activeTab === 'paid'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'hover:text-gray-600 hover:border-gray-300 text-gray-500'
              }`}
            >
              <FiCheckCircle className="mr-1" />
              Đã thanh toán ({countByStatus.paid})
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`inline-flex items-center p-4 rounded-t-lg ${
                activeTab === 'cancelled'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'hover:text-gray-600 hover:border-gray-300 text-gray-500'
              }`}
            >
              <FiXCircle className="mr-1" />
              Đã hủy ({countByStatus.cancelled})
            </button>
          </li>
        </ul>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm booking..."
              className="pl-10 w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label="Lọc theo loại booking"
              title="Chọn loại booking để lọc"
            >
              <option value="all">Tất cả dịch vụ</option>
              <option value="hotel">Khách sạn</option>
              <option value="flight">Chuyến bay</option>
              <option value="tour">Tour</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            aria-label="Sắp xếp booking"
            title="Chọn cách sắp xếp booking"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price_high">Giá cao đến thấp</option>
            <option value="price_low">Giá thấp đến cao</option>
          </select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
          <img src="https://i.imgur.com/VEuXvp4.png" alt="Không có booking" className="w-32 h-32 mb-4" />
          <p className="text-gray-500 text-lg mb-2">Không tìm thấy booking nào</p>
          <p className="text-gray-400 mb-6">Bạn chưa có booking hoặc không có kết quả phù hợp với bộ lọc hiện tại</p>
          <Link 
            to="/" 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={getBookingImage(booking)} 
                  alt="Booking" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.payment_status)}`}>
                    {getStatusIcon(booking.payment_status)}
                    {getStatusText(booking.payment_status)}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {booking.booking_type === 'hotel' && 'Khách sạn'}
                    {booking.booking_type === 'flight' && 'Chuyến bay'}
                    {booking.booking_type === 'tour' && 'Tour'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-2">
                  <h2 className="text-xl font-semibold line-clamp-1">
                    {booking.booking_type === 'hotel' && booking.hotel_id?.name}
                    {booking.booking_type === 'flight' && booking.flight_id?.flight_name}
                    {booking.booking_type === 'tour' && booking.tour_id?.tour_name}
                  </h2>
                </div>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center">
                    <FiMapPin className="mr-2 text-blue-600 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {booking.booking_type === 'hotel' && booking.hotel_id?.location}
                      {booking.booking_type === 'flight' && `${booking.flight_id?.departure} → ${booking.flight_id?.arrival}`}
                      {booking.booking_type === 'tour' && booking.tour_id?.location}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <FiCalendar className="mr-2 text-blue-600 flex-shrink-0" />
                    <span>
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <FiCreditCard className="mr-2 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-blue-900">{booking.total_amount.toLocaleString()} VND</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/bookings/${booking._id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;
