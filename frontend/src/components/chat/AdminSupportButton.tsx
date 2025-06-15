import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Message } from '../../types/chat';
import useSocket from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import NewChatBox from './NewChatBox';

interface Conversation {
  _id: {
    _id: string;
    username: string;
    full_name?: string;
  };
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

const AdminSupportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const API_URL = window.location.port === '3000' ? 'http://localhost:5000/api' : '/api';

  // Lấy danh sách cuộc trò chuyện
  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      console.log('Conversations fetched:', data);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch conversations when component mounts and socket is ready
  useEffect(() => {
    if (socket && user?.role === 'admin') {
      fetchConversations();
    }
  }, [socket, user]);

  // Listen for new messages
  useEffect(() => {
    if (socket && user?.role === 'admin') {
      const handleNewMessage = (message: Message) => {
        console.log('New message received:', message);
        
        setConversations(prev => {
          const updatedConversations = [...prev];
          const otherUserId = message.sender._id === user._id ? message.receiver._id : message.sender._id;
          
          const conversationIndex = updatedConversations.findIndex(
            conv => conv._id._id === otherUserId
          );

          if (conversationIndex > -1) {
            // Update existing conversation
            const conversation = updatedConversations[conversationIndex];
            updatedConversations[conversationIndex] = {
              ...conversation,
              lastMessage: message.content,
              lastMessageDate: message.createdAt,
              unreadCount: selectedUserId === otherUserId 
                ? conversation.unreadCount 
                : conversation.unreadCount + 1
            };
            // Move conversation to top
            updatedConversations.unshift(
              ...updatedConversations.splice(conversationIndex, 1)
            );
          } else {
            // Add new conversation
            const otherUser = message.sender._id === user._id ? message.receiver : message.sender;
            const newConversation: Conversation = {
              _id: {
                _id: otherUser._id,
                username: otherUser.username,
                full_name: otherUser.full_name
              },
              lastMessage: message.content,
              lastMessageDate: message.createdAt,
              unreadCount: 1
            };
            updatedConversations.unshift(newConversation);
          }

          return updatedConversations;
        });
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [socket, user, selectedUserId]);

  // Đánh dấu tin nhắn đã đọc khi chọn cuộc trò chuyện
  const handleSelectUser = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/chat/mark-read/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      setConversations(prev =>
        prev.map(conv =>
          conv._id._id === userId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );

      setSelectedUserId(userId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  if (!user || user.role !== 'admin' || !socket) {
    return null;
  }

  return (
    <>
      {/* Nút chat - chỉ hiển thị khi chat box chưa mở */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-colors z-50"
          aria-label="Mở hộp thoại hỗ trợ"
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

      {/* Chat box và danh sách trò chuyện */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 flex flex-col sm:flex-row gap-4 z-50 bg-gray-100 sm:bg-transparent sm:max-h-[calc(100vh-6rem)]">
          {/* Danh sách trò chuyện */}
          <div className="w-full sm:w-80 bg-white sm:rounded-lg shadow-lg overflow-hidden flex flex-col h-full sm:h-auto">
            <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
              <h2 className="font-semibold">Hỗ trợ Khách hàng</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedUserId(null);
                }}
                className="text-white hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Chưa có cuộc trò chuyện nào
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation._id._id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUserId === conversation._id._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectUser(conversation._id._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {conversation._id.full_name || conversation._id.username}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        <div className="text-right ml-4 flex flex-col items-end">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(conversation.lastMessageDate), {
                              addSuffix: true,
                              locale: vi
                            })}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <div className="mt-1 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.5rem] text-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat box */}
          {selectedUserId && (
            <div className="w-full sm:w-[350px] bg-white sm:rounded-lg shadow-lg overflow-hidden flex flex-col h-full sm:h-auto">
              <NewChatBox
                socket={socket}
                receiverId={selectedUserId}
                onClose={() => setSelectedUserId(null)}
                receiverName={
                  conversations.find(c => c._id._id === selectedUserId)?._id.username
                }
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminSupportButton; 