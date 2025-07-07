import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUser } from '../context/UserContext';

// ---------- TYPES ----------
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

// 👉  Ajusta IP o pasa a .env
const API_BASE = 'https://fitbalance-backend-production.up.railway.app';

// ---------- Utilidades ----------
function getObjectIdFromMongoDoc(id: any) {
    if (typeof id === 'object' && id?.$oid) return id.$oid;
    return String(id);
}
function isValidObjectId(id: any) {
    return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

// ---------- Componente ----------
export default function CreateMealScreen() {
    const { user } = useUser();

    // --- state ---
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

    // ---------- cargar alimentos ----------
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoadingFoods(true);
            try {
                const res = await axios.get(`${API_BASE}/api/food`);
                if (mounted) setFoods(res.data || []);
            } catch (err) {
                console.error('GET /api/food', err);
                Alert.alert('Error', 'No se pudieron cargar los alimentos.');
            } finally {
                if (mounted) setLoadingFoods(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // ---------- recalcular totales ----------
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

    // ---------- filtros ----------
    const filteredFoods =
        searchFood.trim().length < 2
            ? []
            : foods
                .filter(f => (f.name || '').toLowerCase().includes(searchFood.trim().toLowerCase()))
                .slice(0, 10);

    // ---------- acciones ----------
    const handleAddIngredient = () => {
        const grams = Number(amount);
        if (!selectedFood) return Alert.alert('Error', 'Selecciona un alimento válido');
        if (!grams || grams <= 0) return Alert.alert('Error', 'Ingresa una cantidad válida (>0 g)');

        const _id = getObjectIdFromMongoDoc(selectedFood._id);
        if (ingredients.some(i => i.food_id === _id))
            return Alert.alert('Error', 'Este alimento ya está agregado');

        setIngredients(prev => [...prev, { food_id: _id, food_data: selectedFood, amount_g: grams }]);
        setSelectedFood(null);
        setSearchFood('');
        setAmount('');
    };

    const handleRemoveIngredient = (i: number) =>
        Alert.alert('¿Eliminar?', '', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => setIngredients(arr => arr.filter((_, idx) => idx !== i)),
            },
        ]);

    const handleCreateMeal = async () => {
        if (!mealName.trim()) return Alert.alert('Error', 'Ponle un nombre a la comida');
        if (ingredients.length === 0) return Alert.alert('Error', 'Agrega al menos un ingrediente');

        const patientId = getObjectIdFromMongoDoc(user.id);
        if (!isValidObjectId(patientId)) return Alert.alert('Error', 'patient_id inválido');

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

            await axios.post(`${API_BASE}/PatientMeals`, mealData, {
                headers: { 'Content-Type': 'application/json' },
            });

            Alert.alert('¡Éxito!', 'Comida creada');
            setMealName('');
            setIngredients([]);
            setInstructions('');
        } catch (err: any) {
            console.error('POST /PatientMeals', err.response?.status, err.response?.data || err.message);
            Alert.alert('Error', err.response?.data?.error || 'No se pudo crear la comida');
        } finally {
            setLoading(false);
        }
    };

    // ---------- renders ----------
    const IngredientItem = ({ item, index }: { item: Ingredient; index: number }) => (
        <View style={styles.ingredientItem}>
            <View style={styles.ingredientNameBox}>
                <Text style={styles.ingredientName} numberOfLines={2} ellipsizeMode="tail">
                    {item.food_data.name}
                </Text>
            </View>
            <Text style={styles.ingredientAmount}>{item.amount_g} g</Text>
            <TouchableOpacity style={styles.removeBox} onPress={() => handleRemoveIngredient(index)}>
                <Text style={styles.remove}>×</Text>
            </TouchableOpacity>
        </View>
    );

    // ---------- JSX ----------
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    data={ingredients}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item, index }) => <IngredientItem item={item} index={index} />}
                    ListHeaderComponent={
                        <View>
                            <Text style={styles.title}>Crear Comida</Text>

                            <Text style={styles.label}>Nombre *</Text>
                            <TextInput
                                style={styles.input}
                                value={mealName}
                                onChangeText={setMealName}
                                placeholder="Ej. Ensalada César"
                            />

                            <Text style={styles.label}>Buscar alimento *</Text>
                            <TextInput
                                style={styles.input}
                                value={searchFood}
                                onChangeText={setSearchFood}
                                placeholder="Mín. 2 caracteres"
                            />

                            {loadingFoods && <ActivityIndicator style={{ marginVertical: 8 }} />}

                            {/* Lista de alimentos sugeridos, usando map y NO FlatList */}
                            {filteredFoods.length > 0 && !selectedFood && (
                                <View style={styles.list}>
                                    {filteredFoods.map(item => (
                                        <TouchableOpacity
                                            key={getObjectIdFromMongoDoc(item._id)}
                                            style={styles.foodItem}
                                            onPress={() => setSelectedFood(item)}
                                        >
                                            <Text style={styles.foodName}>{item.name}</Text>
                                            <Text style={styles.foodInfo}>
                                                {item.nutrients?.energy_kcal || 0} kcal · {item.portion_size_g || 100} g
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {selectedFood && (
                                <View style={styles.addBox}>
                                    <View style={styles.selectedFoodNameContainer}>
                                        <Text
                                            style={styles.bold}
                                            numberOfLines={2}
                                            ellipsizeMode="tail"
                                        >
                                            {selectedFood.name}
                                        </Text>
                                    </View>
                                    <TextInput
                                        style={styles.amount}
                                        value={amount}
                                        onChangeText={setAmount}
                                        placeholder="Gramos"
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity style={styles.greenBtn} onPress={handleAddIngredient}>
                                        <Text style={styles.whiteTxt}>Añadir</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {ingredients.length > 0 && (
                                <Text style={styles.label}>Ingredientes</Text>
                            )}
                        </View>
                    }
                    ListFooterComponent={
                        <>
                            {ingredients.length > 0 && (
                                <View style={styles.totals}>
                                    <Text style={styles.bold}>Totales: {totals.energy_kcal} kcal</Text>
                                    <Text>
                                        Prot {totals.protein_g} g · Carb {totals.carbohydrates_g} g · Grasa {totals.fat_g} g
                                    </Text>
                                </View>
                            )}

                            <Text style={styles.label}>Instrucciones (opcional)</Text>
                            <TextInput
                                style={[styles.input, { height: 90 }]}
                                value={instructions}
                                onChangeText={setInstructions}
                                placeholder="Paso a paso…"
                                multiline
                            />

                            <TouchableOpacity
                                style={[styles.greenBtn, loading && { opacity: 0.5 }]}
                                disabled={loading}
                                onPress={handleCreateMeal}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.whiteTxt}>Crear Comida</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    }
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={null}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ---------- Estilos ----------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEEFE0', // fondo general
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#000', // texto principal
        letterSpacing: 1,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 6,
        color: '#819A91', // color principal para labels
        fontSize: 16,
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#A7C1A8',
        marginBottom: 4,
        fontSize: 16,
        color: '#000',
    },
    list: {
        maxHeight: 180,
        marginVertical: 8,
        borderRadius: 12,
        backgroundColor: '#D1D8BE', // card
        borderWidth: 1,
        borderColor: '#A7C1A8',
        padding: 2,
    },
    foodItem: {
        padding: 13,
        borderBottomWidth: 1,
        borderColor: '#A7C1A8',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 3,
        marginHorizontal: 4,
    },
    foodName: {
        fontWeight: '600',
        color: '#000',
        fontSize: 16,
    },
    foodInfo: {
        fontSize: 12,
        color: '#819A91',
        marginTop: 2,
    },
    addBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        backgroundColor: '#D1D8BE', // card
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#A7C1A8',
    },
    selectedFoodNameContainer: {
        flex: 1,
        marginRight: 8,
        minWidth: 0,
    },
    amount: {
        width: 80, // ancho fijo para input de gramos
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#A7C1A8',
        fontSize: 16,
        color: '#000',
        marginRight: 8,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1D8BE', // card
        padding: 12,
        marginBottom: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#A7C1A8',
        minHeight: 44,
    },
    ingredientNameBox: {
        flex: 1,
        minWidth: 0,
        marginRight: 10,
    },
    ingredientName: {
        fontSize: 15,
        color: '#000',
        fontWeight: '500',
    },
    ingredientAmount: {
        fontSize: 15,
        color: '#819A91',
        fontWeight: '500',
        marginRight: 10,
    },
    removeBox: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    remove: {
        color: '#FA3E44',
        fontSize: 22,
        fontWeight: 'bold',
        opacity: 0.85,
    },
    totals: {
        backgroundColor: '#D1D8BE', // card
        padding: 14,
        borderRadius: 12,
        marginVertical: 14,
        borderWidth: 1,
        borderColor: '#A7C1A8',
        alignItems: 'center',
    },
    greenBtn: {
        backgroundColor: '#819A91', // primary
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 18,
    },
    whiteTxt: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
        letterSpacing: 0.5,
    },
    bold: {
        fontWeight: 'bold',
        color: '#000',
        fontSize: 16,
    },
});
