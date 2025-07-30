import React from 'react';
import { View } from 'react-native';
import FoodItemCard from './FoodItemCard';

interface Food {
    food_name: string;
    serving_qty: number;
    serving_unit: string;
    serving_weight_grams?: number;
    nf_calories?: number;
    nf_protein?: number;
    nf_total_carbohydrate?: number;
    nf_total_fat?: number;
    photo?: {
        thumb?: string;
    };
}

interface Props {
    foods: Food[];
    onAddFood: (food: Food, grams: number) => void;
}

export default function FoodDetails({ foods, onAddFood }: Props) {
    return (
        <View style={{ marginTop: 20 }}>
            {foods.map((food, index) => (
                <FoodItemCard
                    key={`${food.food_name}-${index}`}
                    food={food}
                    onAddFood={onAddFood}
                />
            ))}
        </View>
    );
}