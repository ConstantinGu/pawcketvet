import axios from 'axios';

// Configuration de base axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH
// ============================================

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (data) => 
    api.post('/auth/register', data),
  
  me: () => 
    api.get('/auth/me'),
};

// ============================================
// ANIMALS (PATIENTS)
// ============================================

export const animalsAPI = {
  getAll: (params) => 
    api.get('/animals', { params }),
  
  getById: (id) => 
    api.get(`/animals/${id}`),
  
  create: (data) => 
    api.post('/animals', data),
  
  update: (id, data) => 
    api.put(`/animals/${id}`, data),
  
  delete: (id) => 
    api.delete(`/animals/${id}`),
};

// ============================================
// APPOINTMENTS (RENDEZ-VOUS)
// ============================================

export const appointmentsAPI = {
  getAll: (params) => 
    api.get('/appointments', { params }),
  
  getById: (id) => 
    api.get(`/appointments/${id}`),
  
  create: (data) => 
    api.post('/appointments', data),
  
  update: (id, data) => 
    api.put(`/appointments/${id}`, data),
  
  delete: (id) => 
    api.delete(`/appointments/${id}`),
  
  updateStatus: (id, status) => 
    api.patch(`/appointments/${id}/status`, { status }),
};

// ============================================
// INVENTORY (STOCK)
// ============================================

export const inventoryAPI = {
  getAll: (params) => 
    api.get('/inventory', { params }),
  
  getById: (id) => 
    api.get(`/inventory/${id}`),
  
  create: (data) => 
    api.post('/inventory', data),
  
  update: (id, data) => 
    api.put(`/inventory/${id}`, data),
  
  delete: (id) => 
    api.delete(`/inventory/${id}`),
  
  getAlerts: () => 
    api.get('/inventory/alerts'),
};

// ============================================
// INVOICES (FACTURES)
// ============================================

export const invoicesAPI = {
  getAll: (params) => 
    api.get('/invoices', { params }),
  
  getById: (id) => 
    api.get(`/invoices/${id}`),
  
  create: (data) => 
    api.post('/invoices', data),
  
  update: (id, data) => 
    api.put(`/invoices/${id}`, data),
  
  markAsPaid: (id, data) => 
    api.patch(`/invoices/${id}/pay`, data),
};

// ============================================
// MESSAGES
// ============================================

export const messagesAPI = {
  getAll: (params) =>
    api.get('/messages', { params }),

  getConversations: () =>
    api.get('/messages/conversations'),

  getById: (id) =>
    api.get(`/messages/${id}`),

  send: (data) =>
    api.post('/messages', data),

  markAsRead: (id) =>
    api.patch(`/messages/${id}/read`),
};

// ============================================
// CONSULTATIONS
// ============================================

export const consultationsAPI = {
  getAll: (params) => 
    api.get('/consultations', { params }),
  
  getById: (id) => 
    api.get(`/consultations/${id}`),
  
  create: (data) => 
    api.post('/consultations', data),
  
  update: (id, data) => 
    api.put(`/consultations/${id}`, data),
};

// ============================================
// OWNERS (PROPRIÉTAIRES)
// ============================================

export const ownersAPI = {
  getAll: (params) =>
    api.get('/owners', { params }),

  getById: (id) =>
    api.get(`/owners/${id}`),

  getMyProfile: () =>
    api.get('/owners/me'),

  create: (data) =>
    api.post('/owners', data),

  update: (id, data) =>
    api.put(`/owners/${id}`, data),
};

// ============================================
// REMINDERS (RAPPELS)
// ============================================

export const remindersAPI = {
  getAll: (params) =>
    api.get('/reminders', { params }),

  getMy: () =>
    api.get('/reminders/my'),

  create: (data) =>
    api.post('/reminders', data),

  update: (id, data) =>
    api.put(`/reminders/${id}`, data),

  delete: (id) =>
    api.delete(`/reminders/${id}`),
};

// ============================================
// VACCINATIONS
// ============================================

