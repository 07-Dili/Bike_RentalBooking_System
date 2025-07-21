import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Toast from '../components/Toast';

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !user.token) {
        navigate('/login');
        return;
      }

      if (location.state?.toastMessage) {
        showToast(location.state.toastMessage, location.state.toastType);
        navigate(location.pathname, { replace: true, state: {} });
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const response = await axios.get('http://localhost:5000/api/bookings', config);
        setBookings(response.data.data);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError('Failed to load bookings. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate, location.state]);

  if (loading) {
    return <div className="text-center pt-24 p-4">Loading your bookings...</div>;
  }

  if (error) {
    return <div className="text-center pt-24 p-4 text-red-500">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <>
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
        <div className="text-center pt-32 p-4">
          <h1 className="text-3xl my-8 font-bold">Your Bookings</h1>
          <p className="text-gray-600">You don't have any bookings yet.</p>
        </div>
      </>
    );
  }

  const getStatusClasses = (status) => {
    if (status?.toLowerCase() === 'paid') {
      return 'text-green-500';
    }
    if (status?.toLowerCase() === 'pending') {
      return 'text-orange-500';
    }
    return 'text-gray-500';
  };

  const handlePayNow = (booking) => {
    if (booking.paymentStatus === 'pending') {
      navigate('/payment', {
        state: {
          booking
        }
      });
    }
  };

  return (
    <>
      <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
      <div className="container mx-auto pt-32 p-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Your Bookings</h1>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 ${booking.paymentStatus === 'pending' ? 'hover:shadow-lg cursor-pointer' : ''}`}
              onClick={() => handlePayNow(booking)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-600">{booking.bikeId?.name || 'Bike Details Missing'}</h2>
                  <p className="text-gray-500">{booking.bikeId?.type}</p>
                </div>
                <span className={`font-semibold text-lg ${getStatusClasses(booking.paymentStatus)}`}>
                  {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1) || 'N/A'}
                </span>
              </div>
              <div className="text-gray-700">
                <p><strong>From:</strong> {new Date(booking.fromDate).toLocaleString()}</p>
                <p><strong>To:</strong> {new Date(booking.toDate).toLocaleString()}</p>
                <p><strong>Total Cost:</strong> ₹{booking.totalCost.toFixed(2)}</p>
                <p><strong>Booking ID:</strong> {booking._id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Bookings;