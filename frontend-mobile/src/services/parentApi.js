import api from "./api";

/**
 * Parent API Service
 *
 * All endpoints are authenticated with Bearer token automatically via api interceptor
 *
 * Available Endpoints:
 *
 * GET /parent/dashboard/stats - Get dashboard statistics
 * GET /parent/profile - Get authenticated parent profile
 * PUT /parent/profile - Update parent profile
 *
 * GET /parent/students - Get students related to authenticated parent
 * GET /parent/students/{studentId}/health-profile - Get student health profile
 * PUT /parent/students/{studentId}/health-profile - Update student health profile
 * GET /parent/students/{studentId}/medical-events - Get medical events for a student
 * GET /parent/students/{studentId}/medicine-requests - Get medicine requests for specific student
 * POST /parent/students/{studentId}/medicine-requests - Create medicine request for student
 * GET /parent/students/{studentId}/campaign-results - Get campaign results for a student
 * PUT /parent/students/{studentId}/campaigns/{campaignId}/consent - Update campaign consent
 *
 * POST /parent/student-link/request - Request to link with a student
 * GET /parent/student-link/requests - Get link requests status
 *
 * GET /parent/campaigns - Get campaigns for authenticated parent's students
 * GET /parent/consultation-schedules - Get consultation schedules for authenticated parent
 * GET /parent/medicine-requests - Get all medicine requests created by authenticated parent
 */

