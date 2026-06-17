import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('shopez_token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await API.get('/auth/profile');
      setUser(res.data.data || res.data.user || res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      localStorage.removeItem('shopez_token');
      localStorage.removeItem('shopez_user');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data || res.data;
    localStorage.setItem('shopez_token', newToken);
    localStorage.setItem('shopez_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    const { token: newToken, user: userData } = res.data.data || res.data;
    localStorage.setItem('shopez_token', newToken);
    localStorage.setItem('shopez_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('shopez_token');
    localStorage.removeItem('shopez_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data) => {
    const res = await API.put('/auth/profile', data);
    const updatedUser = res.data.data || res.data.user || res.data;
    setUser(updatedUser);
    localStorage.setItem('shopez_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
