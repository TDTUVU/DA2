import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueStats {
  totalRevenue: number;
  totalBookings: number;
  avgBookingValue: number;
  revenueByService: {
    hotels: number;
    flights: number;
    tours: number;
  };
  revenueByPeriod: {
    period: string;
    revenue: number;
  }[];
}

type PeriodType = 'day' | 'month' | 'quarter';

const AdminRevenuePage: React.FC = () => {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodType, setPeriodType] = useState<PeriodType>('month');

  const fetchRevenueStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/revenue?periodType=${periodType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setStats(data);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueStats();
  }, [periodType]);

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/admin/revenue/export?periodType=${periodType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${periodType}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error('Không thể xuất báo cáo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Báo Cáo Doanh Thu</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchRevenueStats()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FiRefreshCw />
            Tải lại
          </button>
          <button
            onClick={handleExportData}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <FiDownload />
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Tổng doanh thu</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{stats?.totalRevenue?.toLocaleString('vi-VN')} VNĐ</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{stats?.totalBookings}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Giá trị trung bình/đơn</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{stats?.avgBookingValue?.toLocaleString('vi-VN')} VNĐ</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold">Biểu Đồ Doanth Thu</h3>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setPeriodType('day')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md ${
                periodType === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Theo ngày
            </button>
            <button
              onClick={() => setPeriodType('month')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md ${
                periodType === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Theo tháng
            </button>
            <button
              onClick={() => setPeriodType('quarter')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md ${
                periodType === 'quarter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Theo quý
            </button>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats?.revenueByPeriod || []}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value.toLocaleString('vi-VN')}`}
              />
              <Tooltip
                formatter={(value: number) => value.toLocaleString('vi-VN') + ' VNĐ'}
                contentStyle={{ fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#2563eb"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Doanh thu theo dịch vụ</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm">Khách sạn</span>
            <span className="text-sm font-medium">{stats?.revenueByService.hotels.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm">Chuyến bay</span>
            <span className="text-sm font-medium">{stats?.revenueByService.flights.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm">Tour</span>
            <span className="text-sm font-medium">{stats?.revenueByService.tours.toLocaleString('vi-VN')} VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenuePage; 