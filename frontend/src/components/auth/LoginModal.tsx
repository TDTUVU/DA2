import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { FaFacebook, FaGoogle, FaGithub } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

interface FormData {
  username: string
  email: string
  password: string
  full_name: string
  phone_number: string
  address: string
}

const LoginModal: React.FC = () => {
  const { isLoginModalOpen, isLoginMode, closeLoginModal, login, register, openLoginModal, openForgotPasswordModal } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    address: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (isLoginMode) {
      if (!formData.email || !formData.password) {
        toast.error('Vui lòng điền đầy đủ thông tin!')
        return
      }
    } else {
      if (!formData.email || !formData.password || !formData.username || 
          !formData.full_name || !formData.phone_number || !formData.address) {
        toast.error('Vui lòng điền đầy đủ thông tin!')
        return
      }
    }

    setIsLoading(true)

    try {
      if (isLoginMode) {
        const loggedInUser = await login(formData.email, formData.password)
        if (loggedInUser.role === 'admin') {
          navigate('/admin')
        }
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address
        })
      }
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone_number: '',
        address: ''
      })
    } catch (error: any) {
      toast.error(error.message || (isLoginMode ? 'Đăng nhập thất bại!' : 'Đăng ký thất bại!'))
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    openLoginModal(!isLoginMode)
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      phone_number: '',
      address: ''
    })
  }

  const handleSocialLogin = (provider: string) => {
    toast.info(`Đăng nhập bằng ${provider} đang được phát triển!`)
  }

  if (!isLoginModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeLoginModal}>
      <div className="bg-[#1a2c38] text-white p-8 rounded-lg w-96 relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  name="username"
                  className="w-full p-2 rounded bg-[#2a3b47] border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="full_name"
                  className="w-full p-2 rounded bg-[#2a3b47] border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập họ và tên"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  className="w-full p-2 rounded bg-[#2a3b47] border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  className="w-full p-2 rounded bg-[#2a3b47] border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập địa chỉ"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full p-2 rounded bg-[#2a3b47] border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              className="w-full p-2 rounded bg-[#2a3b47] border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Nút Quên mật khẩu */}
          {isLoginMode && (
            <div className="text-right">
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 text-sm"
                onClick={() => {
                  closeLoginModal();
                  openForgotPasswordModal();
                }}
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : (isLoginMode ? 'Đăng nhập' : 'Đăng ký')}
          </button>
        </form>

        {isLoginMode && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a2c38] text-gray-400">Hoặc đăng nhập bằng</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3b5998] hover:bg-[#2d4373] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b5998]"
                aria-label="Đăng nhập bằng Facebook"
              >
                <FaFacebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#db4437] hover:bg-[#c53929] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#db4437]"
                aria-label="Đăng nhập bằng Google"
              >
                <FaGoogle className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleSocialLogin('GitHub')}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#333] hover:bg-[#24292e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#333]"
                aria-label="Đăng nhập bằng GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={switchMode}
            className="text-blue-400 hover:text-blue-300"
          >
            {isLoginMode ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginModal