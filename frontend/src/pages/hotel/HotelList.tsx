import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiSearch, FiFilter, FiMapPin, FiStar, FiDollarSign, 
  FiCalendar, FiUsers, FiArrowRight 
} from 'react-icons/fi';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  price_per_night: number;
  available_rooms: number;
  images: string[];
  rating: number;
  amenities: string[];
}

const HotelList: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get('/api/hotels');
        setHotels(response.data);
      } catch (error) {
        toast.error('Không thể tải danh sách khách sạn');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const filteredHotels = hotels
    .filter(hotel => {
      const matchesSearch = searchTerm === '' || 
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = filterPrice === 'all' || 
        (filterPrice === 'low' && hotel.price_per_night < 1000000) ||
        (filterPrice === 'medium' && hotel.price_per_night >= 1000000 && hotel.price_per_night < 3000000) ||
        (filterPrice === 'high' && hotel.price_per_night >= 3000000);
      
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') {
        return a.price_per_night - b.price_per_night;
      } else if (sortBy === 'price_high') {
        return b.price_per_night - a.price_per_night;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else {
        return 0;
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
      <h1 className="text-3xl font-bold mb-8 text-center">Khám phá khách sạn</h1>

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
              placeholder="Tìm kiếm khách sạn..."
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
              <option value="low">Dưới 1 triệu</option>
              <option value="medium">1 - 3 triệu</option>
              <option value="high">Trên 3 triệu</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            aria-label="Sắp xếp khách sạn"
            title="Chọn cách sắp xếp"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_low">Giá thấp đến cao</option>
            <option value="price_high">Giá cao đến thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* Hotel List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <div key={hotel._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
            <div className="relative">
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 flex items-center">
                <FiStar className="text-yellow-400 mr-1" />
                <span className="font-semibold">{hotel.rating}</span>
              </div>
            </div>

            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{hotel.name}</h2>
              
              <div className="flex items-center text-gray-600 mb-2">
                <FiMapPin className="mr-2" />
                <span>{hotel.location}</span>
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <FiDollarSign className="mr-2" />
                <span>{hotel.price_per_night.toLocaleString()} VND/đêm</span>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <FiUsers className="mr-2" />
                <span>Còn {hotel.available_rooms} phòng</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 3 && (
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                    +{hotel.amenities.length - 3} khác
                  </span>
                )}
              </div>

              <Link
                to={`/hotels/${hotel._id}`}
                className="flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                Xem chi tiết
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy khách sạn phù hợp.</p>
        </div>
      )}
    </div>
  );
};

export default HotelList;
