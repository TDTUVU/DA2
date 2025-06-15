import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiSearch, FiFilter, FiArrowRight,
  FiMapPin, FiStar, FiDollarSign, FiUsers, FiClock
} from 'react-icons/fi';

interface Tour {
  _id: string;
  tour_name: string;
  description: string;
  price_per_person: number;
  available_seats: number;
  duration: string;
  departure_location: string;
  destination: string;
  departure_time: string;
  images: string[];
  rating: number;
}

const TourList: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get('/api/tours');
        console.log('Received tours data:', response.data);
        setTours(response.data.tours);
      } catch (error) {
        console.error('Error fetching tours:', error);
        toast.error('Không thể tải danh sách tour');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const filteredTours = tours
    .filter(tour => {
      const name = tour.tour_name || '';
      const destination = tour.destination || '';
      const description = tour.description || '';
      
      const matchesSearch = searchTerm === '' || 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = filterPrice === 'all' || 
        (filterPrice === 'low' && tour.price_per_person < 1000000) ||
        (filterPrice === 'medium' && tour.price_per_person >= 1000000 && tour.price_per_person < 3000000) ||
        (filterPrice === 'high' && tour.price_per_person >= 3000000);
      
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') {
        return a.price_per_person - b.price_per_person;
      } else if (sortBy === 'price_high') {
        return b.price_per_person - a.price_per_person;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else {
        // Sắp xếp theo thời gian khởi hành sớm nhất
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Khám phá tour du lịch</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tour..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label="Lọc theo giá"
              title="Chọn khoảng giá"
            >
              <option value="all">Tất cả giá</option>
              <option value="low">Dưới 1.000.000₫</option>
              <option value="medium">1.000.000₫ - 3.000.000₫</option>
              <option value="high">Trên 3.000.000₫</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            aria-label="Sắp xếp tour"
            title="Chọn cách sắp xếp"
          >
            <option value="newest">Sắp khởi hành sớm nhất</option>
            <option value="price_low">Giá thấp đến cao</option>
            <option value="price_high">Giá cao đến thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* Tour List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTours.length > 0 ? (
          filteredTours.map((tour) => (
            <Link
              key={tour._id}
              to={`/tours/${tour._id}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
            >
              <div className="relative">
                {tour.images && tour.images.length > 0 ? (
                  <img
                    src={tour.images[0]}
                    alt={tour.tour_name || 'Tour image'}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Không có hình ảnh</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 flex items-center">
                  <FiStar className="text-yellow-400 mr-1" />
                  <span className="font-semibold">{tour.rating}</span>
                </div>
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{tour.tour_name || 'Tour chưa đặt tên'}</h2>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <FiMapPin className="mr-2" />
                  <span>{tour.destination || 'Chưa xác định'}</span>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <FiClock className="mr-2" />
                  <span>{tour.duration || 'N/A'}</span>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <FiDollarSign className="mr-2" />
                  <span>{tour.price_per_person?.toLocaleString('vi-VN') || 0} VND/người</span>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <FiUsers className="mr-2" />
                  <span>Còn {tour.available_seats || 0} chỗ</span>
                </div>

                <div
                  className="flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition cursor-pointer"
                  style={{ marginTop: '8px' }}
                >
                  Xem chi tiết
                  <FiArrowRight className="ml-2" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">Không tìm thấy tour phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourList;
