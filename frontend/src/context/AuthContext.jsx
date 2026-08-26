import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const className = localStorage.getItem('className');

    if (token && role && userId) {
      setUser({ role, userId, className });
    }
    setLoading(false);
  }, []);

  const login = async (email, password, selectedRole) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role, userId, mustChangePassword, className } = response.data;
      
      if (selectedRole && role !== selectedRole) {
        throw new Error(`Account found, but it is not ${selectedRole === 'ROLE_ADMIN' ? 'an Admin' : 'a Student'} account.`);
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      if (className) {
        localStorage.setItem('className', className);
      }
      
      setUser({ role, userId, className });
      
      if (mustChangePassword) {
        navigate('/force-change-password');
      } else if (role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('className');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
