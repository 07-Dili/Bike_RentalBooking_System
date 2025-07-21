import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedFeature, setSelectedFeature] = useState('bikes');

  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    rentalPricePerHour: '',
    imageUrl: '',
  });
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [currentBikeId, setCurrentBikeId] = useState(null);

  const [bikes, setBikes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [toastData, setToastData] = useState({ message: '', type: '' });

  const dismissToast = () => {
    setToastData({ message: '', type: '' });
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const fetchBikes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bikes', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBikes(res.data);
      setLoading(false);
    } catch (err) {
      setToastData({ message: 'Failed to fetch bikes.', type: 'error' });
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/bookings', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      setToastData({ message: 'Failed to fetch bookings.', type: 'error' });
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setToastData({ message: 'Failed to fetch users.', type: 'error' });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.token) {
      if (selectedFeature === 'bikes') {
        fetchBikes();
      } else if (selectedFeature === 'bookings') {
        fetchBookings();
      } else if (selectedFeature === 'users') {
        fetchUsers();
      }
    }
  }, [user, selectedFeature]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isUpdateMode) {
        await axios.put(`http://localhost:5000/api/admin/bikes/${currentBikeId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setToastData({ message: 'Bike updated successfully!', type: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/admin/bikes', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setToastData({ message: 'Bike added successfully!', type: 'success' });
      }
      fetchBikes();
      setFormData({ name: '', type: 'Standard', rentalPricePerHour: '', imageUrl: '' });
      setIsUpdateMode(false);
      setCurrentBikeId(null);
      setSelectedFeature('bikes');
    } catch (error) {
      setToastData({ message: 'Failed to submit. Are you logged in as an admin?', type: 'error' });
    }
  };

  const handleDelete = async (bikeId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/bikes/${bikeId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setToastData({ message: 'Bike deleted successfully!', type: 'success' });
      fetchBikes();
    } catch (error) {
      setToastData({ message: 'Failed to delete bike. Please try again.', type: 'error' });
    }
  };

  const handleUpdateClick = (bike) => {
    setFormData({
      name: bike.name,
      type: bike.type,
      rentalPricePerHour: bike.rentalPricePerHour,
      imageUrl: bike.imageUrl,
    });
    setIsUpdateMode(true);
    setCurrentBikeId(bike._id);
    setSelectedFeature('add-bike');
  };

  const handleUpdateBooking = async (bookingId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, { paymentStatus: newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setToastData({ message: 'Booking status updated!', type: 'success' });
      fetchBookings();
    } catch (error) {
      setToastData({ message: 'Failed to update booking status.', type: 'error' });
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p>Loading data...</p>;
    }
    if (error) {
      return <p className="text-red-500">{error}</p>;
    }

    switch (selectedFeature) {
      case 'bikes':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bikes.map((bike) => (
              <div key={bike._id} className="border rounded-lg p-4 shadow">
                <img src={bike.imageUrl} alt={bike.name} className="w-full h-48 object-cover mb-2" />
                <h4 className="font-bold text-lg">{bike.name}</h4>
                <p>Type: {bike.type}</p>
                <p>Price: ${bike.rentalPricePerHour}/hr</p>
                <p>Status: {bike.availability ? 'Available' : 'Rented'}</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button onClick={() => handleUpdateClick(bike)} className="bg-yellow-500 text-white px-4 py-2 rounded">Update</button>
                  <button onClick={() => handleDelete(bike._id)} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'add-bike':
        return (
          <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{isUpdateMode ? 'Update Bike' : 'Add a New Bike'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4"><label className="block text-gray-700">Bike Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded" /></div>
              <div className="mb-4">
                <label className="block text-gray-700">Bike Type</label>
                <select name="type" value={formData.type} onChange={handleChange} required className="w-full px-3 py-2 border rounded">
                  <option value="Classic">Classic</option>
                  <option value="Sports">Sports</option>
                  <option value="Scooty">Scooty</option>
                  <option value="Electric">Electric</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              <div className="mb-4"><label className="block text-gray-700">Rental Price (per hour)</label><input type="number" name="rentalPricePerHour" value={formData.rentalPricePerHour} onChange={handleChange} required className="w-full px-3 py-2 border rounded" /></div>
              <div className="mb-4"><label className="block text-gray-700">Image URL</label><input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required className="w-full px-3 py-2 border rounded" /></div>
              <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600">{isUpdateMode ? 'Update Bike' : 'Add Bike'}</button>
            </form>
          </div>
        );
      case 'bookings':
        return (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="border rounded-lg p-4 shadow">
                <h4 className="font-bold text-lg">Booking ID: {booking._id}</h4>
                <p>Bike: {booking.bikeId?.name || 'N/A'}</p>
                <p>User: {booking.userId?.name || booking.userId?.username || 'N/A'}</p>
                <p>From: {new Date(booking.fromDate).toLocaleDateString()}</p>
                <p>To: {new Date(booking.toDate).toLocaleDateString()}</p>
                <p>Total Cost: ${booking.totalCost}</p>
                <p>Status: <span className="font-semibold">{booking.paymentStatus}</span></p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button onClick={() => handleUpdateBooking(booking._id, 'paid')} className="bg-green-500 text-white px-4 py-2 rounded">Mark as Paid</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'users':
        return (
          <div className="flex flex-col gap-4">
            {users.map((user) => (
              <div key={user._id} className="border rounded-lg p-4 shadow">
                <h4 className="font-bold text-lg">User: {user.name || user.username}</h4>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      {toastData.message && <Toast message={toastData.message} type={toastData.type} onDismiss={dismissToast} />}
      <h1 className="text-3xl font-bold text-center my-8">Admin Dashboard</h1>
      <div className="flex justify-center space-x-4 mb-8">
        <button onClick={() => setSelectedFeature('bikes')} className={`px-4 py-2 rounded ${selectedFeature === 'bikes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Manage Bikes</button>
        <button onClick={() => setSelectedFeature('add-bike')} className={`px-4 py-2 rounded ${selectedFeature === 'add-bike' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Add New Bike</button>
        <button onClick={() => setSelectedFeature('bookings')} className={`px-4 py-2 rounded ${selectedFeature === 'bookings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>View Bookings</button>
        <button onClick={() => setSelectedFeature('users')} className={`px-4 py-2 rounded ${selectedFeature === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>View All Users</button>
      </div>
      {renderContent()}
    </div>
  );
};

export default AdminDashboard;