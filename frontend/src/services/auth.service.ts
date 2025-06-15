interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  address: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    full_name: string;
    phone_number: string;
    address: string;
    role: 'user' | 'admin';
  };
}

interface UpdateProfileData {
  full_name?: string;
  phone_number?: string;
  address?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Kiểm tra xem có đang ở port 3000 không
const isPort3000 = window.location.port === '3000';
const API_URL = isPort3000 ? 'http://localhost:5000/api' : '/api';

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Đăng nhập thất bại');
      }

      // Lưu token vào localStorage
      if (result.token) {
        localStorage.setItem('token', result.token);
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Đăng ký thất bại');
      }

      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const token = this.getToken();
      if (!token) {
        this.logout(); // Xóa token nếu không tồn tại
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        this.logout(); // Xóa token nếu không hợp lệ
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get user info');
      }

      return result.user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<AuthResponse['user']> {
    try {
      const token = this.getToken();
      if (!token) {
        this.logout();
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        this.logout();
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) {
        this.logout();
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        this.logout();
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset password email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  logout() {
    console.log('Logging out, removing token');
    localStorage.removeItem('token');
    // Reload trang để reset state
    window.location.reload();
  },

  getToken() {
    const token = localStorage.getItem('token');
    console.log('Reading token from localStorage:', token ? 'Token found' : 'No token');
    return token;
  },

  isAuthenticated() {
    const token = this.getToken();
    console.log('Checking authentication:', token ? 'Has token' : 'No token');
    return !!token;
  }
}; 