import { apiClient } from '../../../core/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    login: async (username: string, password: string) => {
        const res = await apiClient.post('/login', { username, password });
        const token = res.data?.token || res.data?.accessToken || res.data?.jwt || '';
        if (token) {
            await AsyncStorage.setItem('token', token);
        }
        return res.data;
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
        return res.data;
    }
};
