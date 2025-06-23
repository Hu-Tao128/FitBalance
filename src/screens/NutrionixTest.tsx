import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator, Modal, ScrollView,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import BarCodeScanner from '../components/BardCodeScanner';
import { useTheme } from '../context/ThemeContext';
import FoodDetails from '../components/FoodDetails';

const SERVER_URL = 'https://fitbalance-backend-production.up.railway.app';

export default function NutritionixTest() {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scanned, setScanned] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 50,
            paddingHorizontal: 20,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            color: colors.primary,
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
        scannerContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        closeButton: {
            position: 'absolute',
            bottom: 30,
            alignSelf: 'center',
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 10,
        },
        closeButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
    });

    const searchByQuery = async () => {
        
        setLoading(true);
        setError('');

        if (query.trim() || query == null) {
            return setError("No has puesto un nombre de alimento");
        }
        try {
            const res = await axios.post(`${SERVER_URL}/search-food`, { query });

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

    const searchByBarcode = async (upc: string) => {
        setShowScanner(false);
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${upc}.json`);

            if (response.data.status === 1) {
                const product = response.data.product;
                setResult({
                    foods: [{
                        food_name: product.product_name || 'Producto sin nombre',
                        serving_qty: 1,
                        serving_unit: product.serving_size || '100g',
                        nf_calories: product.nutriments['energy-kcal_100g'],
                        nf_total_fat: product.nutriments['fat_100g'],
                        nf_saturated_fat: product.nutriments['saturated-fat_100g'],
                        nf_cholesterol: product.nutriments['cholesterol_100g'],
                        nf_sodium: product.nutriments['sodium_100g'],
                        nf_total_carbohydrate: product.nutriments['carbohydrates_100g'],
                        nf_dietary_fiber: product.nutriments['fiber_100g'],
                        nf_sugars: product.nutriments['sugars_100g'],
                        nf_protein: product.nutriments['proteins_100g'],
                        nf_potassium: product.nutriments['potassium_100g'],
                        photo: {
                            thumb: product.image_thumb_url || 'https://via.placeholder.com/150',
                        }
                    }]
                });
            } else {
                setError('🔍 Producto no encontrado en Open Food Facts');
            }
        } catch (err) {
            setError('Error al buscar por código de barras');
            console.error(err);
        } finally {
            setLoading(false);
            setScanned(false);
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        console.log('Código escaneado:', data);
        setScanned(true);
        searchByBarcode(data);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>🔬 Buscador de Alimentos</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setShowScanner(true)}
            >
                <Text style={styles.buttonText}>Buscar por código de barras</Text>
            </TouchableOpacity>

            <Modal
                visible={showScanner}
                animationType="slide"
                onRequestClose={() => setShowScanner(false)}
            >
                <View style={styles.scannerContainer}>
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowScanner(false)}
                    >
                        <Text style={styles.closeButtonText}>Cerrar Escáner</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <TextInput
                style={styles.input}
                placeholder="Ej: 1 manzana, 2 rebanadas de pan"
                placeholderTextColor={colors.text}
                value={query}
                onChangeText={setQuery}
            />
            <TouchableOpacity style={styles.button} onPress={searchByQuery}>
                <Text style={styles.buttonText}>Buscar por Descripción</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#188827" style={{ marginTop: 20 }} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Aquí usamos el componente */}
            {result?.foods && <FoodDetails foods={result.foods} />}
        </ScrollView>
    );
}