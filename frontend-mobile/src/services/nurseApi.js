import api from "./api";

// Nurse API functions - only includes functions actually implemented in backend
export const nurseAPI = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await api.get("/nurse");
      return response.data;
    } catch (error) {
      console.error("Get dashboard error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Medical Events Management
  getMedicalEvents: async () => {
    try {
      const response = await api.get("/nurse/medical-events");
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
      const response = await api.get(`/nurse/medical-events/${eventId}`);
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
      const response = await api.get("/nurse/medicine-requests");
      return response.data;
    } catch (error) {
      console.error("Get medicine requests error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getMedicineInventory: async () => {
    try {
      const response = await api.get("/nurse/medicine-inventory");
      return response.data;
    } catch (error) {
      console.error("Get medicine inventory error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Vaccination Campaigns
  getVaccinationCampaigns: async () => {
    try {
      const response = await api.get("/nurse/vaccination-campaigns");
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
        `/nurse/vaccination-campaigns/${campaignId}/results`
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
      const response = await api.get("/nurse/health-check-campaigns");
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
        `/nurse/health-check-campaigns/${campaignId}/results`
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
      const response = await api.get("/nurse/consultations");
      return response.data;
    } catch (error) {
      console.error("Get consultations error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  // Students Management
  getStudents: async () => {
    try {
      const response = await api.get("/nurse/students");
      return response.data;
    } catch (error) {
      console.error("Get students error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },

  getStudentHealthProfile: async (studentId) => {
    try {
      const response = await api.get(
        `/nurse/students/${studentId}/health-profile`
      );
      return response.data;
    } catch (error) {
      console.error("Get student health profile error:", error);
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
        `/nurse/students/${studentId}/medical-history`
      );
      return response.data;
    } catch (error) {
      console.error("Get student medical history error:", error);
      throw error.response?.data || {message: "Network error"};
    }
  },
};

export default nurseAPI;
