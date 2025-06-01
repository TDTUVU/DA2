import axiosInstance from './axios.config';

// Định nghĩa các interface cho booking
interface Booking {
  _id: string;
  booking_type: 'hotel' | 'flight' | 'tour';
  hotel_id?: {
    _id: string;
    name: string;
    location: string;
    images: string[];
  };
  flight_id?: {
    _id: string;
    flight_name: string;
    departure: string;
    arrival: string;
  };
  tour_id?: {
    _id: string;
    tour_name: string;
    location: string;
    images: string[];
  };
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}

export const bookingService = {
  // Lấy tất cả booking của user hiện tại
  async getUserBookings(): Promise<Booking[]> {
    try {
      console.log('Gọi API lấy danh sách booking của user');
      const response = await axiosInstance.get('/bookings/my-bookings');
      
      // Chuyển đổi payment_status thành lowercase để đồng bộ với frontend
      const bookings = response.data.map((booking: any) => ({
        ...booking,
        payment_status: booking.payment_status?.toLowerCase()
      }));
      
      return bookings;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách booking:', error);
      throw error;
    }
  },
  
  // Lấy chi tiết một booking
  async getBookingDetails(id: string): Promise<Booking> {
    try {
      console.log(`Gọi API lấy chi tiết booking ID: ${id}`);
      const response = await axiosInstance.get(`/bookings/${id}`);
      
      // Chuyển đổi payment_status thành lowercase để đồng bộ với frontend
      const booking = {
        ...response.data,
        payment_status: response.data.payment_status?.toLowerCase()
      };
      
      return booking;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin booking ${id}:`, error);
      throw error;
    }
  },
  
  // Hủy booking
  async cancelBooking(id: string, token?: string): Promise<any> {
    try {
      console.log(`Gọi API hủy booking ID: ${id}`);
      const storedToken = localStorage.getItem('token');
      const authToken = token || storedToken || '';
      console.log('Token used:', authToken ? 'Có token' : 'Không có token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      };

      console.log('Sending cancel request with config:', config);
      const response = await axiosInstance.put(`/bookings/${id}/cancel`, {}, config);
      console.log('Cancel booking response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi hủy booking ${id}:`, error);
      throw error;
    }
  },
  
  // Tạo booking mới
  async createBooking(bookingData: any): Promise<Booking> {
    try {
      console.log('Gọi API tạo booking mới:', bookingData);
      const response = await axiosInstance.post('/bookings', bookingData);
      
      // Chuyển đổi payment_status thành lowercase để đồng bộ với frontend
      const booking = {
        ...response.data,
        payment_status: response.data.payment_status?.toLowerCase()
      };
      
      return booking;
    } catch (error) {
      console.error('Lỗi khi tạo booking mới:', error);
      throw error;
    }
  }
}; 