export const parentAPI = {
  // Dashboard statistics
  getDashboardStats: async () => {
    try {
      // Try the new dedicated endpoint first
      try {
        const response = await api.get("/parent/dashboard/stats");
        return response.data.data; // Return the data object directly
      } catch (dashboardError) {
        // If dashboard endpoint doesn't exist, calculate stats from existing endpoints
        console.log(
          "Dashboard stats endpoint not available, calculating from existing data..."
        );

        // Get children count
        let linkedStudentsCount = 0;
        try {
          const studentsResponse = await api.get("/parent/students");
          linkedStudentsCount = studentsResponse.data?.data?.length || 0;
        } catch (e) {
          console.warn("Could not get students count:", e);
        }

        // Get medicine requests count
        let pendingMedicineRequestsCount = 0;
        try {
          const medicineResponse = await api.get("/parent/medicine-requests");
          const requests = medicineResponse.data?.data || [];
          pendingMedicineRequestsCount = requests.filter(
            (req) => req.status === "pending"
          ).length;
        } catch (e) {
          console.warn("Could not get medicine requests count:", e);
        }

        // For now, use placeholder values for these
        const newNotificationsCount = 0;
        const upcomingConsultationsCount = 0;

        return {
          linkedStudentsCount,
          pendingMedicineRequestsCount,
          newNotificationsCount,
          upcomingConsultationsCount,
        };
      }
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Profile management
  getProfile: async () => {
    try {
      const response = await api.get("/parent/profile");
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/parent/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Children management - Get students related to authenticated parent
  getChildren: async () => {
    try {
      const response = await api.get("/parent/students");
      return response.data;
    } catch (error) {
      console.error("Get children error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  requestLinkToStudent: async (linkRequestData) => {
    try {
      const response = await api.post(
        "/parent/student-link/request",
        linkRequestData
      );
      return response.data;
    } catch (error) {
      console.error("Link request error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  getLinkRequests: async () => {
    try {
      const response = await api.get("/parent/student-link/requests");
      return response.data;
    } catch (error) {
      console.error("Get link requests error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Health profiles
  getChildHealthProfile: async (studentId) => {
    try {
      const response = await api.get(
        `/parent/students/${studentId}/health-profile`
      );
      return response.data;
    } catch (error) {
      console.error("Get health profile error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  updateChildHealthProfile: async (studentId, healthData) => {
    try {
      const response = await api.put(
        `/parent/students/${studentId}/health-profile`,
        healthData
      );
      return response.data;
    } catch (error) {
      console.error("Update health profile error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Medical events for a student
  getMedicalEventsForChild: async (studentId) => {
    try {
      const response = await api.get(
        `/parent/students/${studentId}/medical-events`
      );
      return response.data;
    } catch (error) {
      console.error("Get medical events for child error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Medicine requests
  getMedicineRequests: async () => {
    try {
      const response = await api.get("/parent/medicine-requests");
      return response.data;
    } catch (error) {
      console.error("Get medicine requests error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  getMedicineRequestsForChild: async (studentId) => {
    try {
      const response = await api.get(
        `/parent/students/${studentId}/medicine-requests`
      );
      return response.data;
    } catch (error) {
      console.error("Get medicine requests for child error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  createMedicineRequest: async (studentId, requestData) => {
    try {
      const response = await api.post(
        `/parent/students/${studentId}/medicine-requests`,
        requestData
      );
      return response.data;
    } catch (error) {
      console.error("Create medicine request error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  updateMedicineRequest: async (requestId, requestData) => {
    try {
      const response = await api.put(
        `/parent/medicine-requests/${requestId}`,
        requestData
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

  // Campaign management
  getCampaigns: async () => {
    try {
      const response = await api.get("/parent/campaigns");
      return response.data;
    } catch (error) {
      console.error("Get campaigns error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  getCampaignsForChild: async (studentId) => {
    try {
      const response = await api.get(`/parent/students/${studentId}/campaigns`);
      return response.data;
    } catch (error) {
      console.error("Get campaigns for child error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  provideCampaignConsent: async (studentId, campaignId, consentData) => {
    try {
      const response = await api.put(
        `/parent/students/${studentId}/campaigns/${campaignId}/consent`,
        consentData
      );
      return response.data;
    } catch (error) {
      console.error("Provide campaign consent error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  getCampaignResults: async (studentId, campaignId) => {
    try {
      const response = await api.get(
        `/parent/students/${studentId}/campaign-results`
      );
      return response.data;
    } catch (error) {
      console.error("Get campaign results error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Consultation management
  getConsultationSchedules: async () => {
    try {
      const response = await api.get("/parent/consultation-schedules");
      return response.data;
    } catch (error) {
      console.error("Get consultation schedules error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Helper methods
  hasLinkedChildren: async () => {
    try {
      const children = await parentAPI.getChildren();
      return children && children.data && children.data.length > 0;
    } catch (error) {
      console.error("Check linked children error:", error);
      return false;
    }
  },

  getPendingMedicineRequests: async () => {
    try {
      const response = await parentAPI.getMedicineRequests();
      const requests = response.data || [];
      return requests.filter((request) => request.status === "pending");
    } catch (error) {
      console.error("Get pending medicine requests error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  getChildrenHealthSummary: async () => {
    try {
      const response = await parentAPI.getChildren();
      const children = response.data || [];
      const healthSummaries = {};

      for (const child of children) {
        try {
          const healthProfile = await parentAPI.getChildHealthProfile(child.id);
          healthSummaries[child.id] = {
            child: child,
            healthProfile: healthProfile.data,
            hasAllergies:
              healthProfile.allergies && healthProfile.allergies.length > 0,
            hasConditions:
              healthProfile.medicalConditions &&
              healthProfile.medicalConditions.length > 0,
            hasMedications:
              healthProfile.medications && healthProfile.medications.length > 0,
          };
        } catch (error) {
          console.error(
            `Error getting health profile for child ${child.id}:`,
            error
          );
          healthSummaries[child.id] = {
            child: child,
            healthProfile: null,
            error: true,
          };
        }
      }

      return healthSummaries;
    } catch (error) {
      console.error("Get children health summary error:", error);
      throw error.response?.data || { message: "Network error" };
    }
  },

  // Test function to verify all endpoints are working (for development only)
  testAllEndpoints: async () => {
    const results = {
      working: [],
      failing: [],
    };

    const endpoints = [
      { name: "getDashboardStats", fn: () => parentAPI.getDashboardStats() },
      { name: "getProfile", fn: () => parentAPI.getProfile() },
      { name: "getChildren", fn: () => parentAPI.getChildren() },
      { name: "getLinkRequests", fn: () => parentAPI.getLinkRequests() },
      { name: "getCampaigns", fn: () => parentAPI.getCampaigns() },
      {
        name: "getConsultationSchedules",
        fn: () => parentAPI.getConsultationSchedules(),
      },
      {
        name: "getMedicineRequests",
        fn: () => parentAPI.getMedicineRequests(),
      },
    ];

    for (const endpoint of endpoints) {
      try {
        await endpoint.fn();
        results.working.push(endpoint.name);
        console.log(`✅ ${endpoint.name} - Working`);
      } catch (error) {
        results.failing.push({ name: endpoint.name, error: error.message });
        console.log(`❌ ${endpoint.name} - Failed:`, error.message);
      }
    }

    console.log("API Test Results:", results);
    return results;
  },
};
