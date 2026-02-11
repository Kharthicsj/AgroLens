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
  const [isGuest, setIsGuest] = useState(false);
  const [intendedDestination, setIntendedDestination] = useState(null);

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

      // Check if user is in guest mode
      const guestMode = await authUtils.getGuestMode();
      if (guestMode) {
        setIsGuest(true);
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const token = await authUtils.getToken();

      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          await authUtils.logout();
          setIsAuthenticated(false);
          setUser(null);
          setIsGuest(false);
        } else {
          // Token is valid
          const userData = await authUtils.getUserData();
          setIsAuthenticated(true);
          setUser(userData);
          setIsGuest(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsGuest(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (token, userData = null) => {
    try {
      // Clear guest mode
      await authUtils.setGuestMode(false);

      await authUtils.storeToken(token);
      if (userData) {
        await authUtils.storeUserData(userData);
      }
      setIsAuthenticated(true);
      setUser(userData);
      setIsGuest(false);

      // Return intended destination for navigation
      const destination = intendedDestination;
      setIntendedDestination(null);
      return destination;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  // Continue as Guest function
  const continueAsGuest = async () => {
    try {
      await authUtils.setGuestMode(true);
      setIsGuest(true);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  // Set intended destination when guest tries to access restricted feature
  const setIntendedPage = (pageName) => {
    setIntendedDestination(pageName);
  };

  // Logout function
  const logout = async () => {
    try {
      await authUtils.logout();
      await authUtils.setGuestMode(false);
      setIsAuthenticated(false);
      setUser(null);
      setIsGuest(false);
      setIntendedDestination(null);
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
    isGuest,
    intendedDestination,
    login,
    logout,
    continueAsGuest,
    setIntendedPage,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
