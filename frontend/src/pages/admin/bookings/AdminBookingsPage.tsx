import React from 'react';
import BookingsTable from './BookingsTable';
import { FiRefreshCw } from 'react-icons/fi';

const AdminBookingsPage: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quản Lý Đơn Hàng</h1>
        <button
          onClick={handleReload}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FiRefreshCw />
          Tải lại dữ liệu
        </button>
      </div>
      <BookingsTable />
    </div>
  );
};

export default AdminBookingsPage; 