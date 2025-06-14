import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    // Trong khi đang kiểm tra xác thực, có thể hiển thị một spinner hoặc null
    return <div>Đang tải...</div>;
  }

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, điều hướng đến trang chủ (modal đăng nhập sẽ tự mở)
    return <Navigate to="/" />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Nếu yêu cầu quyền admin nhưng user không phải admin, điều hướng về trang chủ
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 