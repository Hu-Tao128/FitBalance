import { apiClient } from '../../../core/api/apiClient';

export interface PatientMeal {
    _id?: string;
    patient_id: string;
    meal_name: string;
    ingredients: Array<{
        food_id: string;
        food_name: string;
        amount_g: number;
    }>;
    nutrients: {
        energy_kcal: number;
        protein_g: number;
        carbohydrates_g: number;
        fat_g: number;
    };
}

export const mealService = {
    getPatientMeals: async (patientId: string) => {
        const res = await apiClient.get(`/PatientMeals/${patientId}`);
        return res.data;
    },

    getWeeklyPlan: async (patientId: string) => {
        const res = await apiClient.get(`/weeklyplan/daily/${patientId}`);
        return res.data;
    },

    addWeeklyMeal: async (params: { patient_id: string; meal: any; weight?: number | null }) => {
        const res = await apiClient.post('/daily-meal-logs/add-weekly-meal', params);
        return res.data;
    },

    getAllFoods: async () => {
        const res = await apiClient.get('/api/food');
        return res.data;
    },

    createPatientMeal: async (mealData: any) => {
        const res = await apiClient.post('/PatientMeals', mealData);
        return res.data;
    },

    updatePatientMeal: async (mealId: string, mealData: any) => {
        const res = await apiClient.put(`/PatientMeals/${mealId}`, mealData);
        return res.data;
    },

    getMealLogByDate: async (patientId: string, date: string) => {
        const res = await apiClient.get('/daily-meal-logs/by-date', {
            params: { patient_id: patientId, date }
        });
        return res.data;
    },

    addFoodLog: async (params: { patient_id: string; meal_name: string; grams: number }) => {
        const res = await apiClient.post('/dailymeallogs/add-food', params);
        return res.data;
    }
};
