export interface Tour {
  _id: string;
  tour_name: string;
  description: string;
  price_per_person: number;
  duration: string;
  available_seats: number;
  destination: string;
  departure_location: string;
  departure_time: string;
  images: string[];
  isActive: boolean;
  rating: number;
  // Các trường khác nếu có
} 