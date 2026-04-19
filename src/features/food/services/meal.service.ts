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
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.meals)) return res.meals;
        if (Array.isArray(res?.data)) return res.data;
        return [];
    },

    getWeeklyPlan: async (patientId: string) => {
        const res = await apiClient.get(`/weeklyplan/daily/${patientId}`);
        return res;
    },

    addWeeklyMeal: async (params: { patient_id: string; meal: any; weight?: number | null }) => {
        const res = await apiClient.post('/daily-meal-logs/add-weekly-meal', params);
        return res;
    },

    getAllFoods: async () => {
        const res = await apiClient.get('/api/food');
        return res;
    },

    createPatientMeal: async (mealData: any) => {
        const res = await apiClient.post('/PatientMeals', mealData);
        return res;
    },

    updatePatientMeal: async (mealId: string, mealData: any) => {
        const res = await apiClient.put(`/PatientMeals/${mealId}`, mealData);
        return res;
    },

    getMealLogByDate: async (patientId: string, date: string) => {
        const res = await apiClient.get('/daily-meal-logs/by-date', {
            params: { patient_id: patientId, date }
        });
        return res?.dailyLog || res?.data || res || null;
    },

    addFoodLog: async (params: {
        patient_id: string;
        type: string;
        time: string;
        food_data: {
            food_name: string;
            serving_weight_grams: number;
            nf_calories: number;
            nf_protein: number;
            nf_total_carbohydrate: number;
            nf_total_fat: number;
            nf_dietary_fiber?: number;
            nf_sugars?: number;
            category?: string;
        };
    }) => {
        const res = await apiClient.post('/dailymeallogs/add-food', params);
        return res;
    },

    addCustomMealLog: async (params: {
        patient_id: string;
        meal_id: string;
        type: string;
        time: string;
    }) => {
        const res = await apiClient.post('/DailyMealLogs/add-custom-meal', params);
        return res;
    }
};
