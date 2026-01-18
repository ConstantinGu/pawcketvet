import axios from 'axios';

// Configuration de base axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
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
  
  create: (data) => 
    api.post('/owners', data),
  
  update: (id, data) => 
    api.put(`/owners/${id}`, data),
};

export default api;
