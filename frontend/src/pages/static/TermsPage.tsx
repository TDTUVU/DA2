import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Điều Khoản & Điều Kiện</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Vui lòng đọc kỹ các điều khoản và điều kiện của chúng tôi trước khi sử dụng dịch vụ
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <div className="prose prose-blue max-w-none">
            <h2>1. Giới Thiệu</h2>
            <p>
              Chào mừng bạn đến với trang web du lịch của chúng tôi. Bằng việc truy cập hoặc sử dụng trang web này, bạn đồng ý tuân theo các điều khoản và điều kiện được mô tả dưới đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng trang web của chúng tôi.
            </p>

            <h2>2. Định Nghĩa</h2>
            <p>
              <strong>"Công ty"</strong> đề cập đến công ty du lịch của chúng tôi.
              <br />
              <strong>"Dịch vụ"</strong> đề cập đến các dịch vụ được cung cấp bởi công ty, bao gồm nhưng không giới hạn ở đặt tour, đặt phòng khách sạn, đặt vé máy bay.
              <br />
              <strong>"Khách hàng"</strong> đề cập đến bất kỳ cá nhân hoặc tổ chức nào sử dụng dịch vụ của công ty.
              <br />
              <strong>"Trang web"</strong> đề cập đến trang web du lịch của chúng tôi.
            </p>

            <h2>3. Đặt Tour và Thanh Toán</h2>
            <h3>3.1. Quy trình đặt tour</h3>
            <p>
              Khách hàng có thể đặt tour thông qua trang web, qua điện thoại hoặc tại văn phòng của công ty. Việc đặt tour chỉ được xác nhận sau khi khách hàng đã thanh toán đặt cọc hoặc toàn bộ giá trị tour theo quy định của từng tour.
            </p>

            <h3>3.2. Phương thức thanh toán</h3>
            <p>
              Chúng tôi chấp nhận các phương thức thanh toán sau:
            </p>
            <ul>
              <li>Thẻ tín dụng/ghi nợ (Visa, MasterCard, JCB)</li>
              <li>Chuyển khoản ngân hàng</li>
              <li>Ví điện tử (Momo, ZaloPay, VNPay)</li>
              <li>Tiền mặt (chỉ áp dụng khi thanh toán tại văn phòng)</li>
            </ul>

            <h3>3.3. Chính sách đặt cọc</h3>
            <p>
              Khi đặt tour, khách hàng cần thanh toán ít nhất 50% giá trị tour để xác nhận đặt chỗ. Số tiền còn lại phải được thanh toán ít nhất 7 ngày trước ngày khởi hành đối với tour trong nước và 14 ngày đối với tour quốc tế.
            </p>

            <h2>4. Chính Sách Hủy và Hoàn Tiền</h2>
            <h3>4.1. Tour trong nước</h3>
            <ul>
              <li>Hủy trước 15 ngày: Hoàn 100% tiền cọc</li>
              <li>Hủy từ 8-14 ngày: Hoàn 50% tiền cọc</li>
              <li>Hủy từ 4-7 ngày: Hoàn 25% tiền cọc</li>
              <li>Hủy từ 0-3 ngày: Không hoàn tiền</li>
            </ul>

            <h3>4.2. Tour quốc tế</h3>
            <ul>
              <li>Hủy trước 30 ngày: Hoàn 100% tiền cọc</li>
              <li>Hủy từ 15-29 ngày: Hoàn 50% tiền cọc</li>
              <li>Hủy từ 8-14 ngày: Hoàn 25% tiền cọc</li>
              <li>Hủy từ 0-7 ngày: Không hoàn tiền</li>
            </ul>

            <p>
              Lưu ý: Một số tour đặc biệt có thể có chính sách hủy riêng. Vui lòng kiểm tra thông tin chi tiết khi đặt tour.
            </p>

            <h2>5. Thay Đổi Lịch Trình</h2>
            <p>
              Công ty bảo lưu quyền thay đổi lịch trình tour nếu có các tình huống bất khả kháng như thời tiết xấu, thiên tai, đình công, bạo loạn, chiến tranh, dịch bệnh, thay đổi lịch bay của hãng hàng không, v.v. Trong những trường hợp này, công ty sẽ cố gắng cung cấp các dịch vụ thay thế có giá trị tương đương hoặc cao hơn. Nếu không thể cung cấp dịch vụ thay thế, công ty sẽ hoàn trả phần chênh lệch cho khách hàng.
            </p>

            <h2>6. Trách Nhiệm của Khách Hàng</h2>
            <p>
              Khách hàng có trách nhiệm:
            </p>
            <ul>
              <li>Cung cấp thông tin cá nhân chính xác khi đặt tour</li>
              <li>Tuân thủ luật pháp và quy định của địa phương nơi đến</li>
              <li>Tôn trọng phong tục, tập quán và văn hóa địa phương</li>
              <li>Bảo quản tài sản cá nhân trong suốt chuyến đi</li>
              <li>Mua bảo hiểm du lịch (đặc biệt cho các chuyến đi quốc tế)</li>
              <li>Chuẩn bị đầy đủ giấy tờ cần thiết (hộ chiếu, visa, giấy tờ tùy thân, v.v.)</li>
            </ul>

            <h2>7. Trách Nhiệm của Công Ty</h2>
            <p>
              Công ty có trách nhiệm:
            </p>
            <ul>
              <li>Cung cấp dịch vụ du lịch như đã cam kết</li>
              <li>Hỗ trợ khách hàng trong quá trình sử dụng dịch vụ</li>
              <li>Xử lý khiếu nại của khách hàng trong thời gian hợp lý</li>
              <li>Bảo mật thông tin cá nhân của khách hàng</li>
            </ul>

            <h2>8. Bảo Hiểm Du Lịch</h2>
            <p>
              Chúng tôi khuyến nghị tất cả khách hàng nên mua bảo hiểm du lịch để bảo vệ bản thân trong trường hợp khẩn cấp y tế, mất hành lý, hủy chuyến đi, v.v. Công ty có thể hỗ trợ khách hàng mua bảo hiểm du lịch với chi phí bổ sung.
            </p>

            <h2>9. Quyền Sở Hữu Trí Tuệ</h2>
            <p>
              Tất cả nội dung trên trang web của chúng tôi, bao gồm văn bản, hình ảnh, logo, và thiết kế, đều là tài sản của công ty hoặc được sử dụng với sự cho phép của chủ sở hữu. Việc sao chép, phân phối, hoặc sử dụng bất kỳ nội dung nào mà không có sự cho phép đều bị nghiêm cấm.
            </p>

            <h2>10. Chính Sách Bảo Mật</h2>
            <p>
              Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng. Thông tin chi tiết về cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân có thể được tìm thấy trong Chính sách Bảo mật của chúng tôi.
            </p>

            <h2>11. Luật Áp Dụng và Giải Quyết Tranh Chấp</h2>
            <p>
              Các điều khoản và điều kiện này được điều chỉnh bởi luật pháp Việt Nam. Bất kỳ tranh chấp nào phát sinh từ hoặc liên quan đến việc sử dụng dịch vụ của chúng tôi sẽ được giải quyết thông qua thương lượng. Nếu không thể giải quyết thông qua thương lượng, tranh chấp sẽ được đưa ra tòa án có thẩm quyền tại Việt Nam.
            </p>

            <h2>12. Thay Đổi Điều Khoản</h2>
            <p>
              Chúng tôi bảo lưu quyền thay đổi các điều khoản và điều kiện này vào bất kỳ lúc nào. Những thay đổi sẽ có hiệu lực ngay sau khi được đăng trên trang web của chúng tôi. Việc tiếp tục sử dụng trang web sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận những thay đổi đó.
            </p>

            <h2>13. Liên Hệ</h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi nào về các điều khoản và điều kiện này, vui lòng liên hệ với chúng tôi qua:
            </p>
            <ul>
              <li>Email: info@travelwebsite.com</li>
              <li>Điện thoại: +84 123 456 789</li>
              <li>Địa chỉ: 123 Đường ABC, Quận 1, TP. Hồ Chí Minh</li>
            </ul>

            <p className="mt-8 text-sm text-gray-500">
              Cập nhật lần cuối: Ngày 1 tháng 5 năm 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 