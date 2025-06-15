import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import { Message } from '../../types/chat';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatBoxProps {
  socket: Socket;
  receiverId: string;
  onClose: () => void;
  receiverName?: string;
}

const NewChatBox: React.FC<ChatBoxProps> = ({ socket, receiverId, onClose, receiverName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const API_URL = window.location.port === '3000' ? 'http://localhost:5000/api' : '/api';

  // Theo dõi thay đổi messages để tự động cuộn xuống
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lấy lịch sử chat khi receiverId thay đổi
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/chat/history?userId=${receiverId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (receiverId) {
      fetchChatHistory();
    }

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (message: Message) => {
      // Chỉ thêm tin nhắn nếu thuộc về cuộc trò chuyện hiện tại
      if ((message.sender._id === user?._id && message.receiver._id === receiverId) ||
          (message.sender._id === receiverId && message.receiver._id === user?._id)) {
        setMessages(prev => [...prev, message]);
      }
    };

    // Lắng nghe trạng thái typing
    const handleUserTyping = (data: { userId: string; username: string }) => {
      if (data.userId === receiverId) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data: { userId: string }) => {
      if (data.userId === receiverId) {
        setIsTyping(false);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStopTyping', handleUserStopTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStopTyping', handleUserStopTyping);
    };
  }, [socket, receiverId, API_URL]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      const { scrollHeight, clientHeight } = messageContainerRef.current;
      messageContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  const handleTyping = () => {
    socket.emit('typing', { receiverId });

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      socket.emit('stopTyping', { receiverId });
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Tạo message object
    const messageObj: Message = {
      _id: Date.now().toString(),
      sender: {
        _id: user?._id || '',
        username: user?.username || ''
      },
      receiver: {
        _id: receiverId,
        username: receiverName || 'Unknown'
      },
      content: newMessage,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Thêm tin nhắn vào state ngay lập tức
    setMessages(prev => [...prev, messageObj]);
    
    // Clear input
    setNewMessage('');

    // Gửi tin nhắn qua socket
    socket.emit('sendMessage', {
      receiverId,
      content: newMessage
    });

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      socket.emit('stopTyping', { receiverId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-blue-500 text-white">
        <h3 className="font-semibold flex items-center gap-2">
          <button
            onClick={onClose}
            className="sm:hidden text-white hover:text-gray-200 text-xl font-bold"
          >
            ←
          </button>
          {receiverName || 'Chat với Admin'}
        </h3>
        <button
          onClick={onClose}
          className="hidden sm:block text-white hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-[300px]"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            Chưa có tin nhắn nào
          </div>
        ) : (
          messages.map((message, index) => {
            const isSender = message.sender._id === user?._id;
            const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: vi
            });
            
            return (
              <div
                key={message._id}
                className={`flex mb-4 ${
                  isSender ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="max-w-[85%] sm:max-w-[70%] flex flex-col">
                  <span className={`text-xs mb-1 ${
                    isSender ? 'text-right' : 'text-left'
                  } text-gray-600`}>
                    {isSender ? 'Bạn' : message.sender.username}
                  </span>
                  
                  <div className="flex items-end gap-1">
                    {!isSender && (
                      <div className="w-2 h-2 transform rotate-45 bg-gray-100 border-l border-t border-gray-200 -mr-1"></div>
                    )}
                    
                    <div
                      className={`relative rounded-2xl px-3 py-2 ${
                        isSender
                          ? 'bg-[#dcf8c6] text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                    
                    {isSender && (
                      <div className="w-2 h-2 transform rotate-45 bg-[#dcf8c6] -ml-1"></div>
                    )}
                  </div>
                  
                  <span className={`text-[11px] mt-1 ${
                    isSender ? 'text-right' : 'text-left'
                  } text-gray-500`}>
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="text-gray-500 text-sm">
            Đang nhập...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Gửi
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewChatBox; 