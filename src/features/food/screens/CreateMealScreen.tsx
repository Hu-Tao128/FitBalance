import React, { useEffect, useState, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useUser } from '../../../context/UserContext';
import { useTheme } from '../../../context/ThemeContext';
import { mealService } from '../services/meal.service';

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

export default function CreateMealScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { user } = useUser();
    const { colors } = useTheme();
    const styles = createDynamicStyles(colors);

    const [foods, setFoods] = useState<Food[]>([]);
    const [loadingFoods, setLoadingFoods] = useState(false);
    const [searchFood, setSearchFood] = useState('');
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [amount, setAmount] = useState('');
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [mealName, setMealName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);

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
                const data = await mealService.getAllFoods();
                if (mounted) setFoods(data || []);
            } catch (err) {
                console.error('ERROR al obtener alimentos:', err);
                Alert.alert(t('food.error'), t('food.createMealLoadFoodsError'));
            } finally {
                if (mounted) setLoadingFoods(false);
            }
        })();
        return () => { mounted = false; };
    }, [t]);

    useEffect(() => {
        const t: any = { energy_kcal: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0 };
        ingredients.forEach(ing => {
            if (ing.food_data?.nutrients && ing.food_data?.portion_size_g) {
                const f = ing.amount_g / (ing.food_data.portion_size_g || 100);
                t.energy_kcal += (ing.food_data.nutrients.energy_kcal || 0) * f;
                t.protein_g += (ing.food_data.nutrients.protein_g || 0) * f;
                t.carbohydrates_g += (ing.food_data.nutrients.carbohydrates_g || 0) * f;
                t.fat_g += (ing.food_data.nutrients.fat_g || 0) * f;
                t.fiber_g += (ing.food_data.nutrients.fiber_g || 0) * f;
                t.sugar_g += (ing.food_data.nutrients.sugar_g || 0) * f;
            }
        });
        setTotals(t);
    }, [ingredients]);

    const handleAddIngredient = () => {
        if (!selectedFood) return Alert.alert(t('food.error'), t('food.createMealSelectFoodError'));
        const grams = parseFloat(amount);
        if (isNaN(grams) || grams <= 0) return Alert.alert(t('food.error'), t('food.createMealInvalidAmountError'));

        setIngredients([...ingredients, {
            food_id: getObjectIdFromMongoDoc(selectedFood._id),
            food_data: selectedFood,
            amount_g: grams,
        }]);
        setAmount('');
        setSelectedFood(null);
        setSearchFood('');
    };

    const handleRemoveIngredient = (index: number) => {
        const newIng = [...ingredients];
        newIng.splice(index, 1);
        setIngredients(newIng);
    };

    const handleSaveMeal = async () => {
        if (!mealName.trim()) return Alert.alert(t('food.error'), t('food.createMealNameRequiredError'));
        if (ingredients.length === 0) return Alert.alert(t('food.error'), t('food.createMealIngredientsRequiredError'));

        const patientId = getObjectIdFromMongoDoc(user?.id);
        if (!isValidObjectId(patientId)) {
            return Alert.alert(t('food.error'), t('food.createMealUserInfoError'));
        }

        setLoading(true);

        try {
            const mealData = {
                patient_id: patientId,
                name: mealName.trim(),
                ingredients: ingredients.map(i => ({
                    food_id: i.food_id,
                    amount_g: i.amount_g,
                })),
                nutrients: totals,
                instructions: instructions.trim(),
            };

            await mealService.createPatientMeal(mealData);

            Alert.alert(t('food.addMealSuccess'), t('food.createMealSuccessMsg'));
            setMealName('');
            setIngredients([]);
            setInstructions('');
            setSelectedFood(null);
            setSearchFood('');
            setAmount('');
            navigation.goBack();
        } catch (err: any) {
            console.error('ERROR al crear comida:', err);
            Alert.alert(t('food.error'), t('food.createMealSaveError'));
        } finally {
            setLoading(false);
        }
    };

    const filteredFoods = foods.filter(f => f.name.toLowerCase().includes(searchFood.toLowerCase()));

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('food.createMealScreenTitle')}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>{t('food.createMealNameLabel')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                            placeholder={t('food.createMealNamePlaceholder')}
                            placeholderTextColor={colors.outline}
                            value={mealName}
                            onChangeText={setMealName}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>{t('food.createMealSearchIngredientLabel')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                            placeholder={t('food.createMealSearchFoodPlaceholder')}
                            placeholderTextColor={colors.outline}
                            value={searchFood}
                            onChangeText={setSearchFood}
                        />
                        {searchFood.length > 0 && !selectedFood && (
                            <View style={[styles.resultsBox, { backgroundColor: colors.card }]}>
                                {loadingFoods ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : filteredFoods.length > 0 ? (
                                    filteredFoods.map(f => (
                                        <TouchableOpacity key={getObjectIdFromMongoDoc(f._id)} style={styles.resultItem} onPress={() => { setSelectedFood(f); setSearchFood(f.name); }}>
                                            <Text style={[styles.resultName, { color: colors.text }]}>{f.name}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text style={[styles.noResult, { color: colors.outline }]}>{t('food.createMealNoFoodsFound')}</Text>
                                )}
                            </View>
                        )}
                    </View>

                    {selectedFood && (
                        <View style={[styles.amountSection, { backgroundColor: colors.surfaceContainerLow }]}>
                            <Text style={[styles.amountLabel, { color: colors.text }]}>
                                {t('food.createMealAmountOf', { foodName: selectedFood.name })}
                            </Text>
                            <View style={styles.amountInputRow}>
                                <TextInput
                                    style={[styles.amountInput, { color: colors.text, borderBottomColor: colors.primary }]}
                                    placeholder="0"
                                    placeholderTextColor={colors.outline}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                                <Text style={[styles.unit, { color: colors.text }]}>{t('food.createMealGrams')}</Text>
                                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddIngredient}>
                                    <Ionicons name="add" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>
                            {t('food.createMealIngredientsCount', { count: ingredients.length })}
                        </Text>
                        {ingredients.map((item, index) => (
                            <View key={index} style={[styles.ingredientItem, { backgroundColor: colors.card }]}>
                                <View style={styles.ingredientInfo}>
                                    <Text style={[styles.ingredientName, { color: colors.text }]}>{item.food_data.name}</Text>
                                    <Text style={[styles.ingredientMeta, { color: colors.outline }]}>{item.amount_g}g • {Math.round((item.food_data.nutrients?.energy_kcal || 0) * (item.amount_g / (item.food_data.portion_size_g || 100)))} kcal</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemoveIngredient(index)}>
                                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.totalsCard, { backgroundColor: colors.primary }]}>
                        <Text style={styles.totalsTitle}>{t('food.createMealNutritionTitle')}</Text>
                        <View style={styles.totalsGrid}>
                            <View style={styles.totalItem}>
                                <Text style={styles.totalValue}>{totals.energy_kcal.toFixed(0)}</Text>
                                <Text style={styles.totalLabel}>kcal</Text>
                            </View>
                            <View style={styles.totalItem}>
                                <Text style={styles.totalValue}>{totals.protein_g.toFixed(1)}g</Text>
                                <Text style={styles.totalLabel}>Prot</Text>
                            </View>
                            <View style={styles.totalItem}>
                                <Text style={styles.totalValue}>{totals.carbohydrates_g.toFixed(1)}g</Text>
                                <Text style={styles.totalLabel}>Carbs</Text>
                            </View>
                            <View style={styles.totalItem}>
                                <Text style={styles.totalValue}>{totals.fat_g.toFixed(1)}g</Text>
                                <Text style={styles.totalLabel}>Grasas</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                        onPress={handleSaveMeal}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>{t('food.createMealSaveButton')}</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createDynamicStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, height: 60 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginLeft: 16 },
    backButton: { padding: 4 },
    scrollContent: { padding: 16 },
    section: { marginBottom: 20 },
    sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
    resultsBox: { borderRadius: 12, marginTop: 4, maxHeight: 200, overflow: 'hidden', elevation: 3 },
    resultItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    resultName: { fontSize: 15 },
    noResult: { padding: 14, textAlign: 'center' },
    amountSection: { padding: 16, borderRadius: 16, marginBottom: 20 },
    amountLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
    amountInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    amountInput: { flex: 1, height: 40, fontSize: 18, fontWeight: 'bold', borderBottomWidth: 2 },
    unit: { fontSize: 16 },
    addButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    ingredientItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, marginBottom: 8 },
    ingredientInfo: { flex: 1 },
    ingredientName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    ingredientMeta: { fontSize: 13 },
    totalsCard: { padding: 20, borderRadius: 20, marginBottom: 24 },
    totalsTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    totalsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    totalItem: { alignItems: 'center' },
    totalValue: { color: 'white', fontSize: 20, fontWeight: '800' },
    totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
    saveButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    saveButtonText: { color: 'white', fontSize: 17, fontWeight: 'bold' }
});
