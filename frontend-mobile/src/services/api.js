import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL cho backend
// Dùng IP của máy thay vì localhost cho mobile
const BASE_URL = "http://192.168.1.29:3000"; // Thay IP này bằng IP thực của máy bạn

// Tạo instance của axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Tăng timeout để tránh lỗi kết nối
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log("API Request:", config.method?.toUpperCase(), config.url);
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và lỗi
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Đăng nhập - chỉ cần username và password
  login: async (username, password) => {
    try {
      const loginData = { username, password };
      console.log("Attempting login with:", { ...loginData, password: "***" });
      const response = await api.post("/auth/login", loginData);
      console.log("Login successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
        },
      });
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Đăng ký - mặc định role là parent
  register: async (userData) => {
    try {
      const registerData = {
        userData: {
          ...userData,
          // Đảm bảo có đầy đủ thông tin theo schema
          address: userData.address || {
            street: "",
            city: "",
            state: "",
            postal_code: "",
            country: "Vietnam",
          },
        },
        userType: "parent", // Mặc định role là parent
      };

      console.log("Attempting register with:", {
        ...registerData,
        userData: {
          ...registerData.userData,
          password: "***",
        },
      });

      const response = await api.post("/auth/register", registerData);
      console.log("Register successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Register error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("userType");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  },
};

// Storage helpers
export const storageAPI = {
  // Lưu thông tin đăng nhập
  saveUserData: async (token, userData, userType) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await AsyncStorage.setItem("userType", userType);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  },

  // Lấy thông tin người dùng
  getUserData: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("userData");
      const userType = await AsyncStorage.getItem("userType");

      return {
        token,
        userData: userData ? JSON.parse(userData) : null,
        userType,
      };
    } catch (error) {
      console.error("Error getting user data:", error);
      return { token: null, userData: null, userType: null };
    }
  },

  // Xóa thông tin người dùng
  clearUserData: async () => {
    try {
      await AsyncStorage.multiRemove(["userToken", "userData", "userType"]);
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  },
};

export default api;
