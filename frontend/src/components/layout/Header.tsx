import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated, openLogoutConfirmModal, openLoginModal } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Travel Website
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/hotels" className="text-gray-600 hover:text-blue-600">
              Khách sạn
            </Link>
            <Link to="/flights" className="text-gray-600 hover:text-blue-600">
              Chuyến bay
            </Link>
            <Link to="/tours" className="text-gray-600 hover:text-blue-600">
              Tour du lịch
            </Link>
            
            {/* About Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center text-gray-600 hover:text-blue-600 focus:outline-none"
                onClick={toggleDropdown}
              >
                Thông tin <FaChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/about"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Giới thiệu
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Liên hệ
                  </Link>
                  <Link
                    to="/faq"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Câu hỏi thường gặp
                  </Link>
                  <Link
                    to="/terms"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Điều khoản sử dụng
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/bookings" className="text-gray-600 hover:text-blue-600">
                  Đặt chỗ của tôi
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600">
                  Tài khoản
                </Link>
                <button
                  onClick={openLogoutConfirmModal}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openLoginModal(true)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => openLoginModal(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 mt-3">
              <Link
                to="/hotels"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Khách sạn
              </Link>
              <Link
                to="/flights"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Chuyến bay
              </Link>
              <Link
                to="/tours"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tour du lịch
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Giới thiệu
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Liên hệ
              </Link>
              <Link
                to="/faq"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Câu hỏi thường gặp
              </Link>
              <Link
                to="/terms"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Điều khoản sử dụng
              </Link>
              
              {/* Auth Buttons - Mobile */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/bookings"
                    className="text-gray-600 hover:text-blue-600 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đặt chỗ của tôi
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-blue-600 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tài khoản
                  </Link>
                  <button
                    onClick={() => {
                      openLogoutConfirmModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-2"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <button
                    onClick={() => {
                      openLoginModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-blue-600 py-2"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      openLoginModal(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header