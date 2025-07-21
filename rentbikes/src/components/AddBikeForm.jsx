import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AddBikeForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Road Bike',
    rentalPricePerHour: '',
    imageUrl: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user || !user.token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/admin/bikes',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setMessage(res.data.message);
      setFormData({
        name: '',
        type: 'Road Bike',
        rentalPricePerHour: '',
        imageUrl: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bike.');
    }
  };

  return (
    <div className="add-bike-form-container">
      <h3>Add New Bike</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Bike Name"
          required
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="Road Bike">Road Bike</option>
          <option value="Mountain Bike">Mountain Bike</option>
          <option value="Electric Bike">Electric Bike</option>
          <option value="Cruiser Bike">Cruiser Bike</option>
          <option value="Fat Tire">Fat Tire</option>
        </select>
        <input
          type="number"
          name="rentalPricePerHour"
          value={formData.rentalPricePerHour}
          onChange={handleChange}
          placeholder="Rental Price per Hour"
          required
        />
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="Image URL"
          required
        />
        <button type="submit">Add Bike</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AddBikeForm;