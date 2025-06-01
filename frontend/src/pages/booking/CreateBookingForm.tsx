import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCalendar, FiUsers, FiCreditCard, FiArrowLeft } from 'react-icons/fi';

interface BookingData {
  booking_type: 'hotel' | 'flight' | 'tour';
  hotel_id?: string;
  flight_id?: string;
  tour_id?: string;
  check_in: string;
  check_out: string;
  guests: number;
  payment_method: string;
}

const CreateBookingForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    booking_type: 'hotel',
    check_in: '',
    check_out: '',
    guests: 1,
    payment_method: 'credit_card'
  });
  const [serviceDetails, setServiceDetails] = useState<any>(null);
  const [seatClass, setSeatClass] = useState<string>('economy');
  const [luggage, setLuggage] = useState<number>(20);
  const [roomType, setRoomType] = useState<string>('standard');
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [privateGuide, setPrivateGuide] = useState<boolean>(false);
  const [tourLanguage, setTourLanguage] = useState<string>('vietnamese');
  const [transportOption, setTransportOption] = useState<string>('group');

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const { hotelId, flightId, tourId } = location.state || {};
        let endpoint = '';
        let id = '';

        if (hotelId) {
          endpoint = '/api/hotels';
          id = hotelId;
          setBookingData(prev => ({ ...prev, booking_type: 'hotel', hotel_id: hotelId }));
        } else if (flightId) {
          endpoint = '/api/flights';
          id = flightId;
        } else if (tourId) {
          endpoint = '/api/tours';
          id = tourId;
          setBookingData(prev => ({ ...prev, booking_type: 'tour', tour_id: tourId }));
        }

        if (endpoint && id) {
          const response = await axios.get(`${endpoint}/${id}`);
          setServiceDetails(response.data);
          if (endpoint === '/api/flights') {
            setBookingData(prev => ({ ...prev, booking_type: 'flight', flight_id: response.data._id }));
          }
        } else {
          toast.error('Không có thông tin để đặt chỗ');
          navigate('/');
        }
      } catch (error) {
        toast.error('Không thể tải thông tin dịch vụ');
        navigate('/');
      }
    };

    fetchServiceDetails();
  }, [location.state, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) : value
    }));
  };

  const validateForm = () => {
    if (bookingData.booking_type === 'flight') {
      // Chỉ kiểm tra số lượng vé cho chuyến bay
      if (bookingData.guests < 1) {
        toast.error('Số lượng vé phải lớn hơn 0');
        return false;
      }
      
      // Kiểm tra giới hạn ghế còn trống
      if (serviceDetails.available_seats && bookingData.guests > serviceDetails.available_seats) {
        toast.error(`Chỉ còn ${serviceDetails.available_seats} ghế trống`);
        return false;
      }
    } else {
      // Kiểm tra cho hotel và tour
      if (!bookingData.check_in || !bookingData.check_out) {
        toast.error('Vui lòng chọn ngày check-in và check-out');
        return false;
      }

      if (new Date(bookingData.check_in) >= new Date(bookingData.check_out)) {
        toast.error('Ngày check-out phải sau ngày check-in');
        return false;
      }

      if (bookingData.guests < 1) {
        toast.error(bookingData.booking_type === 'hotel' ? 'Số lượng khách phải lớn hơn 0' : 'Số lượng người tham gia phải lớn hơn 0');
        return false;
      }
      
      // Kiểm tra giới hạn phòng hoặc chỗ còn trống
      if (bookingData.booking_type === 'hotel' && serviceDetails.available_rooms && bookingData.guests > serviceDetails.available_rooms) {
        toast.error(`Chỉ còn ${serviceDetails.available_rooms} phòng trống`);
        return false;
      } else if (bookingData.booking_type === 'tour' && serviceDetails.available_seats && bookingData.guests > serviceDetails.available_seats) {
        toast.error(`Chỉ còn ${serviceDetails.available_seats} chỗ trống`);
        return false;
      }
    }

    return true;
  };

  const calculateTicketPrice = () => {
    if (!serviceDetails || !serviceDetails.price) return 0;
    
    let price = serviceDetails.price;
    
    if (seatClass === 'business') {
      price *= 2.5;
    } else if (seatClass === 'premium') {
      price *= 1.5;
    }
    
    if (luggage > 20) {
      const extraLuggage = luggage - 20;
      const extraLuggageUnits = Math.ceil(extraLuggage / 10);
      price += price * 0.1 * extraLuggageUnits;
    }
    
    return price;
  };

  const calculateRoomPrice = () => {
    if (!serviceDetails || !serviceDetails.price_per_night) return 0;
    
    // Giá cơ bản
    let price = serviceDetails.price_per_night;
    
    // Phụ phí theo loại phòng
    if (roomType === 'deluxe') {
      price *= 1.5; // Phòng deluxe giá cao hơn 50%
    } else if (roomType === 'suite') {
      price *= 2; // Phòng suite giá cao hơn 100%
    }
    
    // Tính số ngày ở
    let numberOfDays = 1;
    if (bookingData.check_in && bookingData.check_out) {
      numberOfDays = Math.max(1, Math.ceil(
        (new Date(bookingData.check_out).getTime() - new Date(bookingData.check_in).getTime()) 
        / (1000 * 60 * 60 * 24)
      ));
    }
    
    // Phụ phí dịch vụ bổ sung
    additionalServices.forEach(service => {
      switch (service) {
        case 'breakfast':
          price += 50000; // Bữa sáng: 50.000 VND/người/ngày
          break;
        case 'airport_pickup':
          price += 200000 / numberOfDays; // Đón sân bay: 200.000 VND (chia đều cho số ngày)
          break;
        case 'spa':
          price += 100000; // Spa: 100.000 VND/người/ngày
          break;
      }
    });
    
    return price * numberOfDays;
  };

  const calculateTourPrice = () => {
    if (!serviceDetails || !serviceDetails.price_per_person) return 0;
    
    // Giá cơ bản
    let price = serviceDetails.price_per_person;
    
    // Phụ phí cho hướng dẫn viên riêng
    if (privateGuide) {
      price += 500000 / Math.max(1, bookingData.guests); // 500.000 VND chia đều cho số người
    }
    
    // Phụ phí cho ngôn ngữ hướng dẫn
    if (tourLanguage === 'english') {
      price *= 1.1; // Tiếng Anh +10%
    } else if (tourLanguage === 'other') {
      price *= 1.2; // Ngôn ngữ khác +20%
    }
    
    // Phụ phí cho phương tiện đi lại
    if (transportOption === 'private') {
      price += 300000 / Math.max(1, bookingData.guests); // 300.000 VND chia đều cho số người
    }
    
    return price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const bookingDataToSubmit = {
        ...bookingData,
        ...(bookingData.booking_type === 'flight' && {
          seat_class: seatClass,
          luggage: luggage,
          price_calculated: calculateTicketPrice() * bookingData.guests
        }),
        ...(bookingData.booking_type === 'hotel' && {
          room_type: roomType,
          additional_services: additionalServices,
          price_calculated: calculateRoomPrice() * bookingData.guests
        }),
        ...(bookingData.booking_type === 'tour' && {
          private_guide: privateGuide,
          tour_language: tourLanguage,
          transport_option: transportOption,
          price_calculated: calculateTourPrice() * bookingData.guests
        })
      };
      
      const response = await axios.post('/api/bookings', bookingDataToSubmit, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
      });

      toast.success('Đặt chỗ thành công!');
      navigate(`/bookings/${response.data.booking._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tạo booking');
    } finally {
      setLoading(false);
    }
  };

  if (!serviceDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Đặt chỗ</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thông tin dịch vụ */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Thông tin dịch vụ</h2>
            {bookingData.booking_type === 'hotel' && (
              <>
                <img
                  src={serviceDetails.images[0]}
                  alt={serviceDetails.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h3 className="text-lg font-medium">{serviceDetails.name}</h3>
                <p className="text-gray-600">{serviceDetails.location}</p>
                <p className="text-gray-600">Giá cơ bản: {serviceDetails.price_per_night?.toLocaleString()} VND/đêm</p>
                
                {bookingData.check_in && bookingData.check_out && (
                  <div className="mt-2 bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium">Chi tiết thanh toán:</p>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Loại phòng:</span>
                      <span>{roomType === 'standard' ? 'Tiêu chuẩn' : 
                            roomType === 'deluxe' ? 'Deluxe (+50%)' : 'Suite (+100%)'}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Số đêm:</span>
                      <span>{Math.ceil((new Date(bookingData.check_out).getTime() - new Date(bookingData.check_in).getTime()) / (1000 * 60 * 60 * 24))} đêm</span>
                    </div>
                    {additionalServices.length > 0 && (
                      <div className="flex justify-between text-sm mt-1">
                        <span>Dịch vụ bổ sung:</span>
                        <span>{additionalServices.map(service => 
                          service === 'breakfast' ? 'Bữa sáng' : 
                          service === 'airport_pickup' ? 'Đón sân bay' : 
                          service === 'spa' ? 'Spa' : ''
                        ).join(', ')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm mt-1">
                      <span>Số lượng khách:</span>
                      <span>{bookingData.guests} người</span>
                    </div>
                    <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-medium">
                      <span>Tổng cộng:</span>
                      <span>{(calculateRoomPrice() * bookingData.guests).toLocaleString()} VND</span>
                    </div>
                  </div>
                )}
              </>
            )}
            {bookingData.booking_type === 'flight' && (
              <>
                {serviceDetails.images && serviceDetails.images.length > 0 && (
                  <img
                    src={serviceDetails.images[0]}
                    alt={serviceDetails.flight_name}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <h3 className="text-lg font-medium">{serviceDetails.flight_name}</h3>
                <p className="text-gray-600">Từ: {serviceDetails.departure}</p>
                <p className="text-gray-600">Đến: {serviceDetails.arrival}</p>
                <p className="text-gray-600">Giá vé cơ bản: {serviceDetails.price?.toLocaleString()} VND</p>
                
                <div className="mt-2 bg-blue-50 p-3 rounded">
                  <p className="text-sm font-medium">Tổng chi phí:</p>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Giá vé {seatClass === 'economy' ? 'Phổ thông' : 
                           seatClass === 'premium' ? 'Phổ thông đặc biệt' : 'Thương gia'}:</span>
                    <span>{calculateTicketPrice().toLocaleString()} VND</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Hành lý ký gửi:</span>
                    <span>{luggage}kg</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Số lượng vé:</span>
                    <span>{bookingData.guests}</span>
                  </div>
                  <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-semibold">
                    <span>Tổng thanh toán:</span>
                    <span>{(calculateTicketPrice() * bookingData.guests).toLocaleString()} VND</span>
                  </div>
                </div>
              </>
            )}
            {bookingData.booking_type === 'tour' && (
              <>
                <img
                  src={serviceDetails.images[0]}
                  alt={serviceDetails.tour_name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h3 className="text-lg font-medium">{serviceDetails.tour_name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-1">{serviceDetails.description}</p>
                <p className="text-gray-600">Điểm đến: {serviceDetails.destination}</p>
                <p className="text-gray-600">Giá cơ bản: {serviceDetails.price_per_person?.toLocaleString()} VND/người</p>
                
                {bookingData.check_in && bookingData.check_out && (
                  <div className="mt-2 bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium">Chi tiết thanh toán:</p>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Ngày khởi hành:</span>
                      <span>{new Date(bookingData.check_in).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {privateGuide && (
                      <div className="flex justify-between text-sm mt-1">
                        <span>Hướng dẫn viên riêng:</span>
                        <span>+500.000 VND</span>
                      </div>
                    )}
                    {tourLanguage !== 'vietnamese' && (
                      <div className="flex justify-between text-sm mt-1">
                        <span>Ngôn ngữ: {tourLanguage === 'english' ? 'Tiếng Anh' : 'Ngôn ngữ khác'}</span>
                        <span>+{tourLanguage === 'english' ? '10%' : '20%'}</span>
                      </div>
                    )}
                    {transportOption === 'private' && (
                      <div className="flex justify-between text-sm mt-1">
                        <span>Đưa đón riêng:</span>
                        <span>+300.000 VND</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm mt-1">
                      <span>Số người tham gia:</span>
                      <span>{bookingData.guests} người</span>
                    </div>
                    <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-medium">
                      <span>Giá/người:</span>
                      <span>{calculateTourPrice().toLocaleString()} VND</span>
                    </div>
                    <div className="flex justify-between font-semibold text-blue-800">
                      <span>Tổng cộng:</span>
                      <span>{(calculateTourPrice() * bookingData.guests).toLocaleString()} VND</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Form đặt chỗ */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {bookingData.booking_type === 'flight' ? (
              // Form đặt chỗ cho chuyến bay
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2">
                        <span className="font-semibold">{serviceDetails.airline?.charAt(0) || 'V'}</span>
                      </div>
                      <span className="font-semibold">{serviceDetails.airline || 'VietAir'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {serviceDetails.flight_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Khởi hành</p>
                      <p className="font-medium text-lg">
                        {new Date(serviceDetails.departure_time).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm">{new Date(serviceDetails.departure_time).toLocaleDateString('vi-VN')}</p>
                      <p className="font-medium">{serviceDetails.departure}</p>
                    </div>
                    
                    <div className="flex flex-col items-center px-4">
                      <div className="text-xs text-gray-500 mb-1">
                        {(() => {
                          // Tính thời gian bay
                          try {
                            const departureTime = new Date(serviceDetails.departure_time);
                            const arrivalTime = new Date(serviceDetails.arrival_time);
                            const durationMs = arrivalTime.getTime() - departureTime.getTime();
                            const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                            const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                            return `${durationHours}h ${durationMinutes}m`;
                          } catch (error) {
                            return 'N/A';
                          }
                        })()}
                      </div>
                      <div className="w-24 h-px bg-gray-300 relative my-1">
                        <div className="absolute w-2 h-2 bg-gray-500 rounded-full -top-0.5 -left-1"></div>
                        <div className="absolute w-2 h-2 bg-gray-500 rounded-full -top-0.5 -right-1"></div>
                      </div>
                      <div className="text-xs text-gray-500">Bay thẳng</div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Đến</p>
                      <p className="font-medium text-lg">
                        {new Date(serviceDetails.arrival_time).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm">{new Date(serviceDetails.arrival_time).toLocaleDateString('vi-VN')}</p>
                      <p className="font-medium">{serviceDetails.arrival}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm border-t border-blue-200 pt-3">
                    <div>
                      <p className="text-gray-500">Hạng ghế</p>
                      <p className="font-medium">Phổ thông</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hành lý</p>
                      <p className="font-medium">20kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Còn trống</p>
                      <p className="font-medium">{serviceDetails.available_seats || '---'} ghế</p>
                    </div>
                  </div>
                </div>

                {/* Hidden fields for flight booking */}
                <input 
                  type="hidden" 
                  name="check_in" 
                  value={serviceDetails.departure_time || new Date().toISOString()} 
                />
                <input 
                  type="hidden" 
                  name="check_out" 
                  value={serviceDetails.arrival_time || new Date(new Date().getTime() + 24*60*60*1000).toISOString()} 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hạng ghế
                    </label>
                    <select
                      value={seatClass}
                      onChange={(e) => setSeatClass(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      aria-label="Chọn hạng ghế"
                      title="Chọn hạng ghế cho chuyến bay"
                    >
                      <option value="economy">Phổ thông</option>
                      <option value="premium">Phổ thông đặc biệt</option>
                      <option value="business">Thương gia</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hành lý ký gửi
                    </label>
                    <select
                      value={luggage}
                      onChange={(e) => setLuggage(parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      aria-label="Chọn hành lý ký gửi"
                      title="Chọn số kg hành lý ký gửi"
                    >
                      <option value="20">20kg (Tiêu chuẩn)</option>
                      <option value="30">30kg (+10%)</option>
                      <option value="40">40kg (+20%)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiUsers className="mr-2" />
                    Số lượng vé
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min={1}
                    max={serviceDetails.available_seats || 10}
                    required
                    aria-label="Số lượng vé"
                    title="Nhập số lượng vé"
                    placeholder="Nhập số lượng vé"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mt-2">
                  <p className="text-sm font-medium">Chi tiết giá:</p>
                  <div className="mt-1 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Giá vé cơ bản:</span>
                      <span>{serviceDetails.price?.toLocaleString()} VND</span>
                    </div>
                    {seatClass !== 'economy' && (
                      <div className="flex justify-between">
                        <span>Hạng ghế {seatClass === 'business' ? 'thương gia' : 'phổ thông đặc biệt'}:</span>
                        <span>+{seatClass === 'business' ? '150' : '50'}%</span>
                      </div>
                    )}
                    {luggage > 20 && (
                      <div className="flex justify-between">
                        <span>Hành lý thêm ({luggage - 20}kg):</span>
                        <span>+{Math.ceil((luggage - 20) / 10) * 10}%</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t border-blue-200 pt-1 mt-1">
                      <span>Giá vé sau điều chỉnh:</span>
                      <span>{calculateTicketPrice().toLocaleString()} VND</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>{bookingData.guests} vé:</span>
                      <span>{(calculateTicketPrice() * bookingData.guests).toLocaleString()} VND</span>
                    </div>
                  </div>
                </div>
              </>
            ) : bookingData.booking_type === 'hotel' ? (
              // Form đặt chỗ cho khách sạn
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2 text-center">Chi tiết khách sạn</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Check-in:</span>
                    <span className="text-sm">{serviceDetails.check_in_time || '14:00'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Check-out:</span>
                    <span className="text-sm">{serviceDetails.check_out_time || '12:00'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiCalendar className="mr-2" />
                    Ngày check-in
                  </label>
                  <input
                    type="date"
                    name="check_in"
                    value={bookingData.check_in}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    aria-label="Ngày check-in"
                    title="Chọn ngày check-in"
                    placeholder="Chọn ngày check-in"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiCalendar className="mr-2" />
                    Ngày check-out
                  </label>
                  <input
                    type="date"
                    name="check_out"
                    value={bookingData.check_out}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    min={bookingData.check_in || new Date().toISOString().split('T')[0]}
                    aria-label="Ngày check-out"
                    title="Chọn ngày check-out"
                    placeholder="Chọn ngày check-out"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại phòng
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    aria-label="Chọn loại phòng"
                    title="Chọn loại phòng khách sạn"
                  >
                    <option value="standard">Tiêu chuẩn</option>
                    <option value="deluxe">Deluxe (+50%)</option>
                    <option value="suite">Suite (+100%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dịch vụ bổ sung
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="breakfast"
                        checked={additionalServices.includes('breakfast')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdditionalServices([...additionalServices, 'breakfast']);
                          } else {
                            setAdditionalServices(additionalServices.filter(s => s !== 'breakfast'));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="breakfast" className="ml-2 text-sm text-gray-700">
                        Bữa sáng (+50.000 VND/người/ngày)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="airport_pickup"
                        checked={additionalServices.includes('airport_pickup')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdditionalServices([...additionalServices, 'airport_pickup']);
                          } else {
                            setAdditionalServices(additionalServices.filter(s => s !== 'airport_pickup'));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="airport_pickup" className="ml-2 text-sm text-gray-700">
                        Đón sân bay (+200.000 VND/lượt)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="spa"
                        checked={additionalServices.includes('spa')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdditionalServices([...additionalServices, 'spa']);
                          } else {
                            setAdditionalServices(additionalServices.filter(s => s !== 'spa'));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="spa" className="ml-2 text-sm text-gray-700">
                        Dịch vụ spa (+100.000 VND/người/ngày)
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiUsers className="mr-2" />
                    Số lượng khách
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min={1}
                    max={serviceDetails.available_rooms || 10}
                    required
                    aria-label="Số lượng khách"
                    title="Nhập số lượng khách"
                    placeholder="Nhập số lượng khách"
                  />
                </div>
              </>
            ) : (
              // Form đặt chỗ cho tour
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2 text-center">Chi tiết tour</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Thời gian:</span>
                    <span className="text-sm">{serviceDetails.duration || '3 ngày 2 đêm'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Khởi hành từ:</span>
                    <span className="text-sm">{serviceDetails.departure_location || 'Chưa xác định'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiCalendar className="mr-2" />
                    Ngày bắt đầu tour
                  </label>
                  <input
                    type="date"
                    name="check_in"
                    value={bookingData.check_in}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    aria-label="Ngày bắt đầu tour"
                    title="Chọn ngày bắt đầu tour"
                    placeholder="Chọn ngày bắt đầu tour"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiCalendar className="mr-2" />
                    Ngày kết thúc tour
                  </label>
                  <input
                    type="date"
                    name="check_out"
                    value={bookingData.check_out}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    min={bookingData.check_in || new Date().toISOString().split('T')[0]}
                    aria-label="Ngày kết thúc tour"
                    title="Chọn ngày kết thúc tour"
                    placeholder="Chọn ngày kết thúc tour"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngôn ngữ hướng dẫn
                    </label>
                    <select
                      value={tourLanguage}
                      onChange={(e) => setTourLanguage(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      aria-label="Chọn ngôn ngữ hướng dẫn"
                      title="Chọn ngôn ngữ hướng dẫn tour"
                    >
                      <option value="vietnamese">Tiếng Việt (Mặc định)</option>
                      <option value="english">Tiếng Anh (+10%)</option>
                      <option value="other">Ngôn ngữ khác (+20%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phương tiện di chuyển
                    </label>
                    <select
                      value={transportOption}
                      onChange={(e) => setTransportOption(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      aria-label="Chọn phương tiện di chuyển"
                      title="Chọn phương tiện di chuyển trong tour"
                    >
                      <option value="group">Đưa đón theo nhóm (Mặc định)</option>
                      <option value="private">Đưa đón riêng (+300.000 VND)</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="private_guide"
                      checked={privateGuide}
                      onChange={(e) => setPrivateGuide(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="private_guide" className="ml-2 text-sm text-gray-700">
                      Hướng dẫn viên riêng (+500.000 VND)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiUsers className="mr-2" />
                    Số người tham gia
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min={1}
                    max={serviceDetails.available_seats || 10}
                    required
                    aria-label="Số người tham gia"
                    title="Nhập số người tham gia"
                    placeholder="Nhập số người tham gia"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiCreditCard className="mr-2" />
                Phương thức thanh toán
              </label>
              <select
                name="payment_method"
                value={bookingData.payment_method}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
                aria-label="Phương thức thanh toán"
                title="Chọn phương thức thanh toán"
              >
                <option value="credit_card">Thẻ tín dụng</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>
                    Xác nhận đặt chỗ
                    {bookingData.booking_type === 'flight' && ` - ${(calculateTicketPrice() * bookingData.guests).toLocaleString()} VND`}
                    {bookingData.booking_type === 'hotel' && ` - ${(calculateRoomPrice() * bookingData.guests).toLocaleString()} VND`}
                    {bookingData.booking_type === 'tour' && ` - ${(calculateTourPrice() * bookingData.guests).toLocaleString()} VND`}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBookingForm;
