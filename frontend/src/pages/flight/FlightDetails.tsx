import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiMapPin, FiClock, FiDollarSign, FiUsers, FiCalendar,
  FiArrowLeft, FiCheckCircle, FiBriefcase, FiCoffee, FiWifi,
  FiTv, FiWind, FiStar
} from 'react-icons/fi';

interface FlightDetails {
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

const FlightDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [flight, setFlight] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlightDetails = async () => {
      if (!id) {
        console.error('Flight ID is missing');
        toast.error('Không tìm thấy ID chuyến bay');
        navigate('/flights');
        return;
      }

      try {
        console.log('Fetching flight details for ID:', id);
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/flights/${id}?t=${timestamp}`);
        console.log('Flight data received:', response.data);
        
        if (response.data && response.data._id) {
          // Đảm bảo các trường cần thiết luôn có
          const flightData = {
            ...response.data,
            images: response.data.images || [],
            rating: response.data.rating || 0,
            available_seats: response.data.available_seats || 0,
            price: response.data.price || 0
          };
          
          console.log('Setting flight data:', flightData);
          setFlight(flightData);
          
          if (flightData.images.length > 0) {
            setSelectedImage(flightData.images[0]);
          } else {
            // Sử dụng hình ảnh mặc định nếu không có hình
            setSelectedImage('https://via.placeholder.com/400x300?text=No+Image');
          }
        } else {
          console.error('Invalid flight data received:', response.data);
          toast.error('Dữ liệu chuyến bay không hợp lệ');
          navigate('/flights');
        }
      } catch (error: any) {
        console.error('Error fetching flight details:', error);
        console.log('Error config:', error.config);
        
        let errorMessage = 'Không thể tải thông tin chi tiết chuyến bay';
        
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error response status:', error.response.status);
          
          if (error.response.status === 404) {
            errorMessage = 'Không tìm thấy chuyến bay';
          } else if (error.response.status === 400) {
            errorMessage = 'ID chuyến bay không hợp lệ';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = `${error.response.status} - ${error.response.data.message}`;
          }
        } else if (error.request) {
          console.error('Error request:', error.request);
          errorMessage = 'Không thể kết nối với server';
        }
        
        toast.error(errorMessage);
        navigate('/flights');
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
  }, [id, navigate]);

  const handleBooking = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để đặt vé');
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        loginModal.classList.remove('hidden');
      }
      return;
    }
    navigate(`/bookings/create`, { state: { flightId: flight?._id } });
  };

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
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Không tìm thấy thông tin chuyến bay</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
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
              <h1 className="text-3xl font-bold">{flight.airline}</h1>
              <div className="flex items-center mt-2">
                <FiMapPin className="mr-2" />
                <span>{flight.departure} → {flight.arrival}</span>
              </div>
            </div>
            <div className="flex items-center bg-white text-blue-600 px-3 py-1 rounded-full">
              <FiStar className="mr-1" />
              <span className="font-semibold">{flight.rating}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hình ảnh */}
            <div>
              <img
                src={selectedImage || (flight.images && flight.images.length > 0 ? flight.images[0] : '')}
                alt={flight.flight_name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {flight.images && flight.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {flight.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className={`h-20 rounded-lg overflow-hidden ${
                        selectedImage === image ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${flight.flight_name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Thông tin chính */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Thông tin chuyến bay</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <span className="text-blue-800 font-semibold">Số hiệu chuyến bay:</span>
                  <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {flight.flight_name}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FiDollarSign className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Giá vé</p>
                    <p className="text-xl font-semibold">{flight.price.toLocaleString('vi-VN')} VND</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiUsers className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Ghế còn trống</p>
                    <p className="text-lg font-medium">{flight.available_seats} ghế</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCalendar className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian khởi hành</p>
                    <p className="text-lg font-medium">
                      {formatDateTime(flight.departure_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCalendar className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian đến</p>
                    <p className="text-lg font-medium">
                      {formatDateTime(flight.arrival_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiClock className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian bay</p>
                    <p className="text-lg font-medium">
                      {calculateDuration(flight.departure_time, flight.arrival_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiBriefcase className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Hãng hàng không</p>
                    <p className="text-lg font-medium">{flight.airline}</p>
                  </div>
                </div>
              </div>

        <button
          onClick={handleBooking}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
        >
          Đặt vé ngay
        </button>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Thông tin hành trình</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="text-lg font-semibold text-blue-700">{flight.departure}</div>
                  <div className="text-gray-600">{formatDateTime(flight.departure_time)}</div>
                </div>
                
                <div className="flex flex-col items-center mb-4 md:mb-0">
                  <div className="text-gray-500 mb-2">{calculateDuration(flight.departure_time, flight.arrival_time)}</div>
                  <div className="relative w-full md:w-32 h-0.5 bg-gray-300">
                    <div className="absolute -top-2 left-0 w-2 h-2 rounded-full bg-blue-600"></div>
                    <div className="absolute -top-2 right-0 w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <div className="text-gray-500 mt-2">Bay thẳng</div>
                </div>
                
                <div>
                  <div className="text-lg font-semibold text-blue-700">{flight.arrival}</div>
                  <div className="text-gray-600">{formatDateTime(flight.arrival_time)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chính sách */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Lưu ý</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Có mặt tại sân bay ít nhất 2 giờ trước giờ khởi hành</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Mang theo giấy tờ tùy thân hợp lệ (CMND/CCCD/Hộ chiếu)</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Hành lý xách tay không quá 7kg và tuân theo quy định về kích thước</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Có thể đổi vé trước 24 giờ so với giờ khởi hành với phí đổi vé</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
