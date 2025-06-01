import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqItems: FaqItem[] = [
    {
      question: 'Làm thế nào để đặt tour du lịch?',
      answer: 'Bạn có thể đặt tour du lịch trực tiếp trên trang web của chúng tôi. Chỉ cần truy cập vào mục "Tours", chọn tour phù hợp và làm theo hướng dẫn đặt tour. Ngoài ra, bạn cũng có thể liên hệ với chúng tôi qua điện thoại hoặc email để được hỗ trợ đặt tour.',
      category: 'booking',
    },
    {
      question: 'Tôi có thể thanh toán bằng những phương thức nào?',
      answer: 'Chúng tôi chấp nhận nhiều phương thức thanh toán khác nhau bao gồm thẻ tín dụng/ghi nợ (Visa, MasterCard, JCB), chuyển khoản ngân hàng, ví điện tử (Momo, ZaloPay, VNPay) và thanh toán tiền mặt tại văn phòng của chúng tôi.',
      category: 'payment',
    },
    {
      question: 'Làm thế nào để hủy hoặc thay đổi lịch trình tour?',
      answer: 'Để hủy hoặc thay đổi lịch trình tour, bạn cần liên hệ với chúng tôi ít nhất 3 ngày trước ngày khởi hành. Việc hoàn tiền sẽ tùy thuộc vào chính sách hủy tour của từng tour cụ thể. Chi tiết về chính sách hủy tour có thể được tìm thấy trong mục "Điều khoản & Điều kiện".',
      category: 'booking',
    },
    {
      question: 'Tôi có cần visa để đi du lịch không?',
      answer: 'Yêu cầu visa phụ thuộc vào quốc tịch của bạn và quốc gia bạn dự định đến. Chúng tôi cung cấp thông tin về yêu cầu visa trên trang thông tin chi tiết của mỗi tour quốc tế. Ngoài ra, chúng tôi cũng có dịch vụ hỗ trợ xin visa với chi phí bổ sung.',
      category: 'travel',
    },
    {
      question: 'Tôi có thể đặt phòng khách sạn mà không cần đặt tour không?',
      answer: 'Có, bạn có thể đặt phòng khách sạn riêng mà không cần đặt tour. Chỉ cần truy cập vào mục "Khách sạn" trên trang web của chúng tôi và thực hiện đặt phòng theo nhu cầu của bạn.',
      category: 'hotel',
    },
    {
      question: 'Có giảm giá cho trẻ em và người cao tuổi không?',
      answer: 'Có, chúng tôi có giảm giá cho trẻ em dưới 12 tuổi và người cao tuổi trên 60 tuổi. Mức giảm giá cụ thể sẽ phụ thuộc vào từng tour và dịch vụ.',
      category: 'pricing',
    },
    {
      question: 'Tôi có cần mua bảo hiểm du lịch không?',
      answer: 'Chúng tôi khuyến nghị bạn nên mua bảo hiểm du lịch cho mọi chuyến đi, đặc biệt là các chuyến đi quốc tế. Bảo hiểm du lịch sẽ bảo vệ bạn trong trường hợp khẩn cấp y tế, mất hành lý hoặc hủy chuyến đi. Chúng tôi có cung cấp dịch vụ bảo hiểm du lịch với nhiều gói khác nhau để bạn lựa chọn.',
      category: 'travel',
    },
    {
      question: 'Tôi nên mang theo những gì khi đi du lịch?',
      answer: 'Danh sách đồ cần mang sẽ phụ thuộc vào điểm đến và thời gian du lịch của bạn. Tuy nhiên, một số vật dụng cơ bản bao gồm: hộ chiếu/CMND, tiền mặt và thẻ tín dụng, bảo hiểm du lịch, quần áo phù hợp với thời tiết, thuốc cá nhân, đồ vệ sinh cá nhân và thiết bị điện tử cần thiết. Chúng tôi sẽ cung cấp danh sách đồ cần mang chi tiết khi bạn đặt tour.',
      category: 'travel',
    },
    {
      question: 'Làm thế nào để tôi biết lịch trình chi tiết của tour?',
      answer: 'Lịch trình chi tiết của tour sẽ được hiển thị trên trang thông tin chi tiết của mỗi tour. Ngoài ra, sau khi đặt tour, chúng tôi sẽ gửi lịch trình chi tiết qua email cho bạn. Đối với các tour tự thiết kế, lịch trình sẽ được tạo ra dựa trên yêu cầu của bạn.',
      category: 'booking',
    },
    {
      question: 'Tôi có thể yêu cầu một chế độ ăn đặc biệt không?',
      answer: 'Có, bạn có thể yêu cầu chế độ ăn đặc biệt như ăn chay, ăn kiêng, không gluten, v.v. Vui lòng thông báo cho chúng tôi khi đặt tour hoặc ít nhất 3 ngày trước ngày khởi hành để chúng tôi có thể sắp xếp phù hợp.',
      category: 'travel',
    },
    {
      question: 'Có bao nhiêu khách trong một nhóm tour?',
      answer: 'Số lượng khách trong một nhóm tour phụ thuộc vào loại tour. Tour ghép thường có từ 10-20 khách, trong khi tour riêng sẽ phụ thuộc vào số lượng người mà bạn đặt. Chúng tôi cũng có các tour nhóm nhỏ với tối đa 8-10 khách để đảm bảo trải nghiệm cá nhân hóa hơn.',
      category: 'booking',
    },
    {
      question: 'Nếu chuyến bay bị hoãn hoặc hủy thì sao?',
      answer: 'Nếu chuyến bay của bạn bị hoãn hoặc hủy, chúng tôi sẽ hỗ trợ bạn sắp xếp lại lịch trình hoặc đặt chuyến bay thay thế. Trong trường hợp không thể sắp xếp lại, chúng tôi sẽ áp dụng chính sách hoàn tiền theo quy định của hãng hàng không và điều khoản của chúng tôi.',
      category: 'flight',
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filterFaq = () => {
    if (activeCategory === 'all') return faqItems;
    return faqItems.filter(item => item.category === activeCategory);
  };

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'booking', name: 'Đặt tour' },
    { id: 'payment', name: 'Thanh toán' },
    { id: 'travel', name: 'Du lịch' },
    { id: 'hotel', name: 'Khách sạn' },
    { id: 'flight', name: 'Chuyến bay' },
    { id: 'pricing', name: 'Giá cả' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Câu Hỏi Thường Gặp</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Tìm câu trả lời cho những câu hỏi phổ biến về dịch vụ du lịch của chúng tôi
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full py-3 px-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          {filterFaq().map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className={`w-full text-left p-4 flex justify-between items-center rounded-lg ${
                  openIndex === index ? 'bg-blue-50 rounded-b-none' : 'bg-white'
                } shadow-sm hover:bg-blue-50 transition-colors`}
                onClick={() => toggleAccordion(index)}
              >
                <span className="font-medium">{faq.question}</span>
                <span className="ml-4 flex-shrink-0">
                  {openIndex === index ? <FaMinus className="text-blue-600" /> : <FaPlus className="text-blue-600" />}
                </span>
              </button>
              {openIndex === index && (
                <div className="bg-blue-50 p-4 rounded-b-lg shadow-sm">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Vẫn chưa tìm thấy câu trả lời?</h2>
          <p className="text-gray-600 mb-6">
            Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, vui lòng liên hệ với đội ngũ hỗ trợ khách hàng của chúng tôi
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Liên hệ hỗ trợ
            </button>
            <button className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Gửi câu hỏi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage; 