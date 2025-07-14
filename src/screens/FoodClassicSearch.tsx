import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FoodDetails from '../components/FoodDetails';
import { useTheme } from '../context/ThemeContext';

import { API_CONFIG } from '../config';

export default function FoodClassicSearch({ navigation }: any) {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 40,
            paddingHorizontal: 20,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            marginBottom: 10,
            borderRadius: 10,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.card,
        },
        button: {
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 10,
            marginBottom: 20,
        },
        buttonText: {
            textAlign: 'center',
            color: '#fff',
            fontWeight: 'bold',
        },
        error: {
            color: 'red',
            textAlign: 'center',
            marginTop: 10,
        },
        backButton: {
            backgroundColor: colors.card,
            padding: 10,
            borderRadius: 8,
            marginTop: 16,
            alignItems: 'center',
        },
        backText: {
            color: colors.primary,
        },
    });

    const searchByQuery = async () => {
        setLoading(true);
        setError('');
        if (!query.trim()) {
            setLoading(false);
            return setError("No has puesto un nombre de alimento");
        }
        try {
            const res = await axios.post(`${API_CONFIG}/search-food`, { query });

            if (res.data.source === 'nutritionix') {
                setResult({ foods: res.data.results });
            } else if (res.data.source === 'fatsecret') {
                const fatsecretFood = res.data.results.food[0];
                setResult({
                    foods: [{
                        food_name: fatsecretFood.food_name,
                        serving_qty: 1,
                        serving_unit: 'serving',
                        nf_calories: fatsecretFood.calories,
                        nf_total_fat: fatsecretFood.fat,
                        nf_saturated_fat: fatsecretFood.saturated_fat,
                        nf_cholesterol: fatsecretFood.cholesterol,
                        nf_sodium: fatsecretFood.sodium,
                        nf_total_carbohydrate: fatsecretFood.carbohydrate,
                        nf_dietary_fiber: fatsecretFood.fiber,
                        nf_sugars: fatsecretFood.sugar,
                        nf_protein: fatsecretFood.protein,
                        nf_potassium: fatsecretFood.potassium,
                        photo: {
                            thumb: fatsecretFood.food_images?.[0] || 'https://via.placeholder.com/150'
                        }
                    }]
                });
            }
        } catch (err) {
            setError('Error al buscar por texto');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Ej: 1 manzana, 2 rebanadas de pan"
                placeholderTextColor={colors.text}
                value={query}
                onChangeText={setQuery}
            />
            <TouchableOpacity style={styles.button} onPress={searchByQuery}>
                <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity>
            {loading && <ActivityIndicator size="large" color="#188827" style={{ marginTop: 20 }} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {result?.foods && <FoodDetails foods={result.foods} />}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>Regresar</Text>
            </TouchableOpacity>
        </View>
    );
}
