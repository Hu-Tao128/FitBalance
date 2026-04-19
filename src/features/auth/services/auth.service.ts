import { apiClient } from '../../../core/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    login: async (username: string, password: string) => {
        const res = await apiClient.post('/login', { username, password });
        const token = res?.token || res?.accessToken || res?.jwt || '';
        if (token) {
            await AsyncStorage.setItem('token', token);
        }
        return res;
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },

    changePassword: async (patient_id: string, currentPassword: string, newPassword: string) => {
        const res = await apiClient.put('/patients/change-password', {
            patient_id,
            currentPassword,
            newPassword
        });
        return res;
    },

    sendResetCode: async (email: string) => {
        const res = await apiClient.post('/send-reset-code', { email });
        return res;
    },

    verifyResetCode: async (email: string, code: string) => {
        const res = await apiClient.post('/verify-reset-code', { email, code });
        return res;
    },

    resetPassword: async (token: string, newPassword: string) => {
        const res = await apiClient.post('/reset-password', { token, newPassword });
        return res;
    }
};