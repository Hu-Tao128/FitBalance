import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddFoodModal } from '../components/AddFoodModal';
import BarCodeScanner from '../components/BardCodeScanner';
import FoodDetails from '../components/FoodDetails';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

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
    photo?: { thumb?: string };
}

export default function FoodScanner({ navigation }: any) {
    const { colors } = useTheme();
    const { user } = useUser();
    const insets = useSafeAreaInsets();
    const styles = createDynamicStyles(colors, insets);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ foods: Food[] } | null>(null);
    const [error, setError] = useState('');
    const [scanned, setScanned] = useState(false);
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

                const normalizedFood: Food = {
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
                setResult({ foods: [normalizedFood] });
            } else {
                setError('Producto no encontrado en la base de datos.');
            }
        } catch {
            setError('Error al buscar por código de barras.');
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
            Alert.alert("Error", "No se pudo seleccionar el alimento.");
            return;
        }
        setModalVisible(false);
        setLoading(true);

        try {
            await axios.post(`${API_CONFIG.BASE_URL}/dailymeallogs/add-food`, {
                patient_id: user.id,
                type: mealType,
                time: time,
                food_data: selectedFood,
            });
            Alert.alert("¡Éxito!", `${selectedFood.food_name} añadido.`,
                [{ text: "OK", onPress: () => resetScanner() }]
            );
        } catch {
            Alert.alert("Error", "No se pudo añadir el alimento.");
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setResult(null);
        setError('');
        setScanned(false);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Buscando producto...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <View style={[styles.errorIconBox, { backgroundColor: colors.errorContainer }]}>
                        <Ionicons name="alert-circle" size={48} color={colors.error} />
                    </View>
                    <Text style={styles.errorTitle}>Producto no encontrado</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={resetScanner}>
                        <Ionicons name="refresh" size={20} color={colors.onPrimary} />
                        <Text style={styles.retryButtonText}>Escanear de Nuevo</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (result && result.foods[0]) {
        const food = result.foods[0];
        return (
            <View style={styles.container}>
                <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
                    {/* Food Header Card */}
                    <View style={[styles.foodCard, { backgroundColor: colors.card }]}>
                        {food.photo?.thumb ? (
                            <Image source={{ uri: food.photo.thumb }} style={styles.foodImage} />
                        ) : (
                            <View style={[styles.foodImagePlaceholder, { backgroundColor: colors.surfaceContainerHighest }]}>
                                <MaterialCommunityIcons name="food-apple" size={48} color={colors.outline} />
                            </View>
                        )}
                        <View style={styles.foodInfo}>
                            <Text style={styles.foodName}>{food.food_name}</Text>
                            <Text style={styles.foodServing}>{food.serving_qty} {food.serving_unit}</Text>
                        </View>
                    </View>

                    {/* Macros Card */}
                    <View style={[styles.macrosCard, { backgroundColor: colors.card }]}>
                        <Text style={[styles.macrosTitle, { color: colors.onSurface }]}>Información Nutricional</Text>
                        <View style={styles.macrosGrid}>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroValue, { color: colors.primary }]}>
                                    {food.nf_calories?.toFixed(0) || 0}
                                </Text>
                                <Text style={styles.macroLabel}>kcal</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroValue, { color: '#4CAF50' }]}>
                                    {food.nf_protein?.toFixed(1) || 0}g
                                </Text>
                                <Text style={styles.macroLabel}>Proteína</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroValue, { color: '#FFC107' }]}>
                                    {food.nf_total_carbohydrate?.toFixed(1) || 0}g
                                </Text>
                                <Text style={styles.macroLabel}>Carbos</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroValue, { color: '#FF7043' }]}>
                                    {food.nf_total_fat?.toFixed(1) || 0}g
                                </Text>
                                <Text style={styles.macroLabel}>Grasa</Text>
                            </View>
                        </View>
                    </View>

                    {/* Add Button */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddFoodPress(food, food.serving_weight_grams || 100)}
                    >
                        <Ionicons name="add-circle" size={24} color={colors.onPrimary} />
                        <Text style={styles.addButtonText}>Añadir al Registro</Text>
                    </TouchableOpacity>

                    {/* Scan Again */}
                    <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
                        <Ionicons name="qr-code-sharp" size={20} color={colors.primary} />
                        <Text style={styles.scanAgainText}>Escanear Otro Producto</Text>
                    </TouchableOpacity>
                </ScrollView>

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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Escanear Código</Text>
                <Text style={styles.headerSubtitle}>Apunta la cámara al código de barras del producto</Text>
            </View>
            <View style={styles.scannerContainer}>
                <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} />
                <View style={styles.scannerOverlay}>
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <Text style={styles.scanHint}>Centra el código de barras aquí</Text>
                </View>
            </View>
        </View>
    );
}

const createDynamicStyles = (colors: any, insets: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 16, color: colors.textSecondary },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    errorIconBox: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    errorTitle: { fontSize: 20, fontWeight: '700', color: colors.onSurface, marginBottom: 8 },
    errorText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
    retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 24, gap: 8 },
    retryButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
    header: { padding: 20, paddingTop: insets.top + 8 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: colors.onSurface, letterSpacing: -0.5, marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    resultScroll: { flex: 1 },
    foodCard: { margin: 20, borderRadius: 24, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    foodImage: { width: 160, height: 160, borderRadius: 16, marginBottom: 16 },
    foodImagePlaceholder: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    foodInfo: { alignItems: 'center' },
    foodName: { fontSize: 20, fontWeight: '800', color: colors.onSurface, textAlign: 'center', marginBottom: 4 },
    foodServing: { fontSize: 14, color: colors.textSecondary },
    macrosCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    macrosTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
    macrosGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    macroItem: { alignItems: 'center' },
    macroValue: { fontSize: 22, fontWeight: '800' },
    macroLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, marginHorizontal: 20, paddingVertical: 16, borderRadius: 28, gap: 8, marginBottom: 12 },
    addButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
    scanAgainButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8, marginBottom: 40 },
    scanAgainText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
    scannerContainer: { flex: 1, margin: 20, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000' },
    scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    scanFrame: { width: 260, height: 260, position: 'relative' },
    corner: { position: 'absolute', width: 40, height: 40, borderColor: colors.primary },
    topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
    topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
    scanHint: { color: '#fff', fontSize: 14, marginTop: 20, fontWeight: '600' },
});
