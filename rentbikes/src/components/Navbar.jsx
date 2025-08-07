import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

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
                <ul className="flex space-x-6 items-center">
                    {user?.role === 'admin' && (
                        <li>
                            <Link to="/admin" className="hover:text-gray-300 text-2xl">Dashboard</Link>
                        </li>
                    )}
                    <li><Link to="/bookings" className="hover:text-gray-300 text-2xl">Bookings</Link></li>
                    
                    {user ? (
                        <li className="relative">
                            <button 
                                onClick={toggleDropdown} 
                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 transition duration-300 ease-in-out"
                            >
                                <FaUserCircle className="text-3xl" />
                                <span className="text-xl">{user.username}</span>
                            </button>
                            {showDropdown && (
                                <ul className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md shadow-lg py-1">
                                    <li>
                                        <button 
                                            onClick={handleLogout} 
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-600 transition duration-300 ease-in-out text-lg"
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                            <span>Logout</span>
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