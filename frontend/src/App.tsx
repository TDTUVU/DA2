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

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <BookingList />
                </ProtectedRoute>
              } />
              <Route path="/bookings/:id" element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              } />
              <Route path="/bookings/create" element={
                <ProtectedRoute>
                  <CreateBookingForm />
                </ProtectedRoute>
              } />
              
              {/* Payment Routes */}
              <Route path="/payment/:bookingId" element={
                <ProtectedRoute>
                  <PaymentOptions />
                </ProtectedRoute>
              } />
              <Route path="/payment/result" element={
                <ProtectedRoute>
                  <PaymentResult />
                </ProtectedRoute>
              } />
              <Route path="/payment/result/:paymentId" element={
                <ProtectedRoute>
                  <PaymentResult />
                </ProtectedRoute>
              } />
              
              {/* Public Routes */}
              <Route path="/hotels" element={<HotelList />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />
              <Route path="/flights" element={<FlightList />} />
              <Route path="/flights/:id" element={<FlightDetails />} />
              <Route path="/tours" element={<TourList />} />
              <Route path="/tours/:id" element={<TourDetails />} />
              
              {/* Static Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Routes>
            <LoginModal />
            <ForgotPasswordModal />
            <ConfirmLogoutModal />
            <ToastContainer position="top-right" autoClose={3000} />
          </Layout>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;