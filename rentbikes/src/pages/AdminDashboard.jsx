import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMotorcycle, faCalendarCheck, faUsers, faPlusCircle, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedFeature, setSelectedFeature] = useState('bikes');

  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    rentalPricePerHour: '',
    imageUrl: '',
    availability: true,
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
      const res = await axios.get('https://brbs.onrender.com/api/bikes', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBikes(res.data);
      setError('');
    } catch (err) {
      setToastData({ message: 'Failed to fetch bikes.', type: 'error' });
      setError('Failed to load bikes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://brbs.onrender.com/api/admin/bookings', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBookings(res.data);
      setError('');
    } catch (err) {
      setToastData({ message: 'Failed to fetch bookings.', type: 'error' });
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://brbs.onrender.com/api/admin/users', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(res.data);
      setError('');
    } catch (err) {
      setToastData({ message: 'Failed to fetch users.', type: 'error' });
      setError('Failed to load users.');
    } finally {
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isUpdateMode) {
        await axios.put(`https://brbs.onrender.com/api/admin/bikes/${currentBikeId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setToastData({ message: 'Bike updated successfully!', type: 'success' });
      } else {
        await axios.post('https://brbs.onrender.com/api/admin/bikes', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setToastData({ message: 'Bike added successfully!', type: 'success' });
      }
      setFormData({ name: '', type: 'Standard', rentalPricePerHour: '', imageUrl: '', availability: true });
      setIsUpdateMode(false);
      setCurrentBikeId(null);
      setSelectedFeature('bikes');
    } catch (error) {
      setToastData({ message: 'Failed to submit. Check your input and admin status.', type: 'error' });
    }
  };

  const handleDelete = async (bikeId) => {
    if (!window.confirm("Are you sure you want to delete this bike?")) {
      return;
    }
    try {
      await axios.delete(`https://brbs.onrender.com/api/admin/bikes/${bikeId}`, {
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
      availability: bike.availability,
    });
    setIsUpdateMode(true);
    setCurrentBikeId(bike._id);
    setSelectedFeature('add-bike');
  };

  const handleUpdateBooking = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      return;
    }
    try {
      await axios.put(`https://brbs.onrender.com/api/admin/bookings/${bookingId}/status`, { paymentStatus: newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setToastData({ message: `Booking marked as ${newStatus}!`, type: 'success' });
      fetchBookings();
    } catch (error) {
      setToastData({ message: 'Failed to update booking status.', type: 'error' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-600">Loading data...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    switch (selectedFeature) {
      case 'bikes':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Bikes</h2>
            {bikes.length === 0 ? (
              <p className="text-center text-gray-600">No bikes found. Add some!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bikes.map((bike) => (
                  <div key={bike._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-md flex flex-col">
                    <img src={bike.imageUrl} alt={bike.name} className="w-full h-48 object-cover rounded-md mb-4" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x240/cccccc/000000?text=No+Image"; }} />
                    <h4 className="font-bold text-xl text-gray-900 mb-2">{bike.name}</h4>
                    <p className="text-gray-700"><strong>Type:</strong> {bike.type}</p>
                    <p className="text-gray-700"><strong>Price:</strong> ₹{bike.rentalPricePerHour}/hr</p>
                    <p className="text-gray-700"><strong>Status:</strong> <span className={`${bike.availability ? 'text-green-600' : 'text-red-600'} font-semibold`}>{bike.availability ? 'Available' : 'Rented'}</span></p>
                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                      <button onClick={() => handleUpdateClick(bike)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition duration-200 ease-in-out">Update</button>
                      <button onClick={() => handleDelete(bike._id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200 ease-in-out">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'add-bike':
        return (
          <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">{isUpdateMode ? 'Update Bike' : 'Add a New Bike'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Bike Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">Bike Type</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Classic">Classic</option>
                  <option value="Sports">Sports</option>
                  <option value="Scooty">Scooty</option>
                  <option value="Electric">Electric</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rentalPricePerHour">Rental Price (per hour)</label>
                <input type="number" id="rentalPricePerHour" name="rentalPricePerHour" value={formData.rentalPricePerHour} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">Image URL</label>
                <input type="text" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {isUpdateMode && (
                <div className="mb-4 flex items-center">
                  <input type="checkbox" id="availability" name="availability" checked={formData.availability} onChange={handleChange} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label className="text-gray-700 text-sm font-bold" htmlFor="availability">Available</label>
                </div>
              )}
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 ease-in-out shadow-md">
                {isUpdateMode ? 'Update Bike' : 'Add Bike'}
              </button>
            </form>
          </div>
        );
      case 'bookings':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-center text-gray-600">No bookings found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                    <h4 className="font-bold text-xl text-gray-900 mb-2">Booking ID: <span className="text-blue-700">{booking._id}</span></h4>
                    <p className="text-gray-700"><strong>Bike:</strong> {booking.bikeId?.name || 'N/A'} ({booking.bikeId?.type || 'N/A'})</p>
                    <p className="text-gray-700"><strong>User:</strong> {booking.userId?.name || booking.userId?.username || 'N/A'} ({booking.userId?.email || 'N/A'})</p>
                    <p className="text-gray-700"><strong>From:</strong> {new Date(booking.fromDate).toLocaleString()}</p>
                    <p className="text-gray-700"><strong>To:</strong> {new Date(booking.toDate).toLocaleString()}</p>
                    <p className="text-gray-700"><strong>Total Cost:</strong> ₹{booking.totalCost ? booking.totalCost.toFixed(2) : 'N/A'}</p>
                    <p className="text-gray-700"><strong>Payment Status:</strong> <span className={`font-semibold ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>{booking.paymentStatus}</span></p>
                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                      {booking.paymentStatus !== 'paid' && (
                        <button onClick={() => handleUpdateBooking(booking._id, 'paid')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200 ease-in-out">Mark as Paid</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'users':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">All Users</h2>
            {users.length === 0 ? (
              <p className="text-center text-gray-600">No users found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((userItem) => (
                  <div key={userItem._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                    <h4 className="font-bold text-xl text-gray-900 mb-2">User: <span className="text-blue-700">{userItem.name || userItem.username || 'N/A'}</span></h4>
                    <p className="text-gray-700"><strong>Email:</strong> {userItem.email}</p>
                    <p className="text-gray-700"><strong>Role:</strong> <span className="font-semibold">{userItem.role}</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-inter pt-24">
      <div className="w-64 bg-gray-900 text-white flex flex-col shadow-lg">
        <nav className="flex-1 py-4">
          <ul className="space-y-2 px-4 pt-5">
            <li>
              <button
                onClick={() => { setSelectedFeature('bikes'); setIsUpdateMode(false); }}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition duration-200 ease-in-out text-lg ${
                  selectedFeature === 'bikes' ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <FontAwesomeIcon icon={faMotorcycle} className="w-5 h-5" />
                <span>Manage Bikes</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setSelectedFeature('add-bike'); setIsUpdateMode(false); setFormData({ name: '', type: 'Standard', rentalPricePerHour: '', imageUrl: '', availability: true }); setCurrentBikeId(null);}}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition duration-200 ease-in-out text-lg ${
                  selectedFeature === 'add-bike' && !isUpdateMode ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <FontAwesomeIcon icon={faPlusCircle} className="w-5 h-5" />
                <span>Add New Bike</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setSelectedFeature('bookings'); setIsUpdateMode(false); }}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition duration-200 ease-in-out text-lg ${
                  selectedFeature === 'bookings' ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <FontAwesomeIcon icon={faCalendarCheck} className="w-5 h-5" />
                <span>Manage Bookings</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setSelectedFeature('users'); setIsUpdateMode(false); }}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition duration-200 ease-in-out text-lg ${
                  selectedFeature === 'users' ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
                <span>View All Users</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition duration-200 ease-in-out text-lg"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {toastData.message && <Toast message={toastData.message} type={toastData.type} onDismiss={dismissToast} />}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;