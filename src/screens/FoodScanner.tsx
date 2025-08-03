import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AddFoodModal } from '../components/AddFoodModal';
import BarCodeScanner from '../components/BardCodeScanner';
import FoodDetails from '../components/FoodDetails';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

// Interfaz para la estructura del alimento (consistente en toda la app)
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

export default function FoodScanner({ navigation }: any) {
    const { colors } = useTheme();
    const { user } = useUser();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ foods: Food[] } | null>(null);
    const [error, setError] = useState('');
    const [scanned, setScanned] = useState(false);

    // Estados para el modal y el alimento seleccionado
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);

    const searchByBarcode = async (upc: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${upc}.json`);
            if (response.data.status === 1) {
                const product = response.data.product;
                const nutriments = product.nutriments || {};

                // 👇 **Normalizamos la respuesta de la API a nuestra interfaz 'Food'**
                const normalizedFood: Food = {
                    food_name: product.product_name || 'Producto sin nombre',
                    serving_qty: 1,
                    serving_unit: product.serving_size || '100g',
                    serving_weight_grams: 100, // La API de Open Food Facts da valores por 100g
                    nf_calories: nutriments['energy-kcal_100g'] || nutriments['energy-kj_100g'] / 4.184 || 0,
                    nf_protein: nutriments['proteins_100g'] || 0,
                    nf_total_carbohydrate: nutriments['carbohydrates_100g'] || 0,
                    nf_total_fat: nutriments['fat_100g'] || 0,
                    nf_sugars: nutriments['sugars_100g'] || 0,
                    nf_dietary_fiber: nutriments['fiber_100g'] || 0,
                    photo: {
                        thumb: product.image_front_thumb_url || product.image_thumb_url || undefined,
                    }
                };
                setResult({ foods: [normalizedFood] });
            } else {
                setError('🔍 Producto no encontrado en la base de datos.');
            }
        } catch (err) {
            setError('Error al buscar por código de barras.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            searchByBarcode(data);
        }
    };

    const handleAddFoodPress = (originalFood: Food, adjustedGrams: number) => {
        const baseGrams = originalFood.serving_weight_grams || 100;
        const ratio = adjustedGrams / baseGrams;

        const adjustedFood: Food = {
            ...originalFood,
            serving_weight_grams: adjustedGrams,
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
            Alert.alert("Error", "No se pudo seleccionar el alimento o no has iniciado sesión.");
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
                [{ text: "OK", onPress: () => resetScanner() }]
            );
        } catch (err: any) {
            Alert.alert("Error", "No se pudo añadir el alimento a tu registro.");
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setResult(null);
        setError('');
        setScanned(false);
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
        error: { color: 'red', textAlign: 'center', marginTop: 10, padding: 20, fontSize: 18 },
        resultContainer: { flex: 1, paddingTop: 20 },
        scanAgainButton: { backgroundColor: colors.primary, borderRadius: 10, padding: 15, margin: 20 },
        scanAgainText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
    });

    if (loading) {
        return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{error}</Text>
                <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
                    <Text style={styles.scanAgainText}>Escanear de Nuevo</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (result) {
        return (
            <View style={styles.container}>
                <ScrollView style={styles.resultContainer}>
                    <FoodDetails foods={result.foods} onAddFood={handleAddFoodPress} />
                </ScrollView>
                <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
                    <Text style={styles.scanAgainText}>Escanear Otro Producto</Text>
                </TouchableOpacity>
                <AddFoodModal
                    visible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    onSelectMeal={handleSelectMeal}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} />
        </View>
    );
}