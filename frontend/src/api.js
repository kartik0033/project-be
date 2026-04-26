import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type here — let Axios set it automatically
    // (multipart/form-data needs a special boundary that Axios handles)
    return config;
});

export default api;
