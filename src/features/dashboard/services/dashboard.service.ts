import { apiClient } from '../../../core/api/apiClient';

export const dashboardService = {
    getDailySummary: async (userId: string) => {
        const res = await apiClient.get(`/users/${userId}/daily-summary`);
        return res.data;
    },

    getRecentActivity: async (userId: string) => {
        const res = await apiClient.get(`/users/${userId}/activity/recent`);
        return res.data;
    }
};
