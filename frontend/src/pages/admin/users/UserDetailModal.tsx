import React, { useState, useEffect } from 'react';
import { User } from '../../../types/user.types';
import { userService } from '../../../services/user.service';
import { toast } from 'react-toastify';

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Cập nhật formData khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUserByAdmin(user._id, formData);
      toast.success('Cập nhật thông tin thành công!');
      onUpdate(updatedUser);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2 p-3 bg-gray-50 rounded-md">
              <p className="text-gray-600">ID:</p>
              <p className="font-medium">{user._id}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-600">Vai trò:</p>
              <p className="font-medium capitalize">{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-600">Ngày tạo:</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Nhập họ và tên"
              aria-label="Họ và tên"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Nhập địa chỉ email"
              aria-label="Email"
            />
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              id="phone_number"
              type="text"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Nhập số điện thoại"
              aria-label="Số điện thoại"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Nhập địa chỉ"
              aria-label="Địa chỉ"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetailModal; 