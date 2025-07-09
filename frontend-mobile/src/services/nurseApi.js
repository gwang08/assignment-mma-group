import api from "./api";

// Nurse API functions - only includes functions actually implemented in backend
export const nurseAPI = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await api.get("/nurse", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get dashboard error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Medical Events Management
  getMedicalEvents: async () => {
    try {
      const response = await api.get("/nurse/medical-events", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get medical events error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  createMedicalEvent: async (eventData) => {
    try {
      const response = await api.post("/nurse/medical-events", eventData);
      return response.data;
    } catch (error) {
      console.error("Create medical event error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getMedicalEvent: async (eventId) => {
    try {
      const response = await api.get(`/nurse/medical-events/${eventId}`, {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get medical event error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  updateMedicalEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(
        `/nurse/medical-events/${eventId}`,
        eventData
      );
      return response.data;
    } catch (error) {
      console.error("Update medical event error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  resolveEvent: async (eventId, treatmentNotes) => {
    try {
      const response = await api.put(
        `/nurse/medical-events/${eventId}/resolve`,
        {
          treatment_notes: treatmentNotes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Resolve event error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  addMedication: async (eventId, medicationData) => {
    try {
      const response = await api.post(
        `/nurse/medical-events/${eventId}/medications`,
        medicationData
      );
      return response.data;
    } catch (error) {
      console.error("Add medication error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  updateParentNotification: async (eventId, notificationData) => {
    try {
      const response = await api.put(
        `/nurse/medical-events/${eventId}/notify-parent`,
        notificationData
      );
      return response.data;
    } catch (error) {
      console.error("Update parent notification error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Medicine Requests - Only GET is implemented in backend
  getMedicineRequests: async () => {
    try {
      const response = await api.get("/nurse/medicine-requests", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get medicine requests error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  updateMedicineRequestStatus: async (requestId, status, notes) => {
    try {
      const response = await api.put(
        `/nurse/medicine-requests/${requestId}/status`,
        {status, notes}
      );
      return response.data;
    } catch (error) {
      console.error("Update medicine request status error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getMedicineInventory: async () => {
    try {
      const response = await api.get("/nurse/medicine-inventory", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get medicine inventory error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Vaccination Campaigns
  getVaccinationCampaigns: async () => {
    try {
      const response = await api.get("/nurse/vaccination-campaigns", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get vaccination campaigns error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  createVaccinationCampaign: async (campaignData) => {
    try {
      const response = await api.post(
        "/nurse/vaccination-campaigns",
        campaignData
      );
      return response.data;
    } catch (error) {
      console.error("Create vaccination campaign error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getVaccinationResults: async (campaignId) => {
    try {
      const response = await api.get(
        `/nurse/vaccination-campaigns/${campaignId}/results`,
        {headers: {"Cache-Control": "no-cache"}}
      );
      return response.data;
    } catch (error) {
      console.error("Get vaccination results error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  createVaccinationResult: async (campaignId, resultData) => {
    try {
      const response = await api.post(
        `/nurse/vaccination-campaigns/${campaignId}/results`,
        resultData
      );
      return response.data;
    } catch (error) {
      console.error("Create vaccination result error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Health Check Campaigns
  getHealthCheckCampaigns: async () => {
    try {
      const response = await api.get("/nurse/health-check-campaigns", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get health check campaigns error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  createHealthCheckCampaign: async (campaignData) => {
    try {
      const response = await api.post(
        "/nurse/health-check-campaigns",
        campaignData
      );
      return response.data;
    } catch (error) {
      console.error("Create health check campaign error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getHealthCheckResults: async (campaignId) => {
    try {
      const response = await api.get(
        `/nurse/health-check-campaigns/${campaignId}/results`,
        {headers: {"Cache-Control": "no-cache"}}
      );
      return response.data;
    } catch (error) {
      console.error("Get health check results error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  createHealthCheckResult: async (campaignId, resultData) => {
    try {
      const response = await api.post(
        `/nurse/health-check-campaigns/${campaignId}/results`,
        resultData
      );
      return response.data;
    } catch (error) {
      console.error("Create health check result error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Consultations - Only GET is implemented in backend
  getConsultations: async () => {
    try {
      const response = await api.get("/nurse/consultation-schedules", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get consultations error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  createConsultationSchedule: async (data) => {
    try {
      const response = await api.post("/nurse/consultation-schedules", data);
      return response.data;
    } catch (error) {
      console.error("Create consultation schedule error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Students Management
  getStudents: async () => {
    try {
      const response = await api.get("/nurse/students", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get students error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getStudentHealthProfile: async (studentId) => {
    try {
      const response = await api.get(
        `/nurse/students/${studentId}/health-profile`,
        {headers: {"Cache-Control": "no-cache"}}
      );
      return response.data;
    } catch (error) {
      console.error("Get student health profile error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getCampaigns: async () => {
    try {
      const response = await api.get("/nurse/campaigns/", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get campaigns error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getStudentParentRelations: async () => {
    try {
      const response = await api.get("/nurse/student-parent-relations", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get student-parent relations error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me", {
        headers: {"Cache-Control": "no-cache"},
      });
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  updateStudentHealthProfile: async (studentId, profileData) => {
    try {
      const response = await api.put(
        `/nurse/students/${studentId}/health-profile`,
        profileData
      );
      return response.data;
    } catch (error) {
      console.error("Update student health profile error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getStudentMedicalHistory: async (studentId) => {
    try {
      const response = await api.get(
        `/nurse/students/${studentId}/medical-history`,
        {headers: {"Cache-Control": "no-cache"}}
      );
      return response.data;
    } catch (error) {
      console.error("Get student medical history error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Update nurse profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Change nurse password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post("/auth/change-password", passwordData);
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },
};

export default nurseAPI;
