import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiLogOut } from 'react-icons/fi'
import { MdWarningAmber } from 'react-icons/md'

const ConfirmLogoutModal: React.FC = () => {
  const { isLogoutConfirmOpen, closeLogoutConfirmModal, logoutWithoutToast } = useAuth()

  if (!isLogoutConfirmOpen) return null

  const handleLogout = () => {
    logoutWithoutToast()
    closeLogoutConfirmModal()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 rounded-2xl shadow-2xl w-[350px] relative flex flex-col items-center">
        <span className="flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full w-14 h-14 mb-4 shadow">
          <MdWarningAmber size={36} />
        </span>
        <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">Xác nhận đăng xuất</h2>
        <p className="mb-8 text-gray-600 text-center text-base">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
        <div className="flex w-full gap-3">
          <button
            onClick={closeLogoutConfirmModal}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2 shadow hover:bg-red-700 transition"
          >
            <FiLogOut size={18} /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmLogoutModal 