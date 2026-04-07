import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { foodService, Food } from '../services/food.service';
import { mealService } from '../services/meal.service';
import BarCodeScanner from '../components/BardCodeScanner';
import { AddFoodModal } from '../components/AddFoodModal';

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
            const normalizedFood = await foodService.searchBarcode(upc);
            if (normalizedFood) {
                setResult({ foods: [normalizedFood] });
            } else {
                setError('Producto no encontrado en la base de datos.');
            }
        } catch (err) {
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
            await mealService.addFoodLog({
                patient_id: String(user.id),
                meal_name: selectedFood.food_name,
                grams: selectedFood.serving_weight_grams || 100
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
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={resetScanner}>
                        <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Escáner de Alimentos</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {!result ? (
                    <View style={styles.scannerWrapper}>
                        <View style={styles.scannerContainer}>
                            <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} />
                            <View style={styles.overlay}>
                                <View style={styles.unfocusedContainer} />
                                <View style={styles.focusedContainer}>
                                    <View style={styles.cornerTopLeft} />
                                    <View style={styles.cornerTopRight} />
                                    <View style={styles.cornerBottomLeft} />
                                    <View style={styles.cornerBottomRight} />
                                </View>
                                <View style={styles.unfocusedContainer} />
                            </View>
                        </View>
                        <Text style={styles.hintText}>Centra el código de barras en el recuadro</Text>
                    </View>
                ) : (
                    <View style={styles.resultContainer}>
                        {result.foods.map((food, index) => (
                            <View key={index} style={[styles.foodCard, { backgroundColor: colors.card }]}>
                                {food.photo?.thumb && (
                                    <Image source={{ uri: food.photo.thumb }} style={styles.foodImage} />
                                )}
                                <Text style={styles.foodName}>{food.food_name}</Text>
                                <View style={styles.nutrientsGrid}>
                                    <View style={styles.nutrientItem}>
                                        <Text style={styles.nutrientValue}>{food.nf_calories?.toFixed(0)}</Text>
                                        <Text style={styles.nutrientLabel}>kcal</Text>
                                    </View>
                                    <View style={styles.nutrientItem}>
                                        <Text style={styles.nutrientValue}>{food.nf_protein?.toFixed(1)}g</Text>
                                        <Text style={styles.nutrientLabel}>Prot</Text>
                                    </View>
                                    <View style={styles.nutrientItem}>
                                        <Text style={styles.nutrientValue}>{food.nf_total_carbohydrate?.toFixed(1)}g</Text>
                                        <Text style={styles.nutrientLabel}>Carbs</Text>
                                    </View>
                                    <View style={styles.nutrientItem}>
                                        <Text style={styles.nutrientValue}>{food.nf_total_fat?.toFixed(1)}g</Text>
                                        <Text style={styles.nutrientLabel}>Grasas</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                                    onPress={() => handleAddFoodPress(food, 100)}
                                >
                                    <MaterialCommunityIcons name="plus" size={20} color="white" />
                                    <Text style={styles.addButtonText}>Añadir Alimento</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
                            <Text style={[styles.resetButtonText, { color: colors.primary }]}>Escanear otro producto</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <AddFoodModal
                visible={isModalVisible}
                food={selectedFood}
                onClose={() => setModalVisible(false)}
                onSelectMeal={handleSelectMeal}
            />
        </SafeAreaView>
    );
}

const createDynamicStyles = (colors: any, insets: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: insets.top, height: 60 + insets.top },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    backButton: { padding: 8 },
    scrollContent: { padding: 16 },
    scannerWrapper: { alignItems: 'center', marginTop: 20 },
    scannerContainer: { width: '100%', aspectRatio: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: 'black' },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    unfocusedContainer: { flex: 1, width: '100%', backgroundColor: 'rgba(0,0,0,0.5)' },
    focusedContainer: { width: 250, height: 250, borderWidth: 0 },
    cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#34C759' },
    cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#34C759' },
    cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#34C759' },
    cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#34C759' },
    hintText: { marginTop: 20, color: colors.text, opacity: 0.6, fontSize: 14 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: colors.text, opacity: 0.8 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    errorIconBox: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    errorTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    errorText: { textAlign: 'center', color: colors.text, opacity: 0.6, marginBottom: 24 },
    retryButton: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
    retryButtonText: { color: 'white', fontWeight: 'bold' },
    resultContainer: { width: '100%' },
    foodCard: { borderRadius: 20, padding: 20, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    foodImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
    foodName: { fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 20 },
    nutrientsGrid: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 24 },
    nutrientItem: { alignItems: 'center' },
    nutrientValue: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    nutrientLabel: { fontSize: 12, color: colors.text, opacity: 0.5 },
    addButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, gap: 8 },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    resetButton: { marginTop: 24, alignSelf: 'center' },
    resetButtonText: { fontSize: 15, fontWeight: '600' }
});
