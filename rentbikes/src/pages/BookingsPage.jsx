import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Toast from '../components/Toast';

const BookingsPage = () => {
  const { bikeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [bikeDetails, setBikeDetails] = useState(null);
  const [loadingBike, setLoadingBike] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fromDate: location.state?.fromDate || '',
    toDate: location.state?.toDate || '',
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bikes/${bikeId}`);
        setBikeDetails(response.data);
      } catch (error) {
        showToast('Could not load bike details. Please try again.', 'error');
        setTimeout(() => navigate('/'), 2500);
      } finally {
        setLoadingBike(false);
      }

      if (user) {
        setFormData(prevData => ({
          ...prevData,
          name: user.username || '',
          email: user.email || '',
        }));
      }
    };
    fetchAndSetData();
  }, [bikeId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let newErrors = {};
    const now = new Date();
    const fromDateTime = new Date(formData.fromDate);
    const toDateTime = new Date(formData.toDate);

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.fromDate) {
      newErrors.fromDate = 'From date & time is required';
    } else if (fromDateTime <= now) {
      newErrors.fromDate = 'From date & time cannot be in the past';
    }

    if (!formData.toDate) {
      newErrors.toDate = 'To date & time is required';
    } else if (toDateTime <= fromDateTime) {
      newErrors.toDate = 'To date & time must be after from date & time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    if (!user || !user.token) {
      showToast('You must be logged in to book a bike.', 'info');
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        {
          bikeId: bikeId,
          from: formData.fromDate,
          to: formData.toDate,
        },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 201) {
        const newBooking = response.data.booking;
        navigate('/payment', {
          state: {
            booking: newBooking
          }
        });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          showToast(`Validation failed: ${error.response.data.message}`, 'error');
        } else if (error.response.status === 409) {
          showToast(error.response.data.message, 'error');
        } else {
          showToast('An unexpected error occurred. Please try again.', 'error');
        }
      } else {
        showToast('Could not connect to the server. Please check your network.', 'error');
      }
    }
  };

  if (loadingBike) {
    return <div className="text-center pt-24">Loading bike details...</div>;
  }

  if (!bikeDetails) {
    return <div className="text-center pt-24">Bike not found or an error occurred.</div>;
  }

  return (
    <div className="container mx-auto pt-32 p-4 max-w-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Book Your Bike</h1>
      <p className="text-gray-600 mb-6 text-center">
        Fill in the details to book the **{bikeDetails.name} ({bikeDetails.type})**
      </p>

      <form onSubmit={handleContinue} className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed"
            readOnly
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed"
            readOnly
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">From Date & Time</label>
          <input
            type="datetime-local"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
          />
          {errors.fromDate && <p className="text-red-500 text-sm">{errors.fromDate}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">To Date & Time</label>
          <input
            type="datetime-local"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
            min={formData.fromDate}
          />
          {errors.toDate && <p className="text-red-500 text-sm">{errors.toDate}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Continue
        </button>
      </form>
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: '' })}
      />
    </div>
  );
};

export default BookingsPage;