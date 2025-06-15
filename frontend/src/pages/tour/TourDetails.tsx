import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiMapPin, FiStar, FiDollarSign, FiUsers, FiCalendar,
  FiArrowLeft, FiCheckCircle, FiClock, FiImage, FiList,
  FiX, FiPlus, FiMinus
} from 'react-icons/fi';

interface TourDetails {
  _id: string;
  tour_name: string;
  description: string;
  price_per_person: number;
  available_seats: number;
  duration: string;
  departure_location: string;
  destination: string;
  departure_time: string;
  itinerary: string[];
  inclusions: string[];
  exclusions: string[];
  images: string[];
  rating: number;
  policies: string[];
  highlights: string[];
  requirements: string[];
}

const TourDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<TourDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions' | 'exclusions'>('itinerary');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Component mounted with ID:', id);
    const fetchTourDetails = async () => {
      if (!id) {
        console.error('Tour ID is missing');
        toast.error('Không tìm thấy ID tour');
        navigate('/tours');
        return;
      }

      try {
        console.log('Fetching tour details for ID:', id);
        
        const response = await axios.get(`/api/tours/${id}`);
        console.log('Tour data received:', response.data);
        
        if (response.data && response.data._id) {
          setTour(response.data);
          if (response.data.images && response.data.images.length > 0) {
            setSelectedImage(response.data.images[0]);
          }
        } else {
          console.error('Invalid tour data received:', response.data);
          toast.error('Dữ liệu tour không hợp lệ');
          navigate('/tours');
        }
      } catch (error: any) {
        console.error('Error fetching tour details:', error);
        let errorMessage = 'Không thể tải thông tin chi tiết tour';
        
        if (error.response) {
          console.error('Error response:', error.response.data);
          
          if (error.response.status === 404) {
            errorMessage = 'Không tìm thấy tour';
          } else if (error.response.status === 400) {
            errorMessage = 'ID tour không hợp lệ';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        
        toast.error(errorMessage);
        navigate('/tours');
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [id, navigate]);

  const handleBooking = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để đặt tour');
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        loginModal.classList.remove('hidden');
      }
      return;
    }
    navigate(`/bookings/create`, { state: { tourId: tour?._id } });
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

  if (!tour) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Không tìm thấy thông tin tour</p>
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
              <h1 className="text-3xl font-bold">{tour.tour_name}</h1>
              <div className="flex items-center mt-2">
                <FiMapPin className="mr-2" />
                <span>{tour.destination}</span>
              </div>
            </div>
            <div className="flex items-center bg-white text-blue-600 px-3 py-1 rounded-full">
              <FiStar className="mr-1" />
              <span className="font-semibold">{tour.rating}</span>
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
                alt={tour.tour_name}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {tour.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`h-20 rounded-lg overflow-hidden ${
                      selectedImage === image ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${tour.tour_name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Thông tin chính */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Thông tin tour</h2>
              <p className="text-gray-600 mb-6">{tour.description}</p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FiDollarSign className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Giá tour</p>
                    <p className="text-xl font-semibold">{tour.price_per_person.toLocaleString('vi-VN')} VND/người</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiUsers className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Số chỗ còn trống</p>
                    <p className="text-lg font-medium">{tour.available_seats} chỗ</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiMapPin className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Khởi hành từ</p>
                    <p className="text-lg font-medium">{tour.departure_location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCalendar className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày khởi hành</p>
                    <p className="text-lg font-medium">{formatDateTime(tour.departure_time)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiClock className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Thời lượng</p>
                    <p className="text-lg font-medium">{tour.duration}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                Đặt tour ngay
              </button>
            </div>
          </div>

          {/* Chi tiết tour */}
          <div className="mt-8">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'itinerary'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lịch trình
              </button>
              <button
                onClick={() => setActiveTab('inclusions')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'inclusions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bao gồm
              </button>
              <button
                onClick={() => setActiveTab('exclusions')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'exclusions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Không bao gồm
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              {activeTab === 'itinerary' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Lịch trình tour</h3>
                  <ul className="space-y-4">
                    {tour.itinerary && tour.itinerary.length > 0 ? (
                      tour.itinerary.map((item, index) => (
                        <li key={index} className="flex">
                          <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <p>{item}</p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500">Không có thông tin lịch trình</p>
                    )}
                  </ul>
                </div>
              )}

              {activeTab === 'inclusions' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bao gồm trong giá tour</h3>
                  <ul className="space-y-2">
                    {tour.inclusions && tour.inclusions.length > 0 ? (
                      tour.inclusions.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500">Không có thông tin</p>
                    )}
                  </ul>
                </div>
              )}

              {activeTab === 'exclusions' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Không bao gồm trong giá tour</h3>
                  <ul className="space-y-2">
                    {tour.exclusions && tour.exclusions.length > 0 ? (
                      tour.exclusions.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <FiX className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500">Không có thông tin</p>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Các điểm nổi bật */}
          {tour.highlights && tour.highlights.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Điểm nổi bật</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tour.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start bg-blue-50 p-4 rounded-lg">
                    <FiCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yêu cầu */}
          {tour.requirements && tour.requirements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Yêu cầu</h2>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <ul className="space-y-2">
                  {tour.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-yellow-600 mt-1 mr-2 flex-shrink-0" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Chính sách */}
          {tour.policies && tour.policies.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Chính sách</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="space-y-2">
                  {tour.policies.map((policy, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-gray-600 mt-1 mr-2 flex-shrink-0" />
                      <span>{policy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
