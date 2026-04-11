import { useState } from 'react';
import { Alert } from 'react-native';
import { foodService, Food } from '../services/food.service';
import { useUser } from '../../../context/UserContext';

export function useAddFood(onSuccess?: () => void) {
    const { user } = useUser();

    const [foodToAdd, setFoodToAdd] = useState<Food | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const initiateAddFood = (food: Food, grams: number) => {
        const base = food.serving_weight_grams || 100;
        const ratio = grams / base;
        const adjusted = {
            ...food,
            serving_weight_grams: grams,
            nf_calories: (food.nf_calories || 0) * ratio,
            nf_protein: (food.nf_protein || 0) * ratio,
            nf_total_carbohydrate: (food.nf_total_carbohydrate || 0) * ratio,
            nf_total_fat: (food.nf_total_fat || 0) * ratio,
            nf_sugars: (food.nf_sugars || 0) * ratio,
            nf_dietary_fiber: (food.nf_dietary_fiber || 0) * ratio,
        };
        setFoodToAdd(adjusted);
        setModalVisible(true);
    };

    const getTodayWeekday = () => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            timeZone: 'America/Tijuana'
        }).format(new Date()).toLowerCase();
    };

    const handleConfirm = async () => {
        if (!foodToAdd || !user?.id) return;
        setModalVisible(false);
        setLoading(true);
        try {
            await foodService.addMealLog({
                patient_id: user.id,
                meal: {
                    day: getTodayWeekday(),
                    type: 'snack',
                    time: new Date().toTimeString().slice(0, 5),
                    foods: [{ food_id: foodToAdd.food_name, grams: foodToAdd.serving_weight_grams }]
                }
            });
            Alert.alert('¡Éxito!', `${foodToAdd.food_name} añadido.`);
            onSuccess?.();
        } catch {
            Alert.alert('Error', 'No se pudo añadir.');
        } finally {
            setLoading(false);
        }
    };

    return {
        foodToAdd,
        modalVisible,
        setModalVisible,
        loading,
        initiateAddFood,
        handleConfirm
    };
}