import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.me()
        .then((data) => {
          setUser(data.user);
          setShop(data.shop);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setShop(data.shop);
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setShop(data.shop);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShop(null);
  };

  return (
    <AuthContext.Provider value={{ user, shop, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
