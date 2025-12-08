import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authUtils = {
  // Store token
  storeToken: async (token) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  },

  // Get token
  getToken: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  // Remove token
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  },

  // Store user data
  storeUserData: async (userData) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  },

  // Get user data
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  // Remove user data
  removeUserData: async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      return true;
    } catch (error) {
      console.error('Error removing user data:', error);
      return false;
    }
  },

  // Clear all auth data
  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      return true;
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Logout user (clear all data)
  logout: async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }
};
