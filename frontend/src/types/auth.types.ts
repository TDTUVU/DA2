export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  full_name?: string;
  phone_number?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UpdateProfileData {
  full_name?: string;
  phone_number?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
} 