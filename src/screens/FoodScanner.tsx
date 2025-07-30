import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import BarCodeScanner from '../components/BardCodeScanner';
import FoodDetails from '../components/FoodDetails';
import { useTheme } from '../context/ThemeContext';

export default function FoodScanner({ navigation }: any) {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [scanned, setScanned] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
        },
        error: {
            color: 'red',
            textAlign: 'center',
            marginTop: 10,
        },
    });

    const searchByBarcode = async (upc: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${upc}.json`);
            if (response.data.status === 1) {
                const product = response.data.product;
                setResult({
                    foods: [{
                        food_name: product.product_name || 'Unnamed product',
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
                setError('🔍 Product not found in Open Food Facts');
            }
        } catch (err) {
            setError('Error when searching by barcode');
            console.error(err);
        } finally {
            setLoading(false);
            setScanned(false);
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        searchByBarcode(data);
    };

    return (
        <View style={styles.container}>
            {!result && !loading && (
                <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} />
            )}
            {loading && <ActivityIndicator size="large" color={colors.primary} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {result?.foods && <FoodDetails foods={result.foods} />}
        </View>
    );
}
