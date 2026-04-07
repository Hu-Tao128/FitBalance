import axios from 'axios';
import { API_CONFIG } from '../../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: add auth token
apiClient.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Error fetching token from storage:', error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor: handle global errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { response } = error;
        
        if (response && response.status === 401) {
            // Token expired or invalid
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            console.warn('Session expired, logging out...');
            // In a real app, you'd trigger a global logout state here
        }

        if (!response) {
            console.error('Network Error: Please check your internet connection.');
        }

        return Promise.reject(error);
    }
);
