import axios from 'axios';
import { authUtils } from '../utils/auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    return status < 500; // Resolve only if status < 500
  }
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
    // Silently handle errors - they'll be caught by the calling code
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

// Disease Detection API
export const diseaseAPI = {
  // Test backend connectivity
  testConnection: async () => {
    try {
      const testUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/`;
      console.log('🔗 Testing connection to:', testUrl);
      const response = await axios.get(testUrl, {
        timeout: 5000
      });
      console.log('✅ Backend connection test successful:', response.status);
      return true;
    } catch (error) {
      console.error('❌ Backend connection test failed:', {
        url: `${process.env.EXPO_PUBLIC_API_URL}/api/`,
        message: error.message,
        code: error.code
      });
      return false;
    }
  },

  // Detect disease from image
  detect: async (imageData) => {
    try {
      console.log('🔍 Disease API: Starting detection...');

      // Get token
      const token = await authUtils.getToken();
      if (!token) {
        throw new Error('Not authenticated. Please login again.');
      }

      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/disease/detect`;
      console.log('📡 Sending to:', url);
      console.log('📦 Payload size:', JSON.stringify(imageData).length, 'bytes');

      // Send request using axios directly
      const response = await axios({
        method: 'POST',
        url: url,
        data: imageData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 90000, // 90 seconds
      });

      console.log('✅ Response status:', response.status);

      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Detection failed');
      }
    } catch (error) {
      console.error('❌ Disease Detection Error:', {
        message: error.message,
        status: error.response?.status,
        code: error.code
      });

      // Better error messages
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw { message: 'Request timeout. Server is taking too long to respond.' };
      }
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
        throw { message: 'Network error. Please check your internet connection and ensure backend is running on http://192.168.1.38:3000' };
      }

      throw error.response?.data || { message: error.message || 'Failed to detect disease' };
    }
  },  // Get detection history
  getHistory: async (params = {}) => {
    try {
      const response = await api.get('/disease/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch history' };
    }
  },

  // Get single detection
  getById: async (id) => {
    try {
      const response = await api.get(`/disease/detection/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch detection' };
    }
  },

  // Update detection
  update: async (id, updateData) => {
    try {
      const response = await api.patch(`/disease/detection/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update detection' };
    }
  },

  // Delete detection
  delete: async (id, hardDelete = false) => {
    try {
      const response = await api.delete(`/disease/detection/${id}`, {
        params: { hardDelete }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete detection' };
    }
  },

  // Get user statistics
  getStats: async () => {
    try {
      const response = await api.get('/disease/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  }
};

// Helper function for disease detection (backward compatibility)
export const detectDiseaseFromImage = async (imageData) => {
  return diseaseAPI.detect(imageData);
};

export default api;
