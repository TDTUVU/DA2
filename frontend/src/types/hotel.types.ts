export interface Hotel {
  _id: string;
  name: string;
  location: string;
  rating: number;
  price_per_night: number;
  available_rooms: number;
  amenities: string[];
  images: string[];
  description: string;
  isActive: boolean;
} 