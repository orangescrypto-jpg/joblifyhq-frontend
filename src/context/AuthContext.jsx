import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('joblify_token');
    const storedUser = localStorage.getItem('joblify_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    // 🔌 Replace with real API call later
    const mockUser = { id: 1, email: credentials.email, role: 'user', name: 'Demo User' };
    setUser(mockUser);
    localStorage.setItem('joblify_user', JSON.stringify(mockUser));
    localStorage.setItem('joblify_token', 'mock-jwt-token');
    axios.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token';
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('joblify_user');
    localStorage.removeItem('joblify_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
