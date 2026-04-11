import { apiClient } from '../../../core/api/apiClient';

export const dashboardService = {
    getDailySummary: async (userId: string) => {
        const res = await apiClient.get(`/daily-meal-logs/today/${userId}`);
        return res.data;
    }
};
