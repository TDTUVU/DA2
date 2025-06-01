import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { paymentService } from '../../services/payment.service';

interface PaymentMethodOption {
  id: string;
  name: string;
  logo: string;
  description: string;
}

const PaymentOptions: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'credit_card',
      name: 'Thẻ tín dụng/ghi nợ',
      logo: 'https://cdn-icons-png.flaticon.com/512/179/179457.png',
      description: 'Thanh toán an toàn với các thẻ Visa, Mastercard, JCB'
    },
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      logo: 'https://cdn-icons-png.flaticon.com/512/2830/2830289.png',
      description: 'Chuyển khoản trực tiếp đến tài khoản ngân hàng của chúng tôi'
    },
    {
      id: 'VNPay',
      name: 'Thanh toán qua VNPay',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png',
      description: 'Thanh toán nhanh chóng và an toàn qua cổng VNPay'
    }
  ];

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;
      
      try {
        setLoading(true);
        const bookingData = await bookingService.getBookingDetails(bookingId);
        setBooking(bookingData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi tải thông tin đặt chỗ');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod || !bookingId) {
      setError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (selectedMethod === 'VNPay') {
        // Xử lý thanh toán VNPay
        const response = await paymentService.createVNPayPayment(bookingId);
        
        // Chuyển hướng đến trang thanh toán VNPay
        window.location.href = response.paymentUrl;
      } else {
        // Xử lý các phương thức thanh toán khác
        const paymentData = {
          booking_id: bookingId,
          payment_method: selectedMethod
        };
        
        const paymentResult = await paymentService.createPayment(paymentData);
        
        // Chuyển hướng đến trang xác nhận thanh toán
        navigate(`/payment/confirmation/${paymentResult._id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi xử lý thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Chọn phương thức thanh toán</h2>
          
          {booking && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Thông tin đặt chỗ</h3>
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <p><span className="font-medium">Mã đặt chỗ:</span> {booking._id}</p>
                  <p>
                    <span className="font-medium">Loại dịch vụ:</span> {
                      booking.booking_type === 'hotel' ? 'Khách sạn' :
                      booking.booking_type === 'flight' ? 'Chuyến bay' : 'Tour du lịch'
                    }
                  </p>
                  <p>
                    <span className="font-medium">Chi tiết:</span> {
                      booking.hotel_id?.name || booking.flight_id?.flight_name || booking.tour_id?.tour_name || 'N/A'
                    }
                  </p>
                </div>
                <div className="md:text-right mt-4 md:mt-0">
                  <p><span className="font-medium">Ngày đặt:</span> {new Date(booking.created_at).toLocaleDateString('vi-VN')}</p>
                  <p><span className="font-medium">Số lượng khách:</span> {booking.guests}</p>
                  <p className="text-xl font-bold text-blue-600">{booking.total_amount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div 
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => handlePaymentMethodSelect(method.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img src={method.logo} alt={method.name} className="w-12 h-12 object-contain" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedMethod === method.id && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mt-6">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              onClick={handlePaymentSubmit}
              disabled={!selectedMethod || isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Thanh toán ngay'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions; 