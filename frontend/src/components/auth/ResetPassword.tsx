import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const token = searchParams.get('token')

  if (!token) {
    toast.error('Token không hợp lệ!')
    navigate('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin!')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu không khớp!')
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(token, newPassword)
      navigate('/')
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-[#1a2c38] text-white p-8 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Đặt lại mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              className="w-full p-2 rounded bg-[#2a3b47] border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              className="w-full p-2 rounded bg-[#2a3b47] border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword 