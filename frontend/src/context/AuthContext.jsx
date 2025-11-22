import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        console.log('✅ User restored from localStorage:', parsedUser.email);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (googleUserInfo) => {
    try {
      console.log('🔐 Logging in user to backend...');
      console.log('User info:', googleUserInfo);
      console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:8000');
      
      // Create a simple mock token from user sub (Google ID)
      // The backend will create a proper JWT token
      const mockToken = googleUserInfo.sub;
      
      // Send to backend for verification and JWT creation
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/auth/google`,
        { 
          token: mockToken,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          picture: googleUserInfo.picture
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('✅ Backend response:', response.data);
      
      const { access_token, user: userData } = response.data;
      
      // Save to state and localStorage
      setUser(userData);
      setToken(access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', access_token);
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      console.log('✅ Login successful:', userData.email);
      return true;
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout - backend may be slow or not responding');
        alert('Connection timeout. Please check if backend is running.');
      } else if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status:', error.response.status);
        alert(`Login failed: ${error.response.data?.detail || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response from backend');
        console.error('Make sure backend is running on:', process.env.REACT_APP_API_URL || 'http://localhost:8000');
        alert('Cannot connect to backend. Please ensure it is running on http://localhost:8000');
      } else {
        console.error('Error:', error.message);
        alert(`Login error: ${error.message}`);
      }
      
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    console.log('✅ Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated: !!user,
      token 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};