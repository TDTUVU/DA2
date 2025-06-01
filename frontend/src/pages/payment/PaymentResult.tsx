import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/payment.service';

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { paymentId } = useParams<{ paymentId: string }>();
  const status = searchParams.get('status');
  const navigate = useNavigate();
  
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentResult = async () => {
      // Nếu có paymentId trong URL, sử dụng nó
      // Nếu không, sử dụng paymentId từ searchParams
      const id = paymentId || searchParams.get('paymentId');
      
      if (!id) {
        setError('Không tìm thấy thông tin thanh toán');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const paymentData = await paymentService.getPaymentResult(id);
        setPayment(paymentData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi tải kết quả thanh toán');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentResult();
  }, [paymentId, searchParams]);

  const getStatusInfo = () => {
    // Ưu tiên sử dụng status từ payment object nếu có
    const paymentStatus = payment?.payment_status || status;
    
    switch (paymentStatus) {
      case 'Paid':
        return {
          title: 'Thanh toán thành công',
          message: 'Cảm ơn bạn đã đặt dịch vụ. Thông tin đặt chỗ của bạn đã được xác nhận.',
          icon: 'check-circle',
          color: 'green'
        };
      case 'Failed':
        return {
          title: 'Thanh toán thất bại',
          message: 'Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại sau.',
          icon: 'x-circle',
          color: 'red'
        };
      case 'Pending':
        return {
          title: 'Đang xử lý thanh toán',
          message: 'Giao dịch của bạn đang được xử lý. Vui lòng chờ trong giây lát.',
          icon: 'clock',
          color: 'yellow'
        };
      case 'error':
        return {
          title: 'Đã xảy ra lỗi',
          message: 'Có lỗi xảy ra trong quá trình xử lý thanh toán. Vui lòng liên hệ với chúng tôi để được hỗ trợ.',
          icon: 'exclamation-circle',
          color: 'red'
        };
      default:
        return {
          title: 'Trạng thái không xác định',
          message: 'Không thể xác định trạng thái thanh toán. Vui lòng kiểm tra lại sau.',
          icon: 'question-mark-circle',
          color: 'gray'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleViewBookingDetails = () => {
    if (payment && payment.booking_id) {
      navigate(`/booking/details/${payment.booking_id._id}`);
    }
  };

  const renderIcon = () => {
    switch (statusInfo.icon) {
      case 'check-circle':
        return (
          <svg className="w-24 h-24 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'x-circle':
        return (
          <svg className="w-24 h-24 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-24 h-24 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'exclamation-circle':
        return (
          <svg className="w-24 h-24 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-24 h-24 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
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

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-2xl mx-auto">
        <div className="p-6 text-center">
          {renderIcon()}
          
          <h2 className={`text-2xl font-bold mt-6 mb-2 text-${statusInfo.color}-600`}>
            {statusInfo.title}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {statusInfo.message}
          </p>
          
          {payment && (
            <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
              <h3 className="font-semibold text-lg mb-2">Chi tiết thanh toán</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Mã thanh toán:</span> {payment._id}</p>
                <p><span className="font-medium">Phương thức:</span> {payment.payment_method === 'VNPay' ? 'VNPay' : 'Thẻ tín dụng/ghi nợ'}</p>
                <p><span className="font-medium">Số tiền:</span> {payment.amount?.toLocaleString('vi-VN')} VNĐ</p>
                <p><span className="font-medium">Ngày thanh toán:</span> {new Date(payment.payment_date).toLocaleString('vi-VN')}</p>
                <p><span className="font-medium">Trạng thái:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold
                    ${payment.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 
                      payment.payment_status === 'Failed' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {payment.payment_status === 'Paid' ? 'Thành công' : 
                     payment.payment_status === 'Failed' ? 'Thất bại' : 'Đang xử lý'}
                  </span>
                </p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              onClick={handleViewBookingDetails}
              disabled={!payment || !payment.booking_id}
            >
              Xem chi tiết đặt chỗ
            </button>
            
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult; 