import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { AddFoodModal } from '../components/AddFoodModal';
import FoodDetails from '../components/FoodDetails';
import { API_CONFIG } from '../config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

// Interfaz para que TypeScript entienda la estructura del alimento
interface Food {
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
    photo?: {
        thumb?: string;
    };
}

export default function FoodClassicSearch({ navigation }: any) {
    const { colors } = useTheme();
    const { user } = useUser();

    const [query, setQuery] = useState('');
    const [result, setResult] = useState<{ foods: Food[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);

    const searchByQuery = async () => {
        if (!query.trim()) {
            setError("Por favor, ingresa un alimento para buscar.");
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await axios.post<{ results: Food[] }>(`${API_CONFIG.BASE_URL}/search-food`, { query });
            if (res.data?.results && res.data.results.length > 0) {
                setResult({ foods: res.data.results });
            } else {
                setError("No results were found for your search.");
            }
        } catch (err: any) {
            console.error("❌ ERROR when searching:", err.response?.data || err.message);
            setError("There was an error connecting to the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFoodPress = (originalFood: Food, adjustedGrams: number) => {
        const baseGrams = originalFood.serving_weight_grams || 100;
        if (baseGrams === 0) return; // Evitar división por cero

        const ratio = adjustedGrams / baseGrams;

        const adjustedFood: Food = {
            ...originalFood,
            serving_weight_grams: adjustedGrams,
            serving_qty: 1,
            serving_unit: `${adjustedGrams}g`,
            nf_calories: (originalFood.nf_calories || 0) * ratio,
            nf_protein: (originalFood.nf_protein || 0) * ratio,
            nf_total_carbohydrate: (originalFood.nf_total_carbohydrate || 0) * ratio,
            nf_total_fat: (originalFood.nf_total_fat || 0) * ratio,
            nf_sugars: (originalFood.nf_sugars || 0) * ratio,
            nf_dietary_fiber: (originalFood.nf_dietary_fiber || 0) * ratio,
        };

        setSelectedFood(adjustedFood);
        setModalVisible(true);
    };

    const handleSelectMeal = async (mealType: string, time: string) => {
        if (!selectedFood || !user?.id) {
            Alert.alert("Error“, ”Food could not be selected or you are not logged in.");
            return;
        }
        setModalVisible(false);
        setLoading(true);

        try {
            const payload = {
                patient_id: user.id,
                type: mealType,
                time: time,
                food_data: selectedFood,
            };
            await axios.post(`${API_CONFIG.BASE_URL}/dailymeallogs/add-food`, payload);
            Alert.alert("¡Éxito!", `${selectedFood.food_name} se añadió a tu registro.`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (err: any) {
            console.error("❌ ERROR al añadir:", err.response?.data || err.message);
            Alert.alert("Error“, ”The food could not be added to your record.");
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, padding: 20 },
        input: { borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 10, borderRadius: 10, fontSize: 16, color: colors.text, backgroundColor: colors.card },
        button: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, marginBottom: 20 },
        buttonText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
        error: { color: 'red', textAlign: 'center', marginVertical: 10, fontSize: 16 },
    });

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <TextInput
                style={styles.input}
                placeholder="Example: 1 apple, 2 slices of bread"
                placeholderTextColor={colors.text}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={searchByQuery}
            />
            <TouchableOpacity style={styles.button} onPress={searchByQuery} disabled={loading}>
                <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color={colors.primary} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {result?.foods && <FoodDetails foods={result.foods} onAddFood={handleAddFoodPress} />}

            <AddFoodModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSelectMeal={handleSelectMeal}
            />
        </ScrollView>
    );
}