import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  // Sync state with local storage & test validity on mount
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        // If bypass mock token, keep the session active without network check
        if (storedToken.startsWith('mock_token_')) {
          setLoading(false);
          return;
        }

        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid:', err.message);
          // If offline/network error, don't force logout if we have user
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    verifyUser();

    const handleAutoLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleAutoLogout);
    return () => window.removeEventListener('auth:logout', handleAutoLogout);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: authUser, accessToken, refreshToken } = res.data.data || res.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(authUser));

    setUser(authUser);
    setToken(accessToken);
    return authUser;
  };

  /**
   * One-Click Instant Bypass for Review & Demo Testing
   */
  const bypassLogin = (targetRole = 'student') => {
    let mockUser;
    const normalized = targetRole.toLowerCase();

    if (normalized === 'admin' || normalized === 'warden') {
      mockUser = {
        _id: 'mock-warden-001',
        id: 'mock-warden-001',
        name: 'Dr. R.K. Verma (Chief Warden)',
        email: 'warden@hostel.edu',
        role: 'admin',
        phone: '9811002233',
      };
    } else if (normalized === 'staff' || normalized === 'electrician') {
      mockUser = {
        _id: 'mock-staff-001',
        id: 'mock-staff-001',
        name: 'Suresh Kumar',
        email: 'electrician@hostel.edu',
        role: 'staff',
        staffTrade: 'Electrician',
        phone: '9822003344',
      };
    } else if (normalized === 'plumber') {
      mockUser = {
        _id: 'mock-plumber-001',
        id: 'mock-plumber-001',
        name: 'Ramesh Patel',
        email: 'plumber@hostel.edu',
        role: 'staff',
        staffTrade: 'Plumber',
        phone: '9833004455',
      };
    } else {
      mockUser = {
        _id: 'mock-student-001',
        id: 'mock-student-001',
        name: 'Aarav Patel',
        email: 'student1@hostel.edu',
        role: 'student',
        roomNumber: 'B-204',
        phone: '9855001122',
      };
    }

    const mockToken = `mock_token_${Date.now()}`;
    const mockRefresh = `mock_refresh_${Date.now()}`;

    localStorage.setItem('accessToken', mockToken);
    localStorage.setItem('refreshToken', mockRefresh);
    localStorage.setItem('user', JSON.stringify(mockUser));

    setUser(mockUser);
    setToken(mockToken);
    return mockUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { user: authUser, accessToken, refreshToken } = res.data.data || res.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(authUser));

    setUser(authUser);
    setToken(accessToken);
    return authUser;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken && !refreshToken.startsWith('mock_')) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        bypassLogin,
        register,
        logout,
      }}
    >
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
