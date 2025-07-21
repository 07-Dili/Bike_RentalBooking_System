import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Bikes');
  const [dateWarning, setDateWarning] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchAllBikes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/bikes');
      setBikes(response.data);
      setActiveFilter('All Bikes');
      setFromDate('');
      setToDate('');
      setShowDateFilters(false);
      setDateWarning('');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchBikesByType = async (type) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/bikes', {
        params: {
          type: type
        }
      });
      setBikes(response.data);
      setActiveFilter(type);
      setShowDropdown(false);
      setShowDateFilters(false);
      setDateWarning('');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredBikesByDates = async () => {
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    const now = new Date();

    if (!fromDate || !toDate) {
      setDateWarning('Please select both From and To dates to search.');
      return;
    }

    if (fromDateObj < now) {
      setDateWarning('The "From" date and time cannot be in the past.');
      return;
    }

    if (toDateObj <= fromDateObj) {
      setDateWarning('The "To" date must be after the "From" date.');
      return;
    }

    setDateWarning('');
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/bikes', {
        params: {
          fromDate,
          toDate
        }
      });
      setBikes(response.data);
      setActiveFilter('Bikes for Your Selected Period');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBikes();
  }, []);

  const handleBookNowClick = (bikeId, isAvailable) => {
    if (!isAvailable) {
      return;
    }
    if (user) {
      if (fromDate && toDate) {
        navigate(`/book/${bikeId}`, {
          state: {
            fromDate: fromDate,
            toDate: toDate
          }
        });
      } else {
        navigate(`/book/${bikeId}`);
      }
    } else {
      navigate('/login', { state: { fromBooking: true } });
    }
  };

  const handleDateFilterClick = () => {
    setShowDateFilters(!showDateFilters);
    setShowDropdown(false);
  };

  const handleShowAllClick = () => {
    fetchAllBikes();
    setShowDropdown(false);
  };

  return (
    <div className="container mx-auto pt-32 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Bike Rentals</h1>
        <p className="text-lg text-gray-700">
          Find and book the perfect bike for your next adventure.
        </p>
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleShowAllClick}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Show All Bikes
          </button>

          <div className="relative inline-block text-left">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md transition duration-300"
            >
              Filter
            </button>
            {showDropdown && (
              <div className="origin-top-right absolute z-10 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button onClick={() => fetchBikesByType('Classic')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Classic</button>
                  <button onClick={() => fetchBikesByType('Sports')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Sports</button>
                  <button onClick={() => fetchBikesByType('Scooty')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Scooty</button>
                  <button onClick={() => fetchBikesByType('Electric')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Electric</button>
                  <button onClick={() => fetchBikesByType('Standard')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Standard</button>
                  <div className="border-t border-gray-100"></div>
                  <button onClick={handleDateFilterClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Filter By Dates</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDateFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700">From</label>
              <input
                type="datetime-local"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min={getMinDateTime()}
              />
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700">To</label>
              <input
                type="datetime-local"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min={fromDate || getMinDateTime()}
              />
            </div>
            <div className="w-full md:w-auto self-end">
              <button
                onClick={fetchFilteredBikesByDates}
                className="w-full md:w-auto mt-6 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Search Bikes
              </button>
            </div>
          </div>
          {dateWarning && (
            <p className="text-red-500 text-sm text-center mt-4">{dateWarning}</p>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center mt-10">Loading bikes...</div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-center mb-8">
            {`Showing: ${activeFilter}`}
          </h2>
          {bikes.length === 0 ? (
            <p className="text-center">No bikes available. Try adjusting your search or check back later!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bikes.map((bike) => (
                <div key={bike._id} className="bg-white rounded-lg shadow-md p-6">
                  <img src={bike.imageUrl} alt={bike.name} className="w-full h-48 object-cover rounded mb-4" />
                  <h3 className="text-xl font-bold">{bike.name}</h3>
                  <p className="text-gray-600">{bike.type} </p>
                  <p className="text-blue-500 font-bold mt-2">₹{bike.rentalPricePerHour} / hour</p>
                  <p className={`mt-2 ${bike.availability ? 'text-green-500' : 'text-red-500'}`}>
                    Status: {bike.availability ? 'Available' : 'Unavailable'}
                  </p>
                  <button
                    onClick={() => handleBookNowClick(bike._id, bike.availability)}
                    disabled={!bike.availability}
                    className={`mt-4 w-full block text-center text-white py-2 font-bold transition-colors duration-300 rounded-md ${bike.availability ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;