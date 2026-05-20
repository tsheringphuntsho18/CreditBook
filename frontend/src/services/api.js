const API_BASE = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

const getHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { ...getHeaders() },
    });
    return handleResponse(response);
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getHeaders() },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getHeaders() },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: { ...getHeaders() },
    });
    return handleResponse(response);
  },
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const shopAPI = {
  getAll: () => api.get('/shops'),
  getOne: (id) => api.get(`/shops/${id}`),
  update: (id, data) => api.put(`/shops/${id}`, data),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const customerAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return api.get(`/customers${searchParams ? `?${searchParams}` : ''}`);
  },
  getOne: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const transactionAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return api.get(`/transactions${searchParams ? `?${searchParams}` : ''}`);
  },
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  delete: (id) => api.delete(`/transactions/${id}`),
  generateReceipt: (id) => api.post(`/transactions/${id}/receipt`),
};

export const receiptAPI = {
  get: (id) => `${API_BASE}/receipts/${id}?token=${getToken()}`,
};

export const reportAPI = {
  getBalanceSummary: () => api.get('/reports/balance-summary'),
  getTransactionReport: (params) => {
    const searchParams = new URLSearchParams(params).toString();
    return api.get(`/reports/transactions${searchParams ? `?${searchParams}` : ''}`);
  },
  getDashboard: () => api.get('/reports/dashboard'),
};
