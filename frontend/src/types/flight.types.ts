export interface Flight {
  _id: string;
  flight_name: string;
  departure: string;
  arrival: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  airline: string;
  rating: number;
  images: string[] | FileList;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
} 