import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/update-profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    getUsers: (params) => api.get('/auth/users', { params }),
    deleteUser: (id) => api.delete(`/auth/users/${id}`),
    toggleUserStatus: (id) => api.put(`/auth/users/${id}/toggle-status`),
};

// Room API
export const roomAPI = {
    getAll: (params) => api.get('/rooms', { params }),
    getOne: (id) => api.get(`/rooms/${id}`),
    create: (data) => api.post('/rooms', data),
    update: (id, data) => api.put(`/rooms/${id}`, data),
    delete: (id) => api.delete(`/rooms/${id}`),
    allocate: (id, data) => api.put(`/rooms/${id}/allocate`, data),
    deallocate: (id, data) => api.put(`/rooms/${id}/deallocate`, data),
};

// Student API
export const studentAPI = {
    getAll: (params) => api.get('/students', { params }),
    getOne: (id) => api.get(`/students/${id}`),
    update: (id, data) => api.put(`/students/${id}`, data),
};

// Complaint API
export const complaintAPI = {
    getAll: (params) => api.get('/complaints', { params }),
    create: (data) => api.post('/complaints', data),
    update: (id, data) => api.put(`/complaints/${id}`, data),
    delete: (id) => api.delete(`/complaints/${id}`),
};

// Fee API
export const feeAPI = {
    getAll: (params) => api.get('/fees', { params }),
    create: (data) => api.post('/fees', data),
    update: (id, data) => api.put(`/fees/${id}`, data),
    delete: (id) => api.delete(`/fees/${id}`),
    bulkCreate: (data) => api.post('/fees/bulk', data),
};

// Meal API
export const mealAPI = {
    getAll: (params) => api.get('/meals', { params }),
    upsert: (data) => api.post('/meals', data),
    bulkUpsert: (data) => api.post('/meals/bulk', data),
    delete: (id) => api.delete(`/meals/${id}`),
};

// Notification API
export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    create: (data) => api.post('/notifications', data),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    delete: (id) => api.delete(`/notifications/${id}`),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
};

export default api;
