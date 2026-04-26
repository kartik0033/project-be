import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = sessionStorage.getItem('access_token');
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await api.get('/profile/');
                    setUser(response.data);
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        console.error("Auth check failed with 401", error);
                        logout();
                    } else {
                        // User is authenticated but might not have a profile generated yet (404)
                        setUser({});
                    }
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = (data) => {
        sessionStorage.setItem('access_token', data.tokens.access);
        sessionStorage.setItem('refresh_token', data.tokens.refresh);
        if (data.role) sessionStorage.setItem('user_role', data.role);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.tokens.access}`;
        // Fetch profile immediately after login to set user
        api.get('/profile/').then(res => setUser(res.data)).catch(() => setUser({}));
    };

    const logout = () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user_role');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const role = sessionStorage.getItem('user_role');

    return (
        <AuthContext.Provider value={{ user, role, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
