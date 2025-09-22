import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
        return parsedUser;
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('https://bike-rentalbooking-system-backend.onrender.com/api/auth/login', {
        email,
        password,
      });

      const { token, user: userDataFromBackend } = res.data;

      const fullUserData = {
        id: userDataFromBackend.id,
        username: userDataFromBackend.username,
        email: userDataFromBackend.email,
        role: userDataFromBackend.role,
        token: token,
      };

      setUser(fullUserData);
      localStorage.setItem('currentUser', JSON.stringify(fullUserData));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return fullUserData;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);