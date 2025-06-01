import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaHotel, FaMapMarkedAlt, FaStar } from 'react-icons/fa';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:w-3/5">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Khám Phá Những Điểm Đến Tuyệt Vời</h1>
            <p className="text-xl mb-8">Đặt chuyến đi mơ ước của bạn và tạo những kỷ niệm không thể quên cùng dịch vụ du lịch hàng đầu của chúng tôi</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/tours" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium flex items-center">
                <FaMapMarkedAlt className="mr-2" /> Khám phá tours
              </Link>
              <Link to="/hotels" className="bg-transparent hover:bg-white/10 border border-white px-6 py-3 rounded-lg font-medium flex items-center">
                <FaHotel className="mr-2" /> Tìm khách sạn
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}></div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Dịch Vụ Của Chúng Tôi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-blue-500 text-white rounded-full mb-4">
                <FaHotel size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Đặt Khách Sạn</h3>
              <p className="text-gray-600">Đặt phòng tại hàng nghìn khách sạn trên khắp thế giới với giá tốt nhất.</p>
              <Link to="/hotels" className="mt-4 inline-block text-blue-600 hover:underline">Xem khách sạn</Link>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-purple-500 text-white rounded-full mb-4">
                <FaPlane size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Đặt Chuyến Bay</h3>
              <p className="text-gray-600">Tìm và đặt vé máy bay với nhiều hãng hàng không khác nhau, giá cả cạnh tranh.</p>
              <Link to="/flights" className="mt-4 inline-block text-blue-600 hover:underline">Xem chuyến bay</Link>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-green-500 text-white rounded-full mb-4">
                <FaMapMarkedAlt size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tour Du Lịch</h3>
              <p className="text-gray-600">Tham gia các tour du lịch hấp dẫn với các hướng dẫn viên chuyên nghiệp.</p>
              <Link to="/tours" className="mt-4 inline-block text-blue-600 hover:underline">Xem tour</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Destinations */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Điểm Đến Nổi Bật</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">Khám phá những điểm đến tuyệt vời nhất mà khách hàng của chúng tôi yêu thích</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-300 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold">Đà Nẵng</div>
              </div>
              <div className="p-4">
                <div className="flex items-center text-yellow-500 mb-2">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  <span className="text-gray-600 ml-1 text-sm">(120 đánh giá)</span>
                </div>
                <p className="text-gray-600 text-sm">Thành phố biển tuyệt đẹp với nhiều điểm tham quan hấp dẫn</p>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-300 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold">Phú Quốc</div>
              </div>
              <div className="p-4">
                <div className="flex items-center text-yellow-500 mb-2">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  <span className="text-gray-600 ml-1 text-sm">(98 đánh giá)</span>
                </div>
                <p className="text-gray-600 text-sm">Hòn đảo thiên đường với bãi biển trong xanh và hoàng hôn tuyệt đẹp</p>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-300 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold">Hạ Long</div>
              </div>
              <div className="p-4">
                <div className="flex items-center text-yellow-500 mb-2">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  <span className="text-gray-600 ml-1 text-sm">(156 đánh giá)</span>
                </div>
                <p className="text-gray-600 text-sm">Vịnh biển đẹp kỳ vĩ được UNESCO công nhận là di sản thiên nhiên</p>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-300 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold">Đà Lạt</div>
              </div>
              <div className="p-4">
                <div className="flex items-center text-yellow-500 mb-2">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  <span className="text-gray-600 ml-1 text-sm">(87 đánh giá)</span>
                </div>
                <p className="text-gray-600 text-sm">Thành phố ngàn hoa với khí hậu mát mẻ quanh năm</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link to="/tours" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg">
              Xem tất cả điểm đến
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Khách Hàng Nói Gì Về Chúng Tôi</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center text-yellow-500 mb-4">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-gray-600 mb-4">"Dịch vụ tuyệt vời! Chuyến đi Đà Nẵng của gia đình tôi thật hoàn hảo nhờ sự tư vấn và hỗ trợ chuyên nghiệp."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium">Nguyễn Văn A</h4>
                  <p className="text-sm text-gray-500">Hà Nội</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center text-yellow-500 mb-4">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-gray-600 mb-4">"Khách sạn đẹp, giá tốt và dịch vụ hỗ trợ nhanh chóng. Tôi sẽ tiếp tục sử dụng dịch vụ của công ty trong tương lai."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium">Trần Thị B</h4>
                  <p className="text-sm text-gray-500">TP.HCM</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center text-yellow-500 mb-4">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-gray-600 mb-4">"Tour Phú Quốc 4 ngày 3 đêm thật tuyệt vời. Hướng dẫn viên nhiệt tình, lịch trình hợp lý và dịch vụ chu đáo."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium">Lê Văn C</h4>
                  <p className="text-sm text-gray-500">Đà Nẵng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Đăng Ký Nhận Thông Tin Khuyến Mãi</h2>
          <p className="mb-6 max-w-2xl mx-auto">Nhận thông tin về các ưu đãi đặc biệt, khuyến mãi và điểm đến mới nhất từ chúng tôi</p>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Nhập email của bạn" 
                className="flex-grow py-3 px-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300" 
              />
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg whitespace-nowrap">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage