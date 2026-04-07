import { apiClient } from '../../../core/api/apiClient';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    photo?: string;
    height?: number;
    weight?: number;
    birthDate?: string;
}

export const profileService = {
    getProfile: async (userId: string) => {
        const res = await apiClient.get(`/users/${userId}`);
        return res.data;
    },

    updateProfile: async (userId: string, data: Partial<UserProfile>) => {
        const res = await apiClient.put(`/users/${userId}`, data);
        return res.data;
    },

    uploadPhoto: async (userId: string, photoUri: string) => {
        const formData = new FormData();
        // @ts-ignore
        formData.append('photo', {
            uri: photoUri,
            type: 'image/jpeg',
            name: 'profile.jpg',
        });

        const res = await apiClient.post(`/users/${userId}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    }
};
