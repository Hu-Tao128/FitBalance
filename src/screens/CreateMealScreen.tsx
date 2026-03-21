import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

import { API_CONFIG } from '../config/config';

type Nutrients = {
    energy_kcal?: number;
    protein_g?: number;
    carbohydrates_g?: number;
    fat_g?: number;
    fiber_g?: number;
    sugar_g?: number;
};

type Food = {
    _id: any;
    name: string;
    nutrients?: Nutrients;
    portion_size_g?: number;
};

type Ingredient = {
    food_id: string;
    food_data: Food;
    amount_g: number;
};

function getObjectIdFromMongoDoc(id: any) {
    if (typeof id === 'object' && id?.$oid) return id.$oid;
    return String(id);
}
function isValidObjectId(id: any) {
    return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

export default function CreateMealScreen() {
    const { user } = useUser();
    const { colors, darkMode } = useTheme();
    const styles = createDynamicStyles(colors, darkMode);

    const [foods, setFoods] = useState<Food[]>([]);
    const [searchFood, setSearchFood] = useState('');
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [amount, setAmount] = useState('');
    const [mealName, setMealName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFoods, setLoadingFoods] = useState(false);
    const [totals, setTotals] = useState({
        energy_kcal: 0,
        protein_g: 0,
        carbohydrates_g: 0,
        fat_g: 0,
        fiber_g: 0,
        sugar_g: 0,
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoadingFoods(true);
            try {
                const res = await axios.get(`${API_CONFIG.BASE_URL}/api/food`);
                if (mounted) setFoods(res.data || []);
            } catch (err) {
                console.error('ERROR al obtener alimentos:', err);
                Alert.alert('Error', 'No se pudieron cargar los alimentos.');
            } finally {
                if (mounted) setLoadingFoods(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        const t: any = { energy_kcal: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0 };
        ingredients.forEach(ing => {
            if (ing.food_data?.nutrients && ing.food_data?.portion_size_g) {
                const f = ing.amount_g / (ing.food_data.portion_size_g || 1);
                t.energy_kcal += (ing.food_data.nutrients.energy_kcal || 0) * f;
                t.protein_g += (ing.food_data.nutrients.protein_g || 0) * f;
                t.carbohydrates_g += (ing.food_data.nutrients.carbohydrates_g || 0) * f;
                t.fat_g += (ing.food_data.nutrients.fat_g || 0) * f;
                t.fiber_g += (ing.food_data.nutrients.fiber_g || 0) * f;
                t.sugar_g += (ing.food_data.nutrients.sugar_g || 0) * f;
            }
        });
        setTotals({
            energy_kcal: Math.round(t.energy_kcal),
            protein_g: Math.round(t.protein_g * 10) / 10,
            carbohydrates_g: Math.round(t.carbohydrates_g * 10) / 10,
            fat_g: Math.round(t.fat_g * 10) / 10,
            fiber_g: Math.round(t.fiber_g * 10) / 10,
            sugar_g: Math.round(t.sugar_g * 10) / 10,
        });
    }, [ingredients]);

    const filteredFoods =
        searchFood.trim().length < 2
            ? []
            : foods
                .filter(f => (f.name || '').toLowerCase().includes(searchFood.trim().toLowerCase()))
                .slice(0, 10);

    const handleAddIngredient = () => {
        const grams = Number(amount);
        if (!selectedFood) return Alert.alert('Error', 'Selecciona un alimento válido.');
        if (!grams || grams <= 0) return Alert.alert('Error', 'Ingresa una cantidad válida (>0 g).');

        const _id = getObjectIdFromMongoDoc(selectedFood._id);
        if (ingredients.some(i => i.food_id === _id))
            return Alert.alert('Error', 'Este alimento ya está agregado a la lista.');

        setIngredients(prev => [...prev, { food_id: _id, food_data: selectedFood, amount_g: grams }]);
        setSelectedFood(null);
        setSearchFood('');
        setAmount('');
    };

    const handleRemoveIngredient = (indexToRemove: number) =>
        Alert.alert('Eliminar Ingrediente', '¿Eliminar este ingrediente?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => setIngredients(arr => arr.filter((_, idx) => idx !== indexToRemove)),
            },
        ]);

    const handleCreateNewMeal = async () => {
        if (!mealName.trim()) return Alert.alert('Error', 'Debes ponerle un nombre a la comida.');
        if (ingredients.length === 0) return Alert.alert('Error', 'Agrega al menos un ingrediente.');

        const patientId = getObjectIdFromMongoDoc(user?.id);
        if (!isValidObjectId(patientId)) {
            return Alert.alert('Error', 'No se pudo obtener la información de tu usuario.');
        }

        setLoading(true);

        try {
            const mealData = {
                patient_id: patientId,
                name: mealName.trim(),
                ingredients: ingredients.map(i => ({
                    food_id: getObjectIdFromMongoDoc(i.food_id),
                    amount_g: i.amount_g,
                })),
                nutrients: totals,
                instructions: instructions.trim(),
            };

            await axios.post(`${API_CONFIG.BASE_URL}/PatientMeals`, mealData, {
                headers: { 'Content-Type': 'application/json' },
            });

            Alert.alert('¡Éxito!', 'Comida creada correctamente.');
            setMealName('');
            setIngredients([]);
            setInstructions('');
            setSelectedFood(null);
            setSearchFood('');
            setAmount('');
        } catch (err: any) {
            console.error('ERROR al crear comida:', err.response?.data || err.message);
            Alert.alert('Error', err.response?.data?.error || 'No se pudo crear la comida.');
        } finally {
            setLoading(false);
        }
    };

    const IngredientItem = ({ item, index }: { item: Ingredient; index: number }) => (
        <View style={styles.ingredientItem}>
            <View style={styles.ingredientIconBox}>
                <Ionicons name="nutrition" size={18} color={colors.primary} />
            </View>
            <View style={styles.ingredientNameBox}>
                <Text style={styles.ingredientName} numberOfLines={2}>{item.food_data.name}</Text>
                <Text style={styles.ingredientMeta}>{item.amount_g}g • {Math.round((item.food_data.nutrients?.energy_kcal || 0) * (item.amount_g / (item.food_data.portion_size_g || 100)))} kcal</Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveIngredient(index)}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerSubtitle}>Nueva Entrada</Text>
                        <Text style={styles.headerTitle}>Crear Comida</Text>
                        <Text style={styles.headerDescription}>
                            Diseña tu comida personalizada. Calcularemos los macros precisos.
                        </Text>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputCard}>
                        <Text style={styles.inputLabel}>Nombre de la comida</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="restaurant-outline" size={20} color={colors.outline} />
                            <TextInput
                                style={styles.input}
                                value={mealName}
                                onChangeText={setMealName}
                                placeholder="Ej. Ensalada del Huerto"
                                placeholderTextColor={colors.outline}
                            />
                        </View>
                    </View>

                    {/* Search Section */}
                    <View style={styles.inputCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.inputLabel}>Ingredientes</Text>
                            {ingredients.length > 0 && (
                                <Text style={styles.itemsCount}>{ingredients.length} añadidos</Text>
                            )}
                        </View>
                        
                        <View style={styles.searchWrapper}>
                            <Ionicons name="search" size={20} color={colors.outline} />
                            <TextInput
                                style={styles.searchInput}
                                value={searchFood}
                                onChangeText={setSearchFood}
                                placeholder="Buscar ingredientes..."
                                placeholderTextColor={colors.outline}
                            />
                        </View>

                        {loadingFoods && <ActivityIndicator style={styles.loader} size="small" color={colors.primary} />}

                        {/* Food Suggestions */}
                        {searchFood.trim().length >= 2 && !selectedFood && (
                            <View style={styles.suggestionsBox}>
                                {filteredFoods.map(item => (
                                    <TouchableOpacity 
                                        key={getObjectIdFromMongoDoc(item._id)} 
                                        style={styles.foodSuggestion}
                                        onPress={() => setSelectedFood(item)}
                                    >
                                        <View style={styles.foodSuggestionIcon}>
                                            <Ionicons name="nutrition" size={16} color={colors.primary} />
                                        </View>
                                        <View style={styles.foodSuggestionInfo}>
                                            <Text style={styles.foodSuggestionName}>{item.name}</Text>
                                            <Text style={styles.foodSuggestionMeta}>
                                                {item.nutrients?.energy_kcal || 0} kcal • {item.portion_size_g || 100}g
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                                {filteredFoods.length === 0 && !loadingFoods && (
                                    <Text style={styles.noResults}>No se encontraron alimentos.</Text>
                                )}
                            </View>
                        )}

                        {/* Selected Food Add */}
                        {selectedFood && (
                            <View style={styles.selectedFoodBox}>
                                <View style={styles.selectedFoodInfo}>
                                    <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                                    <Text style={styles.selectedFoodMeta}>{selectedFood.nutrients?.energy_kcal || 0} kcal</Text>
                                </View>
                                <View style={styles.amountRow}>
                                    <TextInput
                                        style={styles.amountInput}
                                        value={amount}
                                        onChangeText={setAmount}
                                        placeholder="g"
                                        keyboardType="numeric"
                                        placeholderTextColor={colors.outline}
                                    />
                                    <TouchableOpacity style={styles.addIngredientBtn} onPress={handleAddIngredient}>
                                        <Ionicons name="add-circle" size={24} color={colors.onPrimary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Added Ingredients */}
                        {ingredients.map((item, index) => (
                            <IngredientItem key={`${item.food_id}-${index}`} item={item} index={index} />
                        ))}
                    </View>

                    {/* Instructions */}
                    <View style={styles.inputCard}>
                        <Text style={styles.inputLabel}>Instrucciones (opcional)</Text>
                        <TextInput
                            style={styles.textArea}
                            value={instructions}
                            onChangeText={setInstructions}
                            placeholder="Describe cómo preparar esta comida..."
                            multiline
                            numberOfLines={4}
                            placeholderTextColor={colors.outline}
                        />
                    </View>

                    {/* Macro Preview */}
                    {ingredients.length > 0 && (
                        <View style={styles.macrosGrid}>
                            <View style={styles.macroCard}>
                                <Text style={styles.macroLabel}>Energía Total</Text>
                                <View style={styles.macroValueRow}>
                                    <Text style={styles.macroValue}>{totals.energy_kcal}</Text>
                                    <Text style={styles.macroUnit}>kcal</Text>
                                </View>
                            </View>
                            <View style={styles.macroCardSecondary}>
                                <Text style={styles.macroLabel}>Balance de Macros</Text>
                                <View style={styles.macroBars}>
                                    <View style={[styles.macroBar, styles.proteinBar, { flex: totals.protein_g || 0.5 }]} />
                                    <View style={[styles.macroBar, styles.carbsBar, { flex: totals.carbohydrates_g || 1 }]} />
                                    <View style={[styles.macroBar, styles.fatBar, { flex: totals.fat_g || 0.2 }]} />
                                </View>
                                <Text style={styles.macroBalance}>Óptimo para crecimiento</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Action */}
                <View style={styles.bottomAction}>
                    <TouchableOpacity
                        style={[styles.createButton, loading && styles.createButtonDisabled]}
                        disabled={loading}
                        onPress={handleCreateNewMeal}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.onPrimary} />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.createButtonText}>Crear Comida</Text>
                                <Ionicons name="flash" size={22} color={colors.onPrimary} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createDynamicStyles = (colors: any, darkMode: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 20, paddingBottom: 100 },
    header: { marginBottom: 24 },
    headerSubtitle: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: colors.onSurface, letterSpacing: -0.5, marginBottom: 8 },
    headerDescription: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    inputCard: { backgroundColor: colors.card, borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: colors.secondary, marginBottom: 10 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerHighest, borderRadius: 14, paddingHorizontal: 16, height: 50 },
    input: { flex: 1, fontSize: 16, color: colors.onSurface, marginLeft: 10 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    itemsCount: { fontSize: 12, fontWeight: '600', color: colors.primary },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerHighest, borderRadius: 14, paddingHorizontal: 16, height: 50 },
    searchInput: { flex: 1, fontSize: 16, color: colors.onSurface, marginLeft: 10 },
    loader: { marginTop: 12 },
    suggestionsBox: { backgroundColor: colors.surfaceContainerHighest, borderRadius: 14, marginTop: 10, overflow: 'hidden' },
    foodSuggestion: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    foodSuggestionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryContainer, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    foodSuggestionInfo: { flex: 1 },
    foodSuggestionName: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
    foodSuggestionMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    noResults: { textAlign: 'center', padding: 20, fontSize: 14, color: colors.textSecondary },
    selectedFoodBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondaryContainer, borderRadius: 14, padding: 14, marginTop: 12 },
    selectedFoodInfo: { flex: 1 },
    selectedFoodName: { fontSize: 14, fontWeight: '600', color: colors.onSecondaryContainer },
    selectedFoodMeta: { fontSize: 12, color: colors.onSecondaryFixedVariant, marginTop: 2 },
    amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    amountInput: { width: 70, backgroundColor: colors.surfaceContainerLowest, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, color: colors.onSurface, textAlign: 'center' },
    addIngredientBtn: { padding: 4 },
    ingredientItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginTop: 10 },
    ingredientIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceContainerHighest, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    ingredientNameBox: { flex: 1 },
    ingredientName: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
    ingredientMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    removeButton: { padding: 8 },
    textArea: { backgroundColor: colors.surfaceContainerHighest, borderRadius: 14, padding: 16, fontSize: 16, color: colors.onSurface, minHeight: 100, textAlignVertical: 'top' },
    macrosGrid: { flexDirection: 'row', gap: 12 },
    macroCard: { flex: 1, backgroundColor: colors.primaryContainer, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 100 },
    macroCardSecondary: { flex: 1, backgroundColor: colors.secondaryContainer, borderRadius: 16, padding: 16 },
    macroLabel: { fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
    macroValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
    macroValue: { fontSize: 28, fontWeight: '800', color: colors.onPrimaryContainer },
    macroUnit: { fontSize: 12, color: colors.onPrimaryContainer, marginLeft: 4, opacity: 0.7 },
    macroBars: { flexDirection: 'row', gap: 4, marginTop: 12 },
    macroBar: { height: 6, borderRadius: 3 },
    proteinBar: { backgroundColor: colors.progressProtein },
    carbsBar: { backgroundColor: colors.progressCarbs },
    fatBar: { backgroundColor: colors.progressFat },
    macroBalance: { fontSize: 10, fontWeight: '600', color: colors.onSecondaryContainer, marginTop: 8 },
    bottomAction: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
    createButton: { backgroundColor: colors.primary, borderRadius: 28, paddingVertical: 18, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    createButtonDisabled: { opacity: 0.7 },
    buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    createButtonText: { fontSize: 17, fontWeight: '700', color: colors.onPrimary, marginRight: 8 },
});