import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import NewChatBox from './NewChatBox';
import useSocket from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';

const API_URL = window.location.port === '3000' ? 'http://localhost:5000/api' : '/api';

const UserChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const socket = useSocket();
  const { user, getToken } = useAuth();

  useEffect(() => {
    // Lấy ID của admin
    const fetchAdminId = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/users/chat/admin`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin info');
        }

        const data = await response.json();
        if (data.admin && data.admin._id) {
          setAdminId(data.admin._id);
        }
      } catch (error) {
        console.error('Error fetching admin info:', error);
      }
    };

    if (user && user.role !== 'admin') {
      fetchAdminId();
    }
  }, [user, getToken]);

  if (!user || user.role === 'admin' || !socket || !adminId) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 z-[9999] p-4 flex flex-col items-end">
      {/* Nút chat - chỉ hiển thị khi chat box chưa mở */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-colors"
          aria-label="Mở hộp thoại chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chat box */}
      {isOpen && socket && (
        <div className="mb-4 w-full sm:w-[350px] h-[500px] sm:h-[600px] md:h-[500px] bg-white rounded-lg shadow-xl overflow-hidden fixed sm:relative bottom-0 right-0 left-0 sm:left-auto sm:bottom-auto">
          <NewChatBox
            socket={socket}
            receiverId={adminId}
            onClose={() => setIsOpen(false)}
            receiverName="Hỗ trợ viên"
          />
        </div>
      )}
    </div>
  );
};

export default UserChatButton; 