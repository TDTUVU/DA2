import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiGrid, FiBox, FiUsers, FiDollarSign, FiLogOut } from 'react-icons/fi';
import AdminSupportButton from '../../components/chat/AdminSupportButton';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout: React.FC = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { openLogoutConfirmModal } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation for Mobile */}
      <div className="lg:hidden bg-gray-800 text-white fixed top-0 left-0 right-0 z-20 h-14 flex items-center justify-between px-4">
        <span className="font-bold">Admin</span>
        <button
          onClick={openLogoutConfirmModal}
          className="text-white hover:text-gray-300"
          aria-label="Đăng xuất"
        >
          <FiLogOut size={20} />
        </button>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 text-white z-20">
        <nav className="flex justify-around items-center h-16">
          <NavLink 
            to="/admin" 
            end 
            className={({ isActive }) => `flex flex-col items-center justify-center p-2 ${isActive ? 'text-blue-400' : 'text-white'}`}
          >
            <FiGrid className="text-xl mb-1" />
            <span className="text-xs">Dashboard</span>
          </NavLink>
          <NavLink 
            to="/admin/services" 
            className={({ isActive }) => `flex flex-col items-center justify-center p-2 ${isActive ? 'text-blue-400' : 'text-white'}`}
          >
            <FiBox className="text-xl mb-1" />
            <span className="text-xs">Dịch vụ</span>
          </NavLink>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `flex flex-col items-center justify-center p-2 ${isActive ? 'text-blue-400' : 'text-white'}`}
          >
            <FiUsers className="text-xl mb-1" />
            <span className="text-xs">Users</span>
          </NavLink>
          <NavLink 
            to="/admin/bookings" 
            className={({ isActive }) => `flex flex-col items-center justify-center p-2 ${isActive ? 'text-blue-400' : 'text-white'}`}
          >
            <FiDollarSign className="text-xl mb-1" />
            <span className="text-xs">Đơn hàng</span>
          </NavLink>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 w-64 h-screen bg-gray-800 text-white">
        <div className="p-4 text-xl font-bold">Admin</div>
        <nav className="flex-1">
          <ul>
            <li>
              <NavLink 
                to="/admin" 
                end 
                className={({ isActive }) => `flex items-center p-4 hover:bg-gray-700 ${isActive ? 'bg-gray-900' : ''}`}
              >
                <FiGrid className="mr-3" /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/services" 
                className={({ isActive }) => `flex items-center p-4 hover:bg-gray-700 ${isActive ? 'bg-gray-900' : ''}`}
              >
                <FiBox className="mr-3" /> Dịch vụ
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/users" 
                className={({ isActive }) => `flex items-center p-4 hover:bg-gray-700 ${isActive ? 'bg-gray-900' : ''}`}
              >
                <FiUsers className="mr-3" /> Người dùng
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/bookings" 
                className={({ isActive }) => `flex items-center p-4 hover:bg-gray-700 ${isActive ? 'bg-gray-900' : ''}`}
              >
                <FiDollarSign className="mr-3" /> Đơn hàng
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/revenue" 
                className={({ isActive }) => `flex items-center p-4 hover:bg-gray-700 ${isActive ? 'bg-gray-900' : ''}`}
              >
                <FiDollarSign className="mr-3" /> Doanh thu
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <button
          onClick={openLogoutConfirmModal}
          className="flex items-center p-4 text-white hover:bg-gray-700 w-full"
        >
          <FiLogOut className="mr-3" /> Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 pb-20 lg:py-6">
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      {/* Chat Support Button */}
      <AdminSupportButton />
    </div>
  );
};

export default AdminLayout; 