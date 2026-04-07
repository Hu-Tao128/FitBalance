import { apiClient } from '../../../core/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    login: async (email: string, password: string) => {
        const res = await apiClient.post('/auth/login', { email, password });
        if (res.data.token) {
            await AsyncStorage.setItem('token', res.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        }
        return res.data;
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const res = await apiClient.put('/auth/change-password', {
            currentPassword,
            newPassword
        });
        return res.data;
    }
};
