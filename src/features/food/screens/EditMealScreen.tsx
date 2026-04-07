import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useUser } from '../../../context/UserContext';
import { useTheme } from '../../../context/ThemeContext';
import { mealService } from '../services/meal.service';

type EditMealScreenRouteProp = RouteProp<RootStackParamList, 'EditMeal'>;
type EditMealScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditMeal'>;
type Nutrients = { energy_kcal?: number; protein_g?: number; carbohydrates_g?: number; fat_g?: number; fiber_g?: number; sugar_g?: number; };
type Food = { _id: any; name: string; nutrients?: Nutrients; portion_size_g?: number; };
type Ingredient = { food_id: string; food_data: Food; amount_g: number; };

function getObjectIdFromMongoDoc(id: any) {
    if (typeof id === 'object' && id?.$oid) return id.$oid;
    return String(id);
}

export default function EditMealScreen() {
    const { user } = useUser();
    const { colors } = useTheme();
    const navigation = useNavigation<EditMealScreenNavigationProp>();
    const route = useRoute<EditMealScreenRouteProp>();
    const { mealToEdit } = route.params;
    const styles = createDynamicStyles(colors);

    const [foods, setFoods] = useState<Food[]>([]);
    const [searchFood, setSearchFood] = useState('');
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [amount, setAmount] = useState('');
    const [mealName, setMealName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFoods, setLoadingFoods] = useState(false);
    const [totals, setTotals] = useState({ energy_kcal: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0 });

    useEffect(() => {
        if (mealToEdit) {
            setMealName(mealToEdit.name);
            setInstructions(mealToEdit.instructions || '');
            const loadedIngredients: Ingredient[] = mealToEdit.ingredients.map((ing: any) => ({
                food_id: getObjectIdFromMongoDoc(ing.food_id._id),
                food_data: {
                    _id: getObjectIdFromMongoDoc(ing.food_id._id),
                    name: ing.food_id.name,
                    nutrients: ing.food_id.nutrients,
                    portion_size_g: ing.food_id.portion_size_g,
                },
                amount_g: ing.amount_g,
            }));
            setIngredients(loadedIngredients);
        }
    }, [mealToEdit]);

    useEffect(() => {
        const fetchAllFoods = async () => {
            setLoadingFoods(true);
            try {
                const data = await mealService.getAllFoods();
                setFoods(data || []);
            } catch (err) {
                console.error('ERROR al obtener alimentos:', err);
                Alert.alert('Error', 'No se pudieron cargar los alimentos.');
            } finally {
                setLoadingFoods(false);
            }
        };
        fetchAllFoods();
    }, []);

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
        if (!selectedFood) return Alert.alert('Error', 'Selecciona un ingrediente.');
        const grams = parseFloat(amount);
        if (isNaN(grams) || grams <= 0) return Alert.alert('Error', 'Ingresa una cantidad válida.');

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

    const handleUpdateMeal = async () => {
        if (!mealName.trim()) return Alert.alert('Error', 'Ingresa el nombre.');
        if (ingredients.length === 0) return Alert.alert('Error', 'Agrega ingredientes.');

        setLoading(true);
        try {
            const mealData = {
                name: mealName.trim(),
                ingredients: ingredients.map(i => ({
                    food_id: i.food_id,
                    amount_g: i.amount_g,
                })),
                nutrients: totals,
                instructions: instructions.trim(),
            };

            await mealService.updatePatientMeal(mealToEdit._id, mealData);
            Alert.alert('¡Éxito!', 'Comida actualizada.');
            navigation.goBack();
        } catch (err) {
            console.error('ERROR al actualizar comida:', err);
            Alert.alert('Error', 'No se pudo actualizar.');
        } finally {
            setLoading(false);
        }
    };

    const filteredFoods = foods.filter(f => f.name.toLowerCase().includes(searchFood.toLowerCase()));

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Editar Comida</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Nombre de la Comida</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                            value={mealName}
                            onChangeText={setMealName}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Buscar Ingrediente</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                            placeholder="Buscar alimento..."
                            placeholderTextColor={colors.outline}
                            value={searchFood}
                            onChangeText={setSearchFood}
                        />
                        {searchFood.length > 0 && !selectedFood && (
                            <View style={[styles.resultsBox, { backgroundColor: colors.card }]}>
                                {loadingFoods ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : filteredFoods.map(f => (
                                    <TouchableOpacity key={getObjectIdFromMongoDoc(f._id)} style={styles.resultItem} onPress={() => { setSelectedFood(f); setSearchFood(f.name); }}>
                                        <Text style={[styles.resultName, { color: colors.text }]}>{f.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {selectedFood && (
                        <View style={[styles.amountSection, { backgroundColor: colors.surfaceContainerLow }]}>
                            <Text style={[styles.amountLabel, { color: colors.text }]}>Cantidad para {selectedFood.name}:</Text>
                            <View style={styles.amountInputRow}>
                                <TextInput
                                    style={[styles.amountInput, { color: colors.text, borderBottomColor: colors.primary }]}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                                <Text style={[styles.unit, { color: colors.text }]}>g</Text>
                                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddIngredient}>
                                    <Ionicons name="add" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Ingredientes</Text>
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
                        <Text style={styles.totalsTitle}>Totales de la Comida</Text>
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
                        onPress={handleUpdateMeal}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Actualizar Comida</Text>}
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
    scrollContent: { padding: 16 },
    section: { marginBottom: 20 },
    sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
    resultsBox: { borderRadius: 12, marginTop: 4, maxHeight: 200, overflow: 'hidden', elevation: 3 },
    resultItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    resultName: { fontSize: 15 },
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
