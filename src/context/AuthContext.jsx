import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('joblify_token');
    const storedUser = localStorage.getItem('joblify_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // 🔐 DEV MODE: Admin login bypass for testing
  const login = async (credentials) => {
    const isAdmin = credentials.email === 'admin@joblifyhq.com';
    
    const mockUser = { 
      id: isAdmin ? 'admin-1' : 1, 
      email: credentials.email, 
      role: isAdmin ? 'admin' : 'user', 
      name: isAdmin ? 'Admin User' : 'Demo User',
      tier: isAdmin ? 'elite' : 'free'
    };
    
    setUser(mockUser);
    localStorage.setItem('joblify_user', JSON.stringify(mockUser));
    localStorage.setItem('joblify_token', isAdmin ? 'mock-admin-jwt' : 'mock-jwt-token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${isAdmin ? 'mock-admin-jwt' : 'mock-jwt-token'}`;
  };

  const loginWithGoogle = async () => {
    const mockUser = { id: 'google-1', email: 'user@gmail.com', role: 'user', name: 'Google User', provider: 'google' };
    setUser(mockUser);
    localStorage.setItem('joblify_user', JSON.stringify(mockUser));
    localStorage.setItem('joblify_token', 'mock-google-jwt-token');
    axios.defaults.headers.common['Authorization'] = 'Bearer mock-google-jwt-token';
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('joblify_user');
    localStorage.removeItem('joblify_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
