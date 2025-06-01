import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCamera, FiLock, 
  FiCalendar, FiCreditCard, FiSettings, FiBookmark, FiHeart 
} from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:5000';

interface UserProfile {
  username: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  images?: string;
}

type TabType = 'profile' | 'bookings' | 'favorites' | 'settings';

const ProfilePage = () => {
  const { isAuthenticated, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    address: '',
    images: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Không tìm thấy token xác thực');
        }

        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Không thể tải thông tin người dùng');
        }

        const data = await response.json();
        setProfile(data);
        if (data.images) {
          setPreviewUrl(`${API_BASE_URL}${data.images}`);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        if (error.message !== 'Không tìm thấy token xác thực') {
          toast.error(error.message || 'Không thể tải thông tin người dùng');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const formData = new FormData();
      formData.append('full_name', profile.full_name || '');
      formData.append('phone_number', profile.phone_number || '');
      formData.append('address', profile.address || '');
      if (selectedImage) {
        formData.append('images', selectedImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật thông tin');
      }

      const updatedUser = await response.json();
      setProfile(updatedUser);
      if (updatedUser.images) {
        setPreviewUrl(`${API_BASE_URL}${updatedUser.images}`);
      }
      toast.success('Cập nhật thông tin thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thông tin thất bại');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp!');
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Vui lòng đăng nhập để xem thông tin cá nhân</h2>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Đang tải thông tin...</h2>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-lg group mb-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Ảnh đại diện"
              className="w-full h-full object-cover group-hover:opacity-80 transition"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Chưa có ảnh</span>
            </div>
          )}
          <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition">
            <FiCamera className="text-white" size={18} />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              aria-label="Chọn ảnh đại diện"
            />
          </label>
        </div>
        <span className="text-gray-500 text-sm">Ảnh đại diện</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiUser /> Tên đăng nhập
            </label>
            <input
              type="text"
              value={profile.username}
              disabled
              className="w-full p-2 border border-gray-200 rounded bg-gray-50"
              aria-label="Tên đăng nhập"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiMail /> Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full p-2 border border-gray-200 rounded bg-gray-50"
              aria-label="Email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiEdit2 /> Họ và tên
            </label>
            <input
              type="text"
              name="full_name"
              value={profile.full_name || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiPhone /> Số điện thoại
            </label>
            <input
              type="tel"
              name="phone_number"
              value={profile.phone_number || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiMapPin /> Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={profile.address || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập địa chỉ"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          >
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  );

  const renderBookingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiCalendar /> Lịch sử đặt phòng
        </h3>
        <div className="text-gray-500 text-center py-8">
          Chưa có đặt phòng nào
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiCalendar /> Lịch sử đặt tour
        </h3>
        <div className="text-gray-500 text-center py-8">
          Chưa có đặt tour nào
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiCalendar /> Lịch sử đặt vé máy bay
        </h3>
        <div className="text-gray-500 text-center py-8">
          Chưa có đặt vé nào
        </div>
      </div>
    </div>
  );

  const renderFavoritesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiHeart /> Khách sạn yêu thích
        </h3>
        <div className="text-gray-500 text-center py-8">
          Chưa có khách sạn yêu thích nào
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiHeart /> Tour yêu thích
        </h3>
        <div className="text-gray-500 text-center py-8">
          Chưa có tour yêu thích nào
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiLock /> Đổi mật khẩu
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
          {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-60"
            >
              {isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiCreditCard /> Phương thức thanh toán
        </h3>
        <div className="text-gray-500 text-center py-8">
          Chưa có phương thức thanh toán nào
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <FiUser size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.full_name || 'Chưa cập nhật'}</h1>
                <p className="text-blue-100">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiUser /> Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'bookings'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiBookmark /> Đặt phòng/Tour/Vé
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'favorites'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiHeart /> Yêu thích
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'settings'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiSettings /> Cài đặt
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'bookings' && renderBookingsTab()}
            {activeTab === 'favorites' && renderFavoritesTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 