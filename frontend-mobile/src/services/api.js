import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL cho backend
// Dùng IP của máy thay vì localhost cho mobile
const BASE_URL = 'http://172.20.10.2:3000'; // Thay IP này bằng IP thực của máy bạn

// Tạo instance của axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Tăng timeout để tránh lỗi kết nối
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Đăng nhập
  login: async (loginData) => {
    try {
      const response = await api.post('/auth/login', loginData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Đăng ký
  register: async (registerData) => {
    try {
      const response = await api.post('/auth/register', registerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userType');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
};

// Storage helpers
export const storageAPI = {
  // Lưu thông tin đăng nhập
  saveUserData: async (token, userData, userType) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userType', userType);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  // Lấy thông tin người dùng
  getUserData: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      const userType = await AsyncStorage.getItem('userType');
      
      return {
        token,
        userData: userData ? JSON.parse(userData) : null,
        userType,
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return { token: null, userData: null, userType: null };
    }
  },

  // Xóa thông tin người dùng
  clearUserData: async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData', 'userType']);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },
};

export default api;
