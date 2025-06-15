import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { toast } from 'react-toastify';

const SOCKET_URL = window.location.port === '3000' ? 'http://localhost:5000' : '';

const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, getToken } = useAuth();

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const connectSocket = () => {
      if (!user) {
        if (socket) {
          socket.disconnect();
          setSocket(null);
        }
        return;
      }

      const token = getToken();
      if (!token) return;

      // Khởi tạo socket với token xác thực
      const newSocket = io(SOCKET_URL, {
        auth: {
          token
        },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      // Xử lý các sự kiện kết nối
      newSocket.on('connect', () => {
        console.log('Socket connected');
        retryCount = 0; // Reset retry count on successful connection
      });

      newSocket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
        retryCount++;
        
        if (retryCount <= MAX_RETRIES) {
          console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
          reconnectTimer = setTimeout(() => {
            newSocket.connect();
          }, 2000);
        } else {
          toast.error('Không thể kết nối với hệ thống chat sau nhiều lần thử');
        }
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          // Server đã ngắt kết nối hoặc mất kết nối, thử kết nối lại
          newSocket.connect();
        }
      });

      newSocket.on('connected', (data: { user: any }) => {
        console.log('Socket authenticated:', data);
        setSocket(newSocket);
      });

      setSocket(newSocket);
    };

    connectSocket();

    // Cleanup khi component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [user, getToken]);

  return socket;
};

export default useSocket; 