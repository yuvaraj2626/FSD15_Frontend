import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests — reads from sessionStorage so each tab uses its own token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data)
};

// Complaints API — now supports search/filter/pagination params
export const complaintsAPI = {
    getAll: (params = {}) => api.get('/complaints', { params }),
    getById: (id) => api.get(`/complaints/${id}`),
    create: (data) => {
        // data can be a plain object or a FormData (when a file is attached)
        const isFormData = data instanceof FormData;
        return api.post('/complaints', data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
    },
    update: (id, data) => api.put(`/complaints/${id}`, data),
    delete: (id) => api.delete(`/complaints/${id}`)
};

// Feedback API
export const feedbackAPI = {
    getAll: () => api.get('/feedback'),
    getByComplaintId: (complaintId) => api.get(`/feedback/complaint/${complaintId}`),
    create: (data) => api.post('/feedback', data),
    update: (id, data) => api.put(`/feedback/${id}`, data)
};

// Comments API — nested under complaints
export const commentsAPI = {
    getByComplaintId: (complaintId) => api.get(`/complaints/${complaintId}/comments`),
    addComment: (complaintId, data) => api.post(`/complaints/${complaintId}/comments`, data)
};

// Analytics API
export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview'),
    getByCategory: () => api.get('/analytics/by-category'),
    getByStatus: () => api.get('/analytics/by-status'),
    getByPriority: () => api.get('/analytics/by-priority'),
    getTrend: () => api.get('/analytics/trend'),
    getRatings: () => api.get('/analytics/ratings')
};

export default api;
