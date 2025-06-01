import axiosInstance from './axios.config';

// Định nghĩa các interface cho payment
interface Payment {
  _id: string;
  user_id: string;
  booking_id: string;
  amount: number;
  payment_date: string;
  payment_status: 'Pending' | 'Paid' | 'Failed';
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'VNPay';
  transaction_id: string;
  payment_details?: any;
  createdAt: string;
  updatedAt: string;
}

interface VNPayResponse {
  paymentUrl: string;
  paymentId: string;
  message: string;
}

export const paymentService = {
  // Tạo thanh toán mới
  async createPayment(paymentData: { booking_id: string; payment_method: string }): Promise<Payment> {
    try {
      const response = await axiosInstance.post('/payments', paymentData);
      return response.data.payment;
    } catch (error) {
      console.error('Lỗi khi tạo thanh toán:', error);
      throw error;
    }
  },

  // Tạo URL thanh toán VNPay
  async createVNPayPayment(booking_id: string): Promise<VNPayResponse> {
    try {
      const response = await axiosInstance.post('/payments/vnpay', { booking_id });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo URL thanh toán VNPay:', error);
      throw error;
    }
  },

  // Lấy kết quả thanh toán
  async getPaymentResult(paymentId: string): Promise<Payment> {
    try {
      const response = await axiosInstance.get(`/payments/result/${paymentId}`);
      return response.data.payment;
    } catch (error) {
      console.error('Lỗi khi lấy kết quả thanh toán:', error);
      throw error;
    }
  },

  // Lấy lịch sử thanh toán của user
  async getUserPayments(): Promise<Payment[]> {
    try {
      const response = await axiosInstance.get('/payments/my-payments');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử thanh toán:', error);
      throw error;
    }
  },

  // Lấy chi tiết thanh toán
  async getPaymentDetails(paymentId: string): Promise<Payment> {
    try {
      const response = await axiosInstance.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết thanh toán:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(paymentId: string, payment_status: 'Pending' | 'Paid' | 'Failed'): Promise<Payment> {
    try {
      const response = await axiosInstance.put(`/payments/${paymentId}/status`, { payment_status });
      return response.data.payment;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
      throw error;
    }
  }
}; 