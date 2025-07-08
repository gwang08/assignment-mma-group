import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL cho backend
const BASE_URL = "http://192.168.1.204:3000"; // Thay IP này bằng IP thực của máy bạn

// Tạo instance của axios cho parent API
const parentAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header
parentAPI.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log("Parent API Request:", config.method?.toUpperCase(), config.url);
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
parentAPI.interceptors.response.use(
  (response) => {
    // console.log("Parent API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("Parent API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Parent API functions
export const parentsAPI = {
  // Profile
  getProfile: async () => {
    try {
      const response = await api.get("/parent/profile");
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Students
  getStudents: async () => {
    try {
      const response = await api.get("/parent/students");
      return response.data;
    } catch (error) {
      console.error("Get students error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Health Profiles
  getHealthProfiles: async () => {
    try {
      // First get all students
      const studentsResponse = await api.get("/parent/students");
      if (!studentsResponse.data.success || !studentsResponse.data.data) {
        throw new Error("Failed to fetch students");
      }

      // Extract student data from the response format
      const studentData = studentsResponse.data.data.map(
        (item) => item.student
      );

      // Then get health profile for each student
      const profiles = [];
      for (const student of studentData) {
        try {
          const profileResponse = await api.get(
            `/parent/students/${student._id}/health-profile`
          );
          if (profileResponse.data.success && profileResponse.data.data) {
            profiles.push(profileResponse.data.data);
          }
        } catch (error) {
          // Skip if student doesn't have a health profile yet
          console.warn(`No health profile found for student ${student._id}`);
        }
      }

      return { success: true, data: profiles };
    } catch (error) {
      console.error("Get health profiles error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  getStudentHealthProfile: async (studentId) => {
    try {
      const response = await api.get(
        `/parent/students/${studentId}/health-profile`
      );
      return response.data;
    } catch (error) {
      console.error("Get student health profile error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  updateStudentHealthProfile: async (studentId, profileData) => {
    try {
      const response = await api.put(
        `/parent/students/${studentId}/health-profile`,
        profileData
      );
      return response.data;
    } catch (error) {
      console.error("Update student health profile error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Medicine Requests
  getMedicineRequests: async () => {
    try {
      const response = await api.get("/parent/medicine-requests");
      return response.data;
    } catch (error) {
      console.error("Get medicine requests error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  createMedicineRequest: async (requestData) => {
    try {
      const response = await api.post("/parent/medicine-requests", requestData);
      return response.data;
    } catch (error) {
      console.error("Create medicine request error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  createMedicineRequestForStudent: async (studentId, requestData) => {
    try {
      const response = await api.post(
        `/parent/students/${studentId}/medicine-requests`,
        requestData
      );
      return response.data;
    } catch (error) {
      console.error("Create medicine request for student error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  updateMedicineRequest: async (requestId, updateData) => {
    try {
      const response = await api.put(
        `/parent/medicine-requests/${requestId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Update medicine request error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  deleteMedicineRequest: async (requestId) => {
    try {
      const response = await api.delete(
        `/parent/medicine-requests/${requestId}`
      );
      return response.data;
    } catch (error) {
      console.error("Delete medicine request error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Campaigns
  getCampaigns: async () => {
    try {
      const response = await api.get("/parent/campaigns");
      return response.data;
    } catch (error) {
      console.error("Get campaigns error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Campaign Consent
  submitCampaignConsent: async (campaignId, studentId, consentData) => {
    try {
      const response = await api.post(
        `/parent/campaigns/${campaignId}/students/${studentId}/consent`,
        consentData
      );
      return response.data;
    } catch (error) {
      console.error("Submit campaign consent error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  updateCampaignConsent: async (consentId, consentData) => {
    try {
      const response = await api.put(
        `/parent/campaign-consents/${consentId}`,
        consentData
      );
      return response.data;
    } catch (error) {
      console.error("Update campaign consent error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Consultations
  getConsultationSchedules: async () => {
    try {
      const response = await api.get("/parent/consultation-schedules");
      return response.data;
    } catch (error) {
      console.error("Get consultation schedules error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  createConsultationRequest: async (requestData) => {
    try {
      const response = await api.post(
        "/parent/consultation-schedules",
        requestData
      );
      return response.data;
    } catch (error) {
      console.error("Create consultation request error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  updateConsultationRequest: async (scheduleId, updateData) => {
    try {
      const response = await api.put(
        `/parent/consultation-schedules/${scheduleId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Update consultation request error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  cancelConsultationRequest: async (scheduleId) => {
    try {
      const response = await api.put(
        `/parent/consultation-schedules/${scheduleId}`,
        { status: "cancelled" }
      );
      return response.data;
    } catch (error) {
      console.error("Cancel consultation request error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Medical Events
  getStudentMedicalEvents: async (studentId) => {
    try {
      const response = await api.get(
        `/parent/students/${studentId}/medical-events`
      );
      return response.data;
    } catch (error) {
      console.error("Get student medical events error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Student Link Requests
  getStudentLinkRequests: async () => {
    try {
      const response = await api.get("/parent/student-link/requests");
      return response.data;
    } catch (error) {
      console.error("Get student link requests error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  createStudentLinkRequest: async (
    studentId,
    relationship,
    isEmergencyContact = false,
    notes = ""
  ) => {
    try {
      const response = await api.post("/parent/student-link/request", {
        studentId: studentId,
        relationship: relationship,
        is_emergency_contact: isEmergencyContact,
        notes: notes,
      });
      return response.data;
    } catch (error) {
      console.error("Create student link request error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },
};

export default parentsAPI;
