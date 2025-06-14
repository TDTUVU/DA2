import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiSearch, FiFilter, FiArrowUp, FiArrowDown,
  FiMapPin, FiClock, FiDollarSign, FiUsers, FiStar
} from 'react-icons/fi';

interface Flight {
  _id: string;
  flight_name: string;
  departure: string;
  arrival: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  airline: string;
  rating: number;
  images: string[];
}

const FlightList: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await axios.get('/api/flights');
        setFlights(response.data.flights || []);
      } catch (error) {
        console.error('Error fetching flights:', error);
        toast.error('Không thể tải danh sách chuyến bay');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlights();
  }, []);

  const calculateDuration = (departure: string, arrival: string) => {
    try {
      const departureTime = new Date(departure);
      const arrivalTime = new Date(arrival);
      const durationMs = arrivalTime.getTime() - departureTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${durationHours}h ${durationMinutes}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const filteredFlights = flights
    .filter(flight => {
      const matchesSearch = searchTerm === '' || 
        flight.airline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.departure?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.arrival?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.flight_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = filterPrice === 'all' || 
        (filterPrice === 'low' && flight.price < 100) ||
        (filterPrice === 'medium' && flight.price >= 100 && flight.price < 200) ||
        (filterPrice === 'high' && flight.price >= 200);
      
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') {
        return a.price - b.price;
      } else if (sortBy === 'price_high') {
        return b.price - a.price;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else {
        // Sort by departure time as default
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
      <h1 className="text-3xl font-bold mb-8 text-center">Khám phá chuyến bay</h1>

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
              placeholder="Tìm kiếm chuyến bay..."
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
              <option value="low">Dưới 100$</option>
              <option value="medium">100$ - 200$</option>
              <option value="high">Trên 200$</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            aria-label="Sắp xếp chuyến bay"
            title="Chọn cách sắp xếp"
          >
            <option value="newest">Sắp khởi hành sớm nhất</option>
            <option value="price_low">Giá thấp đến cao</option>
            <option value="price_high">Giá cao đến thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* Flight List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlights.length > 0 ? (
          filteredFlights.map((flight) => (
            <Link
              key={flight._id}
              to={`/flights/${flight._id}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
            >
              <div className="relative">
                {flight.images && flight.images.length > 0 ? (
                  <img
                    src={flight.images[0]}
                    alt={flight.flight_name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Không có hình ảnh</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 flex items-center">
                  <FiStar className="text-yellow-400 mr-1" />
                  <span className="font-semibold">{flight.rating}</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{flight.airline}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {flight.flight_name}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600 mb-2">
                    <FiMapPin className="mr-2" />
                    <span>{flight.departure} → {flight.arrival}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <FiClock className="mr-2" />
                    <div>
                      <span>{formatDateTime(flight.departure_time)} - {formatDateTime(flight.arrival_time)}</span>
                      <p className="text-sm text-gray-500">
                        ({calculateDuration(flight.departure_time, flight.arrival_time)})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <FiDollarSign className="mr-2" />
                    <span>{flight.price.toLocaleString()} USD</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <FiUsers className="mr-2" />
                    <span>Còn {flight.available_seats} ghế</span>
                  </div>

                  <div className="flex justify-center w-full">
                    <button className="flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">
              Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">Không tìm thấy chuyến bay phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightList;
