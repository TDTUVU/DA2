import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { authService } from '../services/auth.service'

interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  role: 'user' | 'admin';
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  isLoginMode: boolean;
  isForgotPasswordOpen: boolean;
  isLogoutConfirmOpen: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  logoutWithoutToast: () => void;
  openLoginModal: (isLogin: boolean) => void;
  closeLoginModal: () => void;
  openForgotPasswordModal: () => void;
  closeForgotPasswordModal: () => void;
  openLogoutConfirmModal: () => void;
  closeLogoutConfirmModal: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  getToken: () => string | null;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const apiUser = await authService.getCurrentUser()
        const userData: User = {
          _id: apiUser.id,
          id: apiUser.id,
          username: apiUser.username,
          email: apiUser.email,
          full_name: apiUser.full_name,
          phone_number: apiUser.phone_number,
          address: apiUser.address,
          role: apiUser.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setUser(userData)
      } catch (error: any) {
        if (error.message === 'No token found' || error.message === 'Token invalid' || error.message === 'Token expired') {
          localStorage.removeItem('token')
          setUser(null)
        }
        // Các lỗi khác sẽ giữ nguyên trạng thái user hiện tại
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      await checkAuth()
    }

    initAuth()

    const interval = setInterval(() => {
      checkAuth()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      localStorage.setItem('token', response.token)
      const apiUser = response.user
      const userData: User = {
        _id: apiUser.id,
        id: apiUser.id,
        username: apiUser.username,
        email: apiUser.email,
        full_name: apiUser.full_name,
        phone_number: apiUser.phone_number,
        address: apiUser.address,
        role: apiUser.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUser(userData)
      closeLoginModal()
      return userData
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại')
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data)
      localStorage.setItem('token', response.token)
      const apiUser = response.user
      const userData: User = {
        _id: apiUser.id,
        id: apiUser.id,
        username: apiUser.username,
        email: apiUser.email,
        full_name: apiUser.full_name,
        phone_number: apiUser.phone_number,
        address: apiUser.address,
        role: apiUser.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUser(userData)
      closeLoginModal()
      toast.success('Đăng ký thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Đăng xuất thành công!')
  }

  const logoutWithoutToast = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const openLoginModal = (isLogin: boolean) => {
    setIsLoginMode(isLogin)
    setIsLoginModalOpen(true)
  }

  const closeLoginModal = () => {
    setIsLoginModalOpen(false)
  }

  const openForgotPasswordModal = () => {
    closeLoginModal()
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

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email)
      closeForgotPasswordModal()
      toast.success('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu!')
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi email đặt lại mật khẩu')
      throw error
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authService.resetPassword(token, newPassword)
      toast.success('Đặt lại mật khẩu thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Không thể đặt lại mật khẩu')
      throw error
    }
  }

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isLoginModalOpen,
    isLoginMode,
    isForgotPasswordOpen,
    isLogoutConfirmOpen,
    login,
    register,
    logout,
    logoutWithoutToast,
    openLoginModal,
    closeLoginModal,
    openForgotPasswordModal,
    closeForgotPasswordModal,
    openLogoutConfirmModal,
    closeLogoutConfirmModal,
    forgotPassword,
    resetPassword,
    getToken,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
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