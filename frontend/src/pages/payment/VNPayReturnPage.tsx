import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';
// import { paymentService } from '../../services/payment.service'; // Tùy chọn: để lấy chi tiết payment từ backend

interface VNPayParams {
  vnp_Amount?: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo?: string;
  vnp_PayDate?: string;
  vnp_ResponseCode?: string;
  vnp_TmnCode?: string;
  vnp_TransactionNo?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef?: string;
  vnp_SecureHash?: string;
}

const VNPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [vnpParams, setVnpParams] = useState<VNPayParams | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params: VNPayParams = {};
    searchParams.forEach((value: string, key: string) => {
      params[key as keyof VNPayParams] = value;
    });
    setVnpParams(params);

    // Backend đã xử lý và cập nhật trạng thái payment dựa trên vnp_ReturnUrl
    // Ở đây, chúng ta chủ yếu dựa vào vnp_ResponseCode để hiển thị cho người dùng
    // Hoặc có thể gọi API để lấy thông tin payment đã được cập nhật từ backend nếu cần
    
    if (params.vnp_ResponseCode === '00') {
      setPaymentStatus('success');
    } else {
      setPaymentStatus('failed');
      if (params.vnp_ResponseCode) {
        // Bạn có thể map các mã lỗi của VNPay ra thông báo cụ thể hơn
        setError(`Lỗi thanh toán VNPay. Mã lỗi: ${params.vnp_ResponseCode}. ${params.vnp_OrderInfo || ''}`);
      } else {
        setError('Giao dịch không thành công hoặc đã bị hủy.');
      }
    }
    setLoading(false);

    // Ví dụ: Lấy chi tiết payment từ backend (nếu cần)
    // const fetchPaymentDetails = async (txnRef: string) => {
    //   try {
    //     // Cần một cách để lấy paymentId từ txnRef nếu API của bạn cần paymentId
    //     // Hoặc backend của bạn có thể đã cập nhật payment dựa trên txnRef trong vnpayReturn
    //     // const paymentDetails = await paymentService.getPaymentByTxnRef(txnRef); // Giả sử có hàm này
    //     // setPaymentDetails(paymentDetails);
    //   } catch (fetchError) {
    //     console.error("Error fetching payment details:", fetchError);
    //     // setError("Không thể tải chi tiết giao dịch.");
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // if (params.vnp_TxnRef) {
    //   // fetchPaymentDetails(params.vnp_TxnRef);
    // } else {
    //   setLoading(false);
    //   setError("Thiếu thông tin tham chiếu giao dịch từ VNPay.");
    // }

  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <FiLoader className="text-6xl text-blue-500 animate-spin mb-4" />
        <p className="text-xl text-gray-700">Đang xử lý kết quả thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
        {paymentStatus === 'success' && vnpParams && (
          <>
            <FiCheckCircle className="text-7xl sm:text-8xl text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mb-6 sm:text-lg">
              Cảm ơn bạn đã hoàn tất thanh toán qua VNPay.
            </p>
            <div className="bg-green-50 p-4 rounded-lg text-left text-sm text-gray-700 space-y-1 mb-8">
              <p><strong>Mã giao dịch VNPay:</strong> {vnpParams.vnp_TransactionNo || 'N/A'}</p>
              <p><strong>Mã đơn hàng:</strong> {vnpParams.vnp_TxnRef?.split('_')[1] || vnpParams.vnp_TxnRef || 'N/A'}</p>
              <p><strong>Số tiền:</strong> {(parseInt(vnpParams.vnp_Amount || '0') / 100).toLocaleString('vi-VN')} VND</p>
              <p><strong>Thời gian:</strong> {vnpParams.vnp_PayDate ? `${vnpParams.vnp_PayDate.substring(6,8)}/${vnpParams.vnp_PayDate.substring(4,6)}/${vnpParams.vnp_PayDate.substring(0,4)} ${vnpParams.vnp_PayDate.substring(8,10)}:${vnpParams.vnp_PayDate.substring(10,12)}:${vnpParams.vnp_PayDate.substring(12,14)}` : 'N/A'}</p>
              {vnpParams.vnp_OrderInfo && <p><strong>Nội dung:</strong> {decodeURIComponent(vnpParams.vnp_OrderInfo)}</p>}
            </div>
            <Link
              to={vnpParams.vnp_TxnRef ? `/bookings/${vnpParams.vnp_TxnRef.split('_')[1]}` : "/my-bookings"}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
            >
              Xem chi tiết đặt chỗ
            </Link>
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <FiXCircle className="text-7xl sm:text-8xl text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mb-6 sm:text-lg">
              {error || 'Đã có lỗi xảy ra hoặc giao dịch đã bị hủy. Vui lòng thử lại.'}
            </p>
            {vnpParams && (
                 <div className="bg-red-50 p-4 rounded-lg text-left text-sm text-gray-700 space-y-1 mb-8">
                    <p><strong>Mã đơn hàng:</strong> {vnpParams.vnp_TxnRef?.split('_')[1] || vnpParams.vnp_TxnRef || 'N/A'}</p>
                    {vnpParams.vnp_ResponseCode && <p><strong>Mã lỗi VNPay:</strong> {vnpParams.vnp_ResponseCode}</p>}
                    {vnpParams.vnp_OrderInfo && <p><strong>Thông tin:</strong> {decodeURIComponent(vnpParams.vnp_OrderInfo)}</p>}
                 </div>
            )}
            <Link
              to={vnpParams?.vnp_TxnRef ? `/payment/options/${vnpParams.vnp_TxnRef.split('_')[1]}` : "/"}
              className="w-full mb-3 inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
            >
              Thử lại thanh toán
            </Link>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
            >
               <FiArrowLeft className="mr-2"/> Quay về trang chủ
            </Link>
          </>
        )}
      </div>
       <p className="text-xs text-gray-500 mt-8">
          Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ.
        </p>
    </div>
  );
};

export default VNPayReturnPage; 