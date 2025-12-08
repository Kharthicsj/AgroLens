import React, { createContext, useContext, useEffect, useState } from 'react';
import { authUtils } from '../utils/auth';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.log('Error decoding token:', error);
      return true;
    }
  };

  // Check authentication status on app start
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await authUtils.getToken();
      
      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          await authUtils.logout();
          setIsAuthenticated(false);
          setUser(null);
        } else {
          // Token is valid
          const userData = await authUtils.getUserData();
          setIsAuthenticated(true);
          setUser(userData);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (token, userData = null) => {
    try {
      await authUtils.storeToken(token);
      if (userData) {
        await authUtils.storeUserData(userData);
      }
      setIsAuthenticated(true);
      setUser(userData);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authUtils.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiration = async () => {
      if (isAuthenticated) {
        const token = await authUtils.getToken();
        if (token && isTokenExpired(token)) {
          await logout();
        }
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Initial auth check
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
