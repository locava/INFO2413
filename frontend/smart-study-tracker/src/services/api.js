// Centralized API service for all backend calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Helper function for making API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // ✅ THE CHANGE: 'include' sends the cookie automatically
    credentials: 'include', 
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (email, password) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () =>
    apiRequest('/api/auth/me'),

  updateProfile: (userData) =>
    apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  changePassword: (currentPassword, newPassword) =>
    apiRequest('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ============================================
// STUDENT API
// ============================================
export const studentAPI = {
  // Study Sessions
  createSession: (sessionData) =>
    apiRequest('/api/student/study-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  getSessions: () =>
    apiRequest('/api/student/study-sessions'),

  updateSession: (sessionId, sessionData) =>
    apiRequest(`/api/student/study-sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    }),

  deleteSession: (sessionId) =>
    apiRequest(`/api/student/study-sessions/${sessionId}`, {
      method: 'DELETE',
    }),

  getCourses: () => 
    apiRequest('/api/student/courses'),
};

// ============================================
// AI API
// ============================================
export const aiAPI = {
  // Pattern Analysis
  getStudyPatterns: (studentId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/ai/patterns/${studentId}${queryString ? `?${queryString}` : ''}`);
  },

  // Focus Models
  getFocusModel: (studentId) =>
    apiRequest(`/api/ai/focus-model/${studentId}`),

  buildFocusModel: (studentId) =>
    apiRequest(`/api/ai/focus-model/${studentId}`, {
      method: 'POST',
    }),

  // Reports
  getWeeklyReport: (studentId, weekStart = null) => {
    const params = weekStart ? `?weekStart=${weekStart}` : '';
    return apiRequest(`/api/ai/reports/weekly/${studentId}${params}`);
  },

  getMonthlyReport: (studentId, month = null) => {
    const params = month ? `?month=${month}` : '';
    return apiRequest(`/api/ai/reports/monthly/${studentId}${params}`);
  },

  getInstructorReport: (courseId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/ai/reports/instructor/${courseId}${queryString ? `?${queryString}` : ''}`);
  },

  getSystemReport: () =>
    apiRequest('/api/ai/reports/system'),

  // Session Monitoring
  startMonitoring: (sessionData) =>
    apiRequest('/api/ai/monitoring/start', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  stopMonitoring: (sessionId) =>
    apiRequest('/api/ai/monitoring/stop', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  checkActiveSessions: () =>
    apiRequest('/api/ai/monitoring/check'),
};

// ============================================
// INSTRUCTOR API
// ============================================
export const instructorAPI = {
  getCourses: () =>
    apiRequest('/api/instructor/courses'),

  getCourseStudents: (courseId) =>
    apiRequest(`/api/instructor/course/${courseId}/students`),

  getCourseStats: (courseId) =>
    apiRequest(`/api/instructor/course/${courseId}/stats`),
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  // Users
  getUsers: (role = null) => {
    const params = role ? `?role=${role}` : '';
    return apiRequest(`/api/admin/users${params}`);
  },

  createUser: (userData) =>
    apiRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  updateUser: (userId, userData) =>
    apiRequest(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (userId) =>
    apiRequest(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  // Courses
  getCourses: () =>
    apiRequest('/api/admin/courses'),

  createCourse: (courseData) =>
    apiRequest('/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),

  deleteCourse: (courseId) =>
    apiRequest(`/api/admin/courses/${courseId}`, {
      method: 'DELETE',
    }),

  // Enrollments
  getStudentEnrollments: (studentId) =>
    apiRequest(`/api/admin/enrollments/student/${studentId}`),

  enrollStudent: (studentId, courseId) =>
    apiRequest('/api/admin/enrollments', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId }),
    }),

  unenrollStudent: (studentId, courseId) =>
    apiRequest(`/api/admin/enrollments/${studentId}/${courseId}`, {
      method: 'DELETE',
    }),

  // Thresholds
  getThresholds: () =>
    apiRequest('/api/admin/thresholds'),

  updateThreshold: (thresholdId, value) =>
    apiRequest(`/api/admin/thresholds/${thresholdId}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),

  // Reports
  getReports: () =>
    apiRequest('/api/admin/reports'),

  // Alerts & Notifications
  getAlerts: (limit = 50) =>
    apiRequest(`/api/admin/alerts?limit=${limit}`),

  getNotifications: (limit = 50) =>
    apiRequest(`/api/admin/notifications?limit=${limit}`),

  // Data Quality
  getDataQuality: () =>
    apiRequest('/api/admin/data-quality'),
};

export default {
  authAPI,
  studentAPI,
  aiAPI,
  instructorAPI,
  adminAPI,
};

