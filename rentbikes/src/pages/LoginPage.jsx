import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Toast from '../components/Toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    const bookingMessage = location.state?.fromBooking;
    if (bookingMessage) {
      showToast('Please login to continue with your booking.', 'info');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setLoading(true);
    try {
      await login(email, password);

      showToast('Login successful!', 'success');

      navigate('/');

    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setFormErrors({ general: err.response?.data?.message || 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: '' })}
      />
      <div className="flex flex-col justify-center items-center min-h-screen pt-24">
        <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-sm">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
            Sign In to Your Account
          </h2>
          {formErrors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formErrors.general}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out ${formErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-transparent'}`}
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out ${formErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-transparent'}`}
                required
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-gray-900 hover:text-gray-800 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;