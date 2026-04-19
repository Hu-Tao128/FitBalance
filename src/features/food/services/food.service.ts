import axios from 'axios';
import { apiClient } from '../../../core/api/apiClient';

export interface Food {
    food_name: string;
    serving_qty: number;
    serving_unit: string;
    serving_weight_grams?: number;
    nf_calories?: number;
    nf_protein?: number;
    nf_total_carbohydrate?: number;
    nf_total_fat?: number;
    nf_sugars?: number;
    nf_dietary_fiber?: number;
    photo?: { thumb?: string };
}

export interface AddMealParams {
    patient_id: string;
    meal: {
        day: string;
        type: string;
        time: string;
        foods: Array<{ food_id: string; grams?: number }>;
    };
    weight?: number | null;
}

export const foodService = {
    searchFood: async (query: string): Promise<Food[]> => {
        const res = await apiClient.post('/search-food', { query });
        return res.results || [];
    },

    searchBarcode: async (upc: string): Promise<Food | null> => {
        const response = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${upc}.json`);
        if (response.data.status === 1) {
            const product = response.data.product;
            const nutriments = product.nutriments || {};

            return {
                food_name: product.product_name || 'Producto sin nombre',
                serving_qty: 1,
                serving_unit: product.serving_size || '100g',
                serving_weight_grams: 100,
                nf_calories: nutriments['energy-kcal_100g'] || nutriments['energy-kj_100g'] / 4.184 || 0,
                nf_protein: nutriments['proteins_100g'] || 0,
                nf_total_carbohydrate: nutriments['carbohydrates_100g'] || 0,
                nf_total_fat: nutriments['fat_100g'] || 0,
                nf_sugars: nutriments['sugars_100g'] || 0,
                nf_dietary_fiber: nutriments['fiber_100g'] || 0,
                photo: { thumb: product.image_front_thumb_url || product.image_thumb_url || undefined },
            };
        }
        return null;
    },

    addMealLog: async (params: AddMealParams): Promise<void> => {
        await apiClient.post('/daily-meal-logs/add-meal', params);
    }
};
