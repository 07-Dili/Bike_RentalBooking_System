import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Bookings from './pages/Bookings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 overflow-x-hidden">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/book/:bikeId" element={<BookingsPage />} />
          <Route path="/payment" element={<PaymentPage />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;