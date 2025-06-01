import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

const ForgotPasswordModal: React.FC = () => {
  const { isForgotPasswordOpen, closeForgotPasswordModal, forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isForgotPasswordOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Vui lòng nhập email!')
      return
    }

    setIsLoading(true)

    try {
      await forgotPassword(email)
      setEmail('')
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a2c38] text-white p-8 rounded-lg w-96 relative">
        <button
          onClick={closeForgotPasswordModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Đóng modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          Quên mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 rounded bg-[#2a3b47] border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-400 text-center">
          Chúng tôi sẽ gửi email hướng dẫn đặt lại mật khẩu đến địa chỉ email của bạn.
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordModal 