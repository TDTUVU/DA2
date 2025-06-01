import axios from 'axios';

// Cấu hình Axios với baseURL
const instance = axios.create({
  baseURL: '/api', // Sử dụng relative URL cho proxy
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Luôn gửi cookie (refresh token)
});

// Thêm interceptor để gắn token cho mỗi request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`Request to ${config.url}`, {
      method: config.method,
      withCredentials: config.withCredentials
    });
    
    if (token) {
      console.log('Adding token to request headers');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token available in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Biến để tránh lặp vô hạn khi refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Thêm interceptor để xử lý lỗi response
instance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  async (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, chờ refresh xong rồi retry
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return instance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        instance.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        processQueue(null, newToken);
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        window.location.href = '/'; // Logout
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    // Lỗi khác
    if (error.response) {
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance; 