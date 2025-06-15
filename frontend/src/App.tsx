import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import LoginModal from './components/auth/LoginModal';
import ForgotPasswordModal from './components/auth/ForgotPasswordModal';
import ResetPassword from './components/auth/ResetPassword';
import ConfirmLogoutModal from './components/auth/ConfirmLogoutModal';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/home/HomePage';
import ProfilePage from './pages/profile/ProfilePage';
import BookingList from './pages/booking/BookingList';
import BookingDetails from './pages/booking/BookingDetails';
import CreateBookingForm from './pages/booking/CreateBookingForm';
import HotelList from './pages/hotel/HotelList';
import HotelDetails from './pages/hotel/HotelDetails';
import FlightList from './pages/flight/FlightList';
import FlightDetails from './pages/flight/FlightDetails';
import TourList from './pages/tour/TourList';
import TourDetails from './pages/tour/TourDetails';
import AboutPage from './pages/static/AboutPage';
import ContactPage from './pages/static/ContactPage';
import FaqPage from './pages/static/FaqPage';
import TermsPage from './pages/static/TermsPage';
import PaymentOptions from './pages/payment/PaymentOptions';
import PaymentResult from './pages/payment/PaymentResult';
import FakeCardPaymentPage from './pages/payment/FakeCardPaymentPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import VNPayReturnPage from './pages/payment/VNPayReturnPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminBookingsPage from './pages/admin/bookings/AdminBookingsPage';
import AdminRevenuePage from './pages/admin/revenue/AdminRevenuePage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />
          </Route>

          {/* User Routes */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><BookingList /></ProtectedRoute>} />
                <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
                <Route path="/bookings/create" element={<ProtectedRoute><CreateBookingForm /></ProtectedRoute>} />
                <Route path="/payment/:bookingId" element={<ProtectedRoute><PaymentOptions /></ProtectedRoute>} />
                <Route path="/payment/result" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
                <Route path="/payment/result/:paymentId" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
                <Route path="/fake-card-payment/:bookingId" element={<ProtectedRoute><FakeCardPaymentPage /></ProtectedRoute>} />
                <Route path="/payment-success/:bookingId" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                <Route path="/payment/vnpay-return" element={<VNPayReturnPage />} />
                <Route path="/hotels" element={<HotelList />} />
                <Route path="/hotels/:id" element={<HotelDetails />} />
                <Route path="/flights" element={<FlightList />} />
                <Route path="/flights/:id" element={<FlightDetails />} />
                <Route path="/tours" element={<TourList />} />
                <Route path="/tours/:id" element={<TourDetails />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <LoginModal />
        <ForgotPasswordModal />
        <ConfirmLogoutModal />
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
};

export default App;