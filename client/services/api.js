import axios from 'axios';
import { authUtils } from '../utils/auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  async (config) => {
    // Add token to headers if available
    const token = await authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    // Silently handle errors - they'll be caught by the calling code
=======
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
    if (error.response) {
      // Server responded with error status
      console.log('API Error Response:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.log('API No Response:', error.request);
    } else {
      // Something else happened
      console.log('API Error:', error.message);
    }
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Sign up user
  signup: async (userData) => {
    try {
      const response = await api.post('/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Sign in user
  signin: async (credentials) => {
    try {
      const response = await api.post('/signin', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },
};

// User API functions
export const userAPI = {
  // Fetch user details
  fetchUserData: async () => {
    try {
      const response = await api.get('/fetchUser');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user data' };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/updateProfile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },
};

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// Fertilizer recommendations API
export const fertilizerAPI = {
  list: async (params = {}) => {
    try {
      const response = await api.get('/fertilizer-recommendations', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recommendations' };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/fertilizer-recommendations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recommendation' };
    }
  },

  getDistricts: async () => {
    try {
      const response = await api.get('/fertilizer-recommendations/districts');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch districts' };
    }
  }
};

=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
export default api;
