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

import { API_CONFIG } from '../config';

// ---------- TIPOS (Comunes para Create y Edit, podrías moverlos a un archivo types/index.ts) ----------
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

// ---------- UTILIDADES (Comunes para Create y Edit) ----------
function getObjectIdFromMongoDoc(id: any) {
    if (typeof id === 'object' && id?.$oid) return id.$oid;
    return String(id);
}
function isValidObjectId(id: any) {
    return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

// ---------- COMPONENTE CreateMealScreen ----------
export default function CreateMealScreen() {
    const { user } = useUser();

    // --- ESTADO LOCAL ---
    const [foods, setFoods] = useState<Food[]>([]); // Alimentos disponibles para buscar
    const [searchFood, setSearchFood] = useState(''); // Texto de búsqueda de alimentos
    const [ingredients, setIngredients] = useState<Ingredient[]>([]); // Ingredientes de la comida actual
    const [selectedFood, setSelectedFood] = useState<Food | null>(null); // Alimento seleccionado para añadir
    const [amount, setAmount] = useState(''); // Cantidad en gramos del alimento seleccionado
    const [mealName, setMealName] = useState(''); // Nombre de la comida
    const [instructions, setInstructions] = useState(''); // Instrucciones de la comida
    const [loading, setLoading] = useState(false); // Estado de carga al guardar la comida
    const [loadingFoods, setLoadingFoods] = useState(false); // Estado de carga al buscar alimentos
    const [totals, setTotals] = useState({ // Totales nutricionales de la comida
        energy_kcal: 0,
        protein_g: 0,
        carbohydrates_g: 0,
        fat_g: 0,
        fiber_g: 0,
        sugar_g: 0,
    });

    // --- EFECTO: CARGAR ALIMENTOS AL INICIAR ---
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
        return () => {
            mounted = false;
        };
    }, []);

    // --- EFECTO: RECALCULAR TOTALES CUANDO CAMBIAN LOS INGREDIENTES ---
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

    // --- LÓGICA DE FILTRADO DE ALIMENTOS ---
    const filteredFoods =
        searchFood.trim().length < 2
            ? []
            : foods
                .filter(f => (f.name || '').toLowerCase().includes(searchFood.trim().toLowerCase()))
                .slice(0, 10);

    // --- MANEJADORES DE EVENTOS ---
    const handleAddIngredient = () => {
        const grams = Number(amount);
        if (!selectedFood) return Alert.alert('Error', 'Selecciona un alimento válido.');
        if (!grams || grams <= 0) return Alert.alert('Error', 'Ingresa una cantidad válida (>0 g).');

        const _id = getObjectIdFromMongoDoc(selectedFood._id);
        if (ingredients.some(i => i.food_id === _id))
            return Alert.alert('Error', 'Este alimento ya está agregado a la lista.');

        setIngredients(prev => [...prev, { food_id: _id, food_data: selectedFood, amount_g: grams }]);
        setSelectedFood(null); // Limpiar selección
        setSearchFood(''); // Limpiar búsqueda
        setAmount(''); // Limpiar cantidad
    };

    const handleRemoveIngredient = (indexToRemove: number) =>
        Alert.alert('Eliminar Ingrediente', '¿Estás seguro de que quieres eliminar este ingrediente?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => setIngredients(arr => arr.filter((_, idx) => idx !== indexToRemove)),
            },
        ]);

    const handleCreateNewMeal = async () => {
        if (!mealName.trim()) return Alert.alert('Error', 'Debes ponerle un nombre a la comida.');
        if (ingredients.length === 0) return Alert.alert('Error', 'Agrega al menos un ingrediente para crear la comida.');

        const patientId = getObjectIdFromMongoDoc(user.id);
        if (!isValidObjectId(patientId)) {
            console.error('ID de paciente no válido:', patientId);
            return Alert.alert('Error', 'No se pudo obtener la información de tu usuario. Intenta reiniciar la app.');
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

            // ✅ Siempre POST para crear una nueva comida
            await axios.post(`${API_CONFIG.BASE_URL}/PatientMeals`, mealData, {
                headers: { 'Content-Type': 'application/json' },
            });

            Alert.alert('¡Éxito!', 'Comida creada correctamente.');
            // Limpiar el formulario después de crear
            setMealName('');
            setIngredients([]);
            setInstructions('');
            setSelectedFood(null);
            setSearchFood('');
            setAmount('');
        } catch (err: any) {
            console.error('ERROR al crear comida:', err.response?.status, err.response?.data || err.message);
            Alert.alert('Error', err.response?.data?.error || 'No se pudo crear la comida. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERIZADO DE UN ELEMENTO DE INGREDIENTE ---
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

    // ---------- JSX (Interfaz de Usuario) ----------
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
                        <View style={styles.contentPadding}>
                            <Text style={styles.title}>Crear Comida Personalizada</Text>

                            <Text style={styles.label}>Nombre de la comida *</Text>
                            <TextInput
                                style={styles.input}
                                value={mealName}
                                onChangeText={setMealName}
                                placeholder="Ej. Ensalada Fresca de Pollo"
                                placeholderTextColor="#999"
                            />

                            <Text style={styles.label}>Buscar y añadir ingredientes *</Text>
                            <TextInput
                                style={styles.input}
                                value={searchFood}
                                onChangeText={setSearchFood}
                                placeholder="Mín. 2 caracteres para buscar..."
                                placeholderTextColor="#999"
                            />

                            {loadingFoods && <ActivityIndicator style={styles.activityIndicator} size="small" color="#67AE6E" />}

                            {/* Lista de alimentos sugeridos */}
                            {searchFood.trim().length >= 2 && filteredFoods.length > 0 && !selectedFood && (
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
                            {searchFood.trim().length >= 2 && filteredFoods.length === 0 && !loadingFoods && !selectedFood && (
                                <Text style={styles.noResultsText}>No se encontraron alimentos.</Text>
                            )}

                            {/* Sección para añadir cantidad del alimento seleccionado */}
                            {selectedFood && (
                                <View style={styles.addBox}>
                                    <View style={styles.selectedFoodNameContainer}>
                                        <Text style={styles.boldText} numberOfLines={2} ellipsizeMode="tail">
                                            {selectedFood.name}
                                        </Text>
                                    </View>
                                    <TextInput
                                        style={styles.amountInput}
                                        value={amount}
                                        onChangeText={setAmount}
                                        placeholder="Gramos"
                                        keyboardType="numeric"
                                        placeholderTextColor="#999"
                                    />
                                    <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
                                        <Text style={styles.addButtonText}>Añadir</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {ingredients.length > 0 && (
                                <Text style={styles.label}>Ingredientes añadidos</Text>
                            )}
                        </View>
                    }
                    ListFooterComponent={
                        <View style={styles.contentPadding}>
                            {ingredients.length > 0 && (
                                <View style={styles.totalsBox}>
                                    <Text style={styles.boldText}>Totales: {totals.energy_kcal} kcal</Text>
                                    <Text style={styles.totalsText}>
                                        Prot {totals.protein_g}g · Carb {totals.carbohydrates_g}g · Grasa {totals.fat_g}g
                                    </Text>
                                </View>
                            )}

                            <Text style={styles.label}>Instrucciones (opcional)</Text>
                            <TextInput
                                style={[styles.input, styles.instructionsInput]}
                                value={instructions}
                                onChangeText={setInstructions}
                                placeholder="Describe los pasos para preparar la comida..."
                                multiline
                                placeholderTextColor="#999"
                            />

                            <TouchableOpacity
                                style={[styles.mainButton, loading && { opacity: 0.6 }]}
                                disabled={loading}
                                onPress={handleCreateNewMeal}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.mainButtonText}>Crear Comida</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    }
                    contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ---------- ESTILOS (Usa colores fijos o tus `colors` del tema si quieres que cambien con el tema) ----------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F5', // Color de fondo claro por defecto
    },
    contentPadding: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 25,
        marginTop: 10,
        textAlign: 'center',
        color: '#333',
    },
    label: {
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
        color: '#555',
        fontSize: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
        color: '#333',
    },
    activityIndicator: {
        marginVertical: 10,
    },
    list: {
        maxHeight: 200,
        marginVertical: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden', // Para asegurar que el borderRadius se aplique
    },
    foodItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
    },
    foodName: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: 15,
    },
    foodInfo: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 14,
        color: '#888',
    },
    addBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F3FF', // Fondo claro para la caja de añadir
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#B3D9FF',
        marginTop: 15,
        marginBottom: 10,
    },
    selectedFoodNameContainer: {
        flex: 1,
        marginRight: 10,
    },
    amountInput: {
        width: 80,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#D0D0D0',
        fontSize: 15,
        color: '#333',
        textAlign: 'center',
        marginRight: 10,
    },
    addButton: {
        backgroundColor: '#007AFF', // Azul para el botón Añadir
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff', // Fondo blanco para cada ingrediente
        padding: 15,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginHorizontal: 20, // Ajuste para el padding del FlatList
    },
    ingredientNameBox: {
        flex: 1,
        marginRight: 10,
    },
    ingredientName: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    ingredientAmount: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
        marginRight: 10,
    },
    removeBox: {
        padding: 5,
        backgroundColor: '#FFEBEE', // Rojo muy claro
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    remove: {
        color: '#FF3B30', // Rojo vibrante
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalsBox: {
        backgroundColor: '#EAF7EB',
        padding: 18,
        borderRadius: 12,
        marginVertical: 20,
        borderWidth: 1,
        borderColor: '#C8E6C9',
        alignItems: 'center',
    },
    totalsText: {
        fontSize: 15,
        color: '#555',
        marginTop: 5,
    },
    instructionsInput: {
        height: 100, // Altura predeterminada para el campo de instrucciones
        textAlignVertical: 'top', // Alinea el texto al inicio en Android
    },
    mainButton: {
        backgroundColor: '#34C759', // Verde principal para el botón grande
        borderRadius: 10,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 25,
        marginBottom: 30,
    },
    mainButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: 16,
    },
});