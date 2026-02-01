import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
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

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data)
};

// Complaints API
export const complaintsAPI = {
    getAll: () => api.get('/complaints'),
    getById: (id) => api.get(`/complaints/${id}`),
    create: (data) => api.post('/complaints', data),
    update: (id, data) => api.put(`/complaints/${id}`, data),
    delete: (id) => api.delete(`/complaints/${id}`)
};

// Feedback API
export const feedbackAPI = {
    getAll: () => api.get('/feedback'),
    getByComplaintId: (complaintId) => api.get(`/feedback/complaint/${complaintId}`),
    create: (data) => api.post('/feedback', data)
};

export default api;
