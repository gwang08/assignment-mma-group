import api from './api';

// Admin API functions
export const adminAPI = {
  // Students management
  getStudents: async () => {
    try {
      const response = await api.get('/admin/students');
      return response.data;
    } catch (error) {
      console.error('Get students error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  createStudent: async (studentData) => {
    try {

      const response = await api.post('/admin/students', studentData);
      return response.data;
    } catch (error) {
      console.error('Create student error:', error);
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error.response?.data || { message: 'Network error' };
    }
  },

  updateStudent: async (studentId, studentData) => {
    try {
      const response = await api.put(`/admin/students/${studentId}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Update student error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  deactivateStudent: async (studentId) => {
    try {
      const response = await api.post(`/admin/students/${studentId}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Deactivate student error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Medical staff management
  getMedicalStaff: async () => {
    try {
      const response = await api.get('/admin/medical-staff');
      return response.data;
    } catch (error) {
      console.error('Get medical staff error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  createMedicalStaff: async (staffData) => {
    try {
      const response = await api.post('/admin/medical-staff', { staffData });
      return response.data;
    } catch (error) {
      console.error('Create medical staff error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  updateMedicalStaff: async (staffId, staffData) => {
    try {
      const response = await api.put(`/admin/medical-staff/${staffId}`, staffData);
      return response.data;
    } catch (error) {
      console.error('Update medical staff error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  deactivateMedicalStaff: async (staffId) => {
    try {
      const response = await api.post(`/admin/medical-staff/${staffId}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Deactivate medical staff error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Get/Update profile (alias for getCurrentUser)
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Student-Parent Link Requests
  getStudentLinkRequests: async () => {
    try {
      const response = await api.get('/admin/student-link/requests');
      return response.data;
    } catch (error) {
      console.error('Get student link requests error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  processStudentLinkRequest: async (requestId, data) => {
    try {
      const response = await api.put(`/admin/student-link/requests/${requestId}`, data);
      return response.data;
    } catch (error) {
      console.error('Process student link request error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Student-Parent Relations
  getStudentParentRelations: async () => {
    try {
      const response = await api.get('/admin/student-parent-relations');
      return response.data;
    } catch (error) {
      console.error('Get student parent relations error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Alias for compatibility
  getParentStudentRelations: async () => {
    try {
      const response = await api.get('/admin/student-parent-relations');
      return response.data;
    } catch (error) {
      console.error('Get parent student relations error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  createStudentParentRelation: async (relationData) => {
    try {
      const response = await api.post('/admin/student-parent-relations', relationData);
      return response.data;
    } catch (error) {
      console.error('Create student parent relation error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  deleteStudentParentRelation: async (relationId) => {
    try {
      const response = await api.delete(`/admin/student-parent-relations/${relationId}`);
      return response.data;
    } catch (error) {
      console.error('Delete student parent relation error:', error);
      throw error.response?.data || { message: 'Network error' };
    }
  },
};

export default adminAPI;
