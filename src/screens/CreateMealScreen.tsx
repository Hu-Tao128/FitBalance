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
import { useUser } from '../context/UserContext';

// 👉  Ajusta IP o pasa a .env
const API_BASE = 'http://192.168.1.74:3000';

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
    const [foods, setFoods] = useState<any[]>([]);
    const [searchFood, setSearchFood] = useState('');
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [selectedFood, setSelectedFood] = useState<any | null>(null);
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
                const f = ing.amount_g / ing.food_data.portion_size_g;
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
    const FoodItem = ({ item }: any) => (
        <TouchableOpacity style={styles.foodItem} onPress={() => setSelectedFood(item)}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodInfo}>
                {item.nutrients?.energy_kcal || 0} kcal · {item.portion_size_g || 100} g
            </Text>
        </TouchableOpacity>
    );

    const IngredientItem = ({ item, index }: any) => (
        <View style={styles.ingredientItem}>
            <Text>{item.food_data.name}</Text>
            <Text>{item.amount_g} g</Text>
            <TouchableOpacity onPress={() => handleRemoveIngredient(index)}>
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
                <ScrollView contentContainerStyle={{ padding: 20 }}>
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

                    {filteredFoods.length > 0 && !selectedFood && (
                        <FlatList
                            data={filteredFoods}
                            keyExtractor={item => getObjectIdFromMongoDoc(item._id)}
                            renderItem={FoodItem}
                            style={styles.list}
                            nestedScrollEnabled
                        />
                    )}

                    {selectedFood && (
                        <View style={styles.addBox}>
                            <Text style={styles.bold}>{selectedFood.name}</Text>
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
                        <>
                            <Text style={styles.label}>Ingredientes</Text>
                            <FlatList
                                data={ingredients}
                                keyExtractor={(_, i) => i.toString()}
                                renderItem={IngredientItem}
                                style={styles.list}
                                nestedScrollEnabled
                            />
                        </>
                    )}

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
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ---------- Estilos ----------
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontWeight: 'bold', marginTop: 18, marginBottom: 6 },
    input: { backgroundColor: '#fff', borderRadius: 8, padding: 12 },
    list: { maxHeight: 200, marginVertical: 8 },
    foodItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
    foodName: { fontWeight: '500' },
    foodInfo: { fontSize: 12, color: '#777' },
    addBox: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    amount: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 8,
    },
    ingredientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 4,
        borderRadius: 8,
    },
    remove: { color: '#f33', fontSize: 18, paddingHorizontal: 8 },
    totals: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginVertical: 12 },
    greenBtn: { backgroundColor: '#43a047', borderRadius: 8, padding: 14, alignItems: 'center' },
    whiteTxt: { color: '#fff', fontWeight: 'bold' },
    bold: { fontWeight: 'bold' },
});
