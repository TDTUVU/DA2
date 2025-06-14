import React from 'react';
import UsersTable from './users/UsersTable';
import { FiRefreshCw } from 'react-icons/fi';

const AdminUsersPage: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
        <button
          onClick={handleReload}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FiRefreshCw />
          Tải lại dữ liệu
        </button>
      </div>
      <UsersTable />
    </div>
  );
};

export default AdminUsersPage; 