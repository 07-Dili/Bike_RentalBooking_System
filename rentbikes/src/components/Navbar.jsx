import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    if (showDropdown) {
      setShowDropdown(false);
    }
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 w-full z-10 bg-gray-800 p-8 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-4xl font-bold">
          <Link to="/">Bike Rentals</Link>
        </div>
        <ul className="flex space-x-6">
          <li><Link to="/bookings" className="hover:text-gray-300 text-2xl">Bookings</Link></li>
          {user ? (
            <li className="relative">
              <button onClick={toggleDropdown} className="flex items-center space-x-2 hover:text-gray-300 focus:outline-none text-2xl">
                <FaUserCircle />
                <span>{user.username}</span>
              </button>
              {showDropdown && (
                <ul className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md shadow-lg py-1">
                  {user.role === 'admin' && (
                    <li>
                      <Link
                        to="/admin"
                        className="block w-full text-left px-4 py-1 hover:bg-gray-600 text-2xl"
                        onClick={() => setShowDropdown(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-1 hover:bg-gray-600 text-2xl"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <>
              <li>
                <Link to="/login" className="flex items-center space-x-2 hover:text-gray-300 text-2xl">
                  <FaUserCircle />
                  <span>Login</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;