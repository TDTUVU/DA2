export interface Booking {
  _id: string;
  user_id: {
    _id: string;
    full_name: string;
    email: string;
  };
  hotel_id?: {
    _id: string;
    name: string;
    price_per_night: number;
  };
  flight_id?: {
    _id: string;
    flight_name: string;
    price: number;
  };
  tour_id?: {
    _id: string;
    tour_name: string;
    price_per_person: number;
  };
  booking_date: string;
  check_in?: string;
  check_out?: string;
  total_amount: number;
  payment_status: 'Pending' | 'Paid' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
} 