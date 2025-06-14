export interface User {
  _id: string;
  full_name: string;
  username: string;
  email: string;
  phone_number?: string;
  address?: string;
  role: 'user' | 'admin';
  images?: string[];
  createdAt: string;
  updatedAt: string;
} 