import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiMapPin, FiStar, FiDollarSign, FiUsers, FiCalendar,
  FiArrowLeft, FiCheckCircle, FiWifi, FiCoffee, FiHome,
  FiUmbrella, FiTv, FiWind
} from 'react-icons/fi';

interface HotelDetails {
  _id: string;
  name: string;
  location: string;
  price_per_night: number;
  available_rooms: number;
  amenities: string[];
  images: string[];
  rating: number;
  description: string;
  check_in_time: string;
  check_out_time: string;
  policies: string[];
}

const HotelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Component mounted with ID:', id); // Debug component mount
    const fetchHotelDetails = async () => {
      if (!id) {
        console.error('Hotel ID is missing');
        toast.error('Không tìm thấy ID khách sạn');
        navigate('/hotels');
        return;
      }

      try {
        console.log('Fetching hotel details for ID:', id);
        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/hotels/${id}?t=${timestamp}`);
        console.log('Hotel data received:', response.data);
        
        if (response.data && response.data._id) {
          // Đảm bảo các trường cần thiết luôn có
          const hotelData = {
            ...response.data,
            amenities: response.data.amenities || [],
            images: response.data.images || [],
            policies: response.data.policies || [],
            description: response.data.description || 'Không có mô tả',
            check_in_time: response.data.check_in_time || '14:00',
            check_out_time: response.data.check_out_time || '12:00'
          };
          
          console.log('Setting hotel data:', hotelData);
          setHotel(hotelData);
          
          if (hotelData.images.length > 0) {
            setSelectedImage(hotelData.images[0]);
          } else {
            // Sử dụng hình ảnh mặc định nếu không có hình
            setSelectedImage('https://via.placeholder.com/400x300?text=No+Image');
          }
        } else {
          console.error('Invalid hotel data received:', response.data);
          toast.error('Dữ liệu khách sạn không hợp lệ');
          navigate('/hotels');
        }
      } catch (error: any) {
        console.error('Error fetching hotel details:', error);
        console.log('Error config:', error.config);
        
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error response status:', error.response.status);
          toast.error(`Không thể tải thông tin chi tiết khách sạn: ${error.response.status} - ${error.response.data.message || 'Lỗi không xác định'}`);
        } else if (error.request) {
          console.error('Error request:', error.request);
          toast.error('Không thể kết nối với server');
        } else {
          toast.error('Không thể tải thông tin chi tiết khách sạn');
        }
        navigate('/hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id, navigate]);

  // Debug render
  console.log('Current state:', { loading, hotel, selectedImage });

  const handleBooking = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để đặt phòng');
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        loginModal.classList.remove('hidden');
      }
      return;
    }
    navigate(`/bookings/create`, { state: { hotelId: hotel?._id } });
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <FiWifi className="text-blue-600" />;
      case 'breakfast':
        return <FiCoffee className="text-orange-600" />;
      case 'parking':
        return <FiHome className="text-gray-600" />;
      case 'pool':
        return <FiUmbrella className="text-blue-500" />;
      case 'gym':
        return <FiUmbrella className="text-red-500" />;
      case 'tv':
        return <FiTv className="text-purple-600" />;
      case 'air conditioning':
        return <FiWind className="text-green-600" />;
      default:
        return <FiCheckCircle className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Không tìm thấy thông tin khách sạn</p>
      </div>
    );
  }

  // Debug before render
  console.log('Rendering hotel details:', hotel);

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
              <h1 className="text-3xl font-bold">{hotel.name}</h1>
              <div className="flex items-center mt-2">
                <FiMapPin className="mr-2" />
                <span>{hotel.location}</span>
              </div>
            </div>
            <div className="flex items-center bg-white text-blue-600 px-3 py-1 rounded-full">
              <FiStar className="mr-1" />
              <span className="font-semibold">{hotel.rating}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={selectedImage}
                alt={hotel.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {hotel.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`h-20 rounded-lg overflow-hidden ${
                      selectedImage === image ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${hotel.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Thông tin chính */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Thông tin khách sạn</h2>
              <p className="text-gray-600 mb-6">{hotel.description}</p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FiDollarSign className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Giá mỗi đêm</p>
                    <p className="text-xl font-semibold">{hotel.price_per_night.toLocaleString()} VND</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiUsers className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Phòng còn trống</p>
                    <p className="text-lg font-medium">{hotel.available_rooms} phòng</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCalendar className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian check-in/out</p>
                    <p className="text-lg font-medium">
                      {hotel.check_in_time} - {hotel.check_out_time}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                Đặt phòng ngay
              </button>
            </div>
          </div>

          {/* Tiện nghi */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Tiện nghi</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotel.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  {getAmenityIcon(amenity)}
                  <span className="ml-2">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chính sách */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Chính sách</h2>
            <div className="space-y-2">
              {hotel.policies.map((policy, index) => (
                <div key={index} className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2" />
                  <p>{policy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
