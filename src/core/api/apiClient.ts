import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config/config';

const getHeaders = async (): Promise<Record<string, string>> => {
    const token = await AsyncStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const TIMEOUT_MS = 10000;

const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('La solicitud tardó demasiado tiempo');
        }
        throw error;
    }
};

export const apiClient = {
    async get(endpoint: string, options?: { params?: Record<string, string> }) {
        try {
            const headers = await getHeaders();
            let url = `${API_CONFIG.BASE_URL}${endpoint}`;
            if (options?.params) {
                const searchParams = new URLSearchParams(options.params);
                url += `?${searchParams.toString()}`;
            }
            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers,
            });
            return this.handleResponse(response);
        } catch (error: any) {
            console.error('GET Error:', error.message);
            throw error;
        }
    },

    async post(endpoint: string, data: any) {
        try {
            const headers = await getHeaders();
            const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });
            return this.handleResponse(response);
        } catch (error: any) {
            console.error('POST Error:', error.message);
            throw error;
        }
    },

    async put(endpoint: string, data: any) {
        try {
            const headers = await getHeaders();
            const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data),
            });
            return this.handleResponse(response);
        } catch (error: any) {
            console.error('PUT Error:', error.message);
            throw error;
        }
    },

    async delete(endpoint: string) {
        try {
            const headers = await getHeaders();
            const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers,
            });
            return this.handleResponse(response);
        } catch (error: any) {
            console.error('DELETE Error:', error.message);
            throw error;
        }
    },

    async handleResponse(response: Response) {
        const data = await response.json();
        
        console.log('API Response:', response.status, data);
        
        if (response.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            console.warn('Session expired, logging out...');
        }

        if (!response.ok) {
            const error = new Error(data.message || 'Request failed') as any;
            error.response = { data, status: response.status };
            throw error;
        }

        return data;
    }
};