export const vaccinationsAPI = {
  getByAnimal: (animalId) =>
    api.get(`/vaccinations/animal/${animalId}`),

  getUpcoming: () =>
    api.get('/vaccinations/upcoming'),

  create: (data) =>
    api.post('/vaccinations', data),

  update: (id, data) =>
    api.put(`/vaccinations/${id}`, data),

  delete: (id) =>
    api.delete(`/vaccinations/${id}`),
};

// ============================================
// CERTIFICATES
// ============================================

export const certificatesAPI = {
  getAll: (params) =>
    api.get('/certificates', { params }),

  getById: (id) =>
    api.get(`/certificates/${id}`),

  create: (data) =>
    api.post('/certificates', data),

  delete: (id) =>
    api.delete(`/certificates/${id}`),
};

// ============================================
// PRESCRIPTIONS
// ============================================

export const prescriptionsAPI = {
  getAll: (params) =>
    api.get('/prescriptions', { params }),

  getById: (id) =>
    api.get(`/prescriptions/${id}`),

  create: (data) =>
    api.post('/prescriptions', data),

  update: (id, data) =>
    api.put(`/prescriptions/${id}`, data),

  delete: (id) =>
    api.delete(`/prescriptions/${id}`),

  getMedications: (params) =>
    api.get('/prescriptions/medications', { params }),

  createMedication: (data) =>
    api.post('/prescriptions/medications', data),
};

// ============================================
// NOTIFICATIONS
// ============================================

export const notificationsAPI = {
  getAll: (params) =>
    api.get('/notifications', { params }),

  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch('/notifications/read-all'),

  clearRead: () =>
    api.delete('/notifications/clear-read'),

  delete: (id) =>
    api.delete(`/notifications/${id}`),
};

// ============================================
// USERS (STAFF)
// ============================================

export const usersAPI = {
  getAll: (params) =>
    api.get('/users', { params }),

  getById: (id) =>
    api.get(`/users/${id}`),

  create: (data) =>
    api.post('/users', data),

  update: (id, data) =>
    api.put(`/users/${id}`, data),

  deactivate: (id) =>
    api.patch(`/users/${id}/deactivate`),

  resetPassword: (id, newPassword) =>
    api.patch(`/users/${id}/reset-password`, { newPassword }),
};

// ============================================
// ANALYTICS
// ============================================

export const analyticsAPI = {
  getDashboardStats: () =>
    api.get('/analytics/dashboard'),

  getTodayAppointments: () =>
    api.get('/analytics/today'),

  getRecentActivity: () =>
    api.get('/analytics/activity'),

  getMonthlyRevenue: () =>
    api.get('/analytics/revenue'),
};

// ============================================
// CLINIC (CLINIQUE)
// ============================================

export const clinicAPI = {
  getMyClinic: () =>
    api.get('/clinic/me'),

  update: (data) =>
    api.put('/clinic/me', data),

  getStats: () =>
    api.get('/clinic/stats'),
};

// ============================================
// REVIEWS (AVIS)
// ============================================

export const reviewsAPI = {
  getAll: (params) =>
    api.get('/reviews', { params }),

  getById: (id) =>
    api.get(`/reviews/${id}`),

  create: (data) =>
    api.post('/reviews', data),

  respond: (id, response) =>
    api.patch(`/reviews/${id}/respond`, { response }),

  togglePublish: (id) =>
    api.patch(`/reviews/${id}/publish`),

  delete: (id) =>
    api.delete(`/reviews/${id}`),
};

// ============================================
// SHARE LINKS (PARTAGE)
// ============================================

export const shareLinksAPI = {
  getAll: () =>
    api.get('/share-links'),

  create: (data) =>
    api.post('/share-links', data),

  access: (code) =>
    api.get(`/share-links/public/${code}`),

  deactivate: (id) =>
    api.patch(`/share-links/${id}/deactivate`),

  delete: (id) =>
    api.delete(`/share-links/${id}`),
};

export default api;
