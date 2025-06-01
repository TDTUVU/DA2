import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Về chúng tôi</h3>
            <p className="text-gray-300">
              Chúng tôi cung cấp dịch vụ đặt phòng khách sạn, vé máy bay và tour du lịch chất lượng cao.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/hotels" className="text-gray-300 hover:text-white">
                  Khách sạn
                </Link>
              </li>
              <li>
                <Link to="/flights" className="text-gray-300 hover:text-white">
                  Chuyến bay
                </Link>
              </li>
              <li>
                <Link to="/tours" className="text-gray-300 hover:text-white">
                  Tour
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: support@travel.com</li>
              <li>Phone: (84) 123-456-789</li>
              <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; 2024 Travel Website. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer