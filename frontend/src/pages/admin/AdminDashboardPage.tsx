import React, { useState, useEffect } from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiMessageCircle } from 'react-icons/fi';

interface DashboardMetric {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  newUsers: Array<{
    username: string;
    createdAt: string;
  }>;
  newOrders: Array<{
    user: {
      username: string;
    };
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = window.location.port === '3000' ? 'http://localhost:5000/api' : '/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/dashboard/metrics`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        
        // Cập nhật metrics
        setMetrics([
          {
            title: 'Tổng Người Dùng',
            value: data.totalUsers || 0,
            change: data.userGrowth || 0,
            icon: <FiUsers className="h-6 w-6" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Đơn Hàng Mới',
            value: data.newOrders || 0,
            change: data.orderGrowth || 0,
            icon: <FiShoppingBag className="h-6 w-6" />,
            color: 'bg-green-500'
          },
          {
            title: 'Doanh Thu Tháng',
            value: data.monthlyRevenue || 0,
            change: data.revenueGrowth || 0,
            icon: <FiDollarSign className="h-6 w-6" />,
            color: 'bg-yellow-500'
          },
          {
            title: 'Tin Nhắn Mới',
            value: data.newMessages || 0,
            change: data.messageGrowth || 0,
            icon: <FiMessageCircle className="h-6 w-6" />,
            color: 'bg-purple-500'
          }
        ]);

        // Cập nhật hoạt động gần đây
        if (data.recentActivities) {
          setRecentActivities(data.recentActivities);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tổng Quan</h1>
        <p className="text-gray-600 mt-1">Xem tổng quan về hoạt động của hệ thống</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${metric.color} text-white p-3 rounded-full`}>
                {metric.icon}
              </div>
              <span className={`text-sm font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {metric.title.includes('Doanh Thu') 
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(metric.value)
                : metric.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* New Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Người Dùng Mới</h2>
          <div className="space-y-4">
            {recentActivities?.newUsers && recentActivities.newUsers.length > 0 ? (
              recentActivities.newUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FiUsers className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.username}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có người dùng mới</p>
            )}
          </div>
        </div>

        {/* New Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn Hàng Mới</h2>
          <div className="space-y-4">
            {recentActivities?.newOrders && recentActivities.newOrders.length > 0 ? (
              recentActivities.newOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FiShoppingBag className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{order.user.username}</p>
                      <p className="text-xs text-gray-500">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'completed' ? 'Hoàn thành' :
                       order.status === 'pending' ? 'Đang chờ' : 
                       order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có đơn hàng mới</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 