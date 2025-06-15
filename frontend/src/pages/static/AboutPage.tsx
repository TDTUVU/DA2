import React from 'react';
import { FaUsers, FaGlobe, FaHandshake, FaShieldAlt } from 'react-icons/fa';
// @ts-ignore
import team1 from '../../assets/6.jpg';
// @ts-ignore
import team2 from '../../assets/7.jpg';
// @ts-ignore
import team3 from '../../assets/8.jpg';
// @ts-ignore
import team4 from '../../assets/9.jpg';
// @ts-ignore
import aboutBg from '../../assets/10.jpg';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Về Chúng Tôi</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Chúng tôi là công ty du lịch hàng đầu Việt Nam, mang đến những trải nghiệm du lịch tuyệt vời cho khách hàng từ năm 2010
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex items-center gap-12">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <img src={aboutBg} alt="Về chúng tôi" className="w-full h-96 object-cover rounded-xl" />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Câu Chuyện Của Chúng Tôi</h2>
              <p className="text-gray-600 mb-4">
                Công ty du lịch của chúng tôi được thành lập vào năm 2010 với mong muốn mang đến những trải nghiệm du lịch tuyệt vời và đáng nhớ cho mọi khách hàng. 
                Chúng tôi tin rằng mỗi chuyến đi không chỉ là một kỳ nghỉ mà còn là cơ hội để khám phá, học hỏi và tạo nên những kỷ niệm quý giá.
              </p>
              <p className="text-gray-600 mb-4">
                Với đội ngũ nhân viên giàu kinh nghiệm và đam mê, chúng tôi luôn cố gắng cung cấp dịch vụ chất lượng cao và tư vấn tận tâm 
                để đảm bảo mỗi khách hàng có được trải nghiệm tốt nhất trong khả năng của mình.
              </p>
              <p className="text-gray-600">
                Từ những tour du lịch trong nước đến các chuyến đi quốc tế, từ đặt phòng khách sạn đến vé máy bay, 
                chúng tôi luôn sẵn sàng hỗ trợ và đồng hành cùng bạn trên mọi hành trình.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Giá Trị Cốt Lõi</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Những giá trị định hướng mọi hoạt động kinh doanh và phục vụ khách hàng của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                <FaUsers size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Khách Hàng Là Trọng Tâm</h3>
              <p className="text-gray-600">Chúng tôi luôn đặt nhu cầu và sự hài lòng của khách hàng lên hàng đầu</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <FaGlobe size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Du Lịch Bền Vững</h3>
              <p className="text-gray-600">Cam kết phát triển du lịch bền vững, tôn trọng môi trường và cộng đồng địa phương</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full mb-4">
                <FaHandshake size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trách Nhiệm</h3>
              <p className="text-gray-600">Chúng tôi luôn thực hiện đúng cam kết và chịu trách nhiệm cho mọi dịch vụ cung cấp</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mb-4">
                <FaShieldAlt size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất Lượng</h3>
              <p className="text-gray-600">Không ngừng nâng cao chất lượng dịch vụ và trải nghiệm cho khách hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Đội Ngũ Của Chúng Tôi</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Những người luôn nỗ lực mỗi ngày để mang đến trải nghiệm du lịch tuyệt vời nhất cho khách hàng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <img src={team1} alt="Nguyễn Văn A" className="h-64 w-full object-cover rounded-xl mb-4" />
              <h3 className="text-xl font-semibold">Nguyễn Văn Đức</h3>
              <p className="text-blue-600">Giám đốc điều hành</p>
            </div>
            <div className="text-center">
              <img src={team2} alt="Trần Thị B" className="h-64 w-full object-cover rounded-xl mb-4" />
              <h3 className="text-xl font-semibold">Trần Thị Thùy Dung</h3>
              <p className="text-blue-600">Giám đốc marketing</p>
            </div>
            <div className="text-center">
              <img src={team3} alt="Lê Văn C" className="h-64 w-full object-cover rounded-xl mb-4" />
              <h3 className="text-xl font-semibold">Lê Văn Đô</h3>
              <p className="text-blue-600">Trưởng phòng tour</p>
            </div>
            <div className="text-center">
              <img src={team4} alt="Phạm Thị D" className="h-64 w-full object-cover rounded-xl mb-4" />
              <h3 className="text-xl font-semibold">Phạm Thị Bích</h3>
              <p className="text-blue-600">Trưởng phòng chăm sóc khách hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Hãy Bắt Đầu Chuyến Đi Của Bạn Ngay Hôm Nay</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn lên kế hoạch cho chuyến đi tiếp theo. Liên hệ ngay để được tư vấn miễn phí!
          </p>
          <button className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg">
            Liên hệ ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 