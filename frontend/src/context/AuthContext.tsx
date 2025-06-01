import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { authService } from '../services/auth.service'

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone_number: string;
  address: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoginModalOpen: boolean;
  isLoginMode: boolean;
  isForgotPasswordOpen: boolean;
  isLogoutConfirmOpen: boolean;
  openLoginModal: (isLogin: boolean) => void;
  closeLoginModal: () => void;
  openForgotPasswordModal: () => void;
  closeForgotPasswordModal: () => void;
  openLogoutConfirmModal: () => void;
  closeLogoutConfirmModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    phone_number: string;
    address: string;
  }) => Promise<void>;
  logout: () => void;
  logoutWithoutToast: () => void;
  updateProfile: (data: {
    full_name?: string;
    phone_number?: string;
    address?: string;
  }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          authService.logout()
          setIsAuthenticated(false)
          setUser(null)
        }
      }
    }
    checkAuth()
  }, [])

  const openLoginModal = (isLogin: boolean) => {
    setIsLoginMode(isLogin)
    setIsLoginModalOpen(true)
  }

  const closeLoginModal = () => {
    setIsLoginModalOpen(false)
    setIsLoginMode(true)
  }

  const openForgotPasswordModal = () => {
    setIsForgotPasswordOpen(true)
  }

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordOpen(false)
  }

  const openLogoutConfirmModal = () => {
    setIsLogoutConfirmOpen(true)
  }

  const closeLogoutConfirmModal = () => {
    setIsLogoutConfirmOpen(false)
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      localStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
      closeLoginModal()
      toast.success('Đăng nhập thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại')
      throw error
    }
  }

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    phone_number: string;
    address: string;
  }) => {
    try {
      const response = await authService.register(data)
      localStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
      closeLoginModal()
      toast.success('Đăng ký thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại')
      throw error
    }
  }

  const updateProfile = async (data: {
    full_name?: string;
    phone_number?: string;
    address?: string;
  }) => {
    try {
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)
      toast.success('Cập nhật thông tin thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thông tin thất bại')
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword({ currentPassword, newPassword })
      toast.success('Đổi mật khẩu thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Đổi mật khẩu thất bại')
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email)
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu!')
    } catch (error: any) {
      toast.error(error.message || 'Gửi email đặt lại mật khẩu thất bại')
      throw error
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authService.resetPassword(token, newPassword)
      toast.success('Đặt lại mật khẩu thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Đặt lại mật khẩu thất bại')
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    toast.success('Đăng xuất thành công!')
  }

  const logoutWithoutToast = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoginModalOpen,
        isLoginMode,
        isForgotPasswordOpen,
        isLogoutConfirmOpen,
        openLoginModal,
        closeLoginModal,
        openForgotPasswordModal,
        closeForgotPasswordModal,
        openLogoutConfirmModal,
        closeLogoutConfirmModal,
        login,
        register,
        logout,
        logoutWithoutToast,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}