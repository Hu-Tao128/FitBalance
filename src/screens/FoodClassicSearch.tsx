import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AddFoodModal } from '../components/AddFoodModal';
import FoodDetails from '../components/FoodDetails';
import { API_CONFIG } from '../config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

// Interfaz para que TypeScript entienda la estructura del alimento
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
    photo?: {
        thumb?: string;
    };
}

// Nuevo sub-componente para mostrar la lista de resultados de forma limpia
const SearchResultsList = ({ foods, onSelect }: { foods: Food[], onSelect: (food: Food) => void }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors); // Reutilizamos la función de estilos
    return (
        <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Resultados de la Búsqueda</Text>
            {foods.slice(0, 5).map((food, index) => ( // Mostramos solo los primeros 5 resultados
                <TouchableOpacity key={index} style={styles.resultItem} onPress={() => onSelect(food)}>
                    {food.photo?.thumb && <Image source={{ uri: food.photo.thumb }} style={styles.resultImage} />}
                    <Text style={styles.resultText} numberOfLines={2}>{food.food_name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default function FoodClassicSearch({ navigation }: any) {
    const { colors } = useTheme();
    const { user } = useUser();
    const styles = createStyles(colors);

    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Food[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Nuevo estado para guardar el alimento que el usuario selecciona para ver en detalle
    const [viewingFood, setViewingFood] = useState<Food | null>(null);

    const [isModalVisible, setModalVisible] = useState(false);
    // Renombrado para evitar confusión con 'viewingFood'
    const [foodToAdd, setFoodToAdd] = useState<Food | null>(null);

    const searchByQuery = async () => {
        if (!query.trim()) {
            setError("Por favor, ingresa un alimento para buscar.");
            return;
        }
        setLoading(true);
        setError('');
        setSearchResults(null);
        setViewingFood(null); // Resetea la vista de detalles en cada nueva búsqueda

        try {
            const res = await axios.post<{ results: Food[] }>(`${API_CONFIG.BASE_URL}/search-food`, { query });
            if (res.data?.results && res.data.results.length > 0) {
                setSearchResults(res.data.results);
            } else {
                setError("No se encontraron resultados para tu búsqueda.");
            }
        } catch (err: any) {
            console.error("❌ ERROR when searching:", err.response?.data || err.message);
            setError("Hubo un error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la selección de un alimento de la lista
    const handleFoodSelection = (food: Food) => {
        setViewingFood(food);
    };

    const handleAddFoodPress = (originalFood: Food, adjustedGrams: number) => {
        const baseGrams = originalFood.serving_weight_grams || 100;
        if (baseGrams === 0) return;
        const ratio = adjustedGrams / baseGrams;

        const adjustedFood: Food = {
            ...originalFood,
            serving_weight_grams: adjustedGrams,
            serving_qty: 1,
            serving_unit: `${adjustedGrams}g`,
            nf_calories: (originalFood.nf_calories || 0) * ratio,
            nf_protein: (originalFood.nf_protein || 0) * ratio,
            nf_total_carbohydrate: (originalFood.nf_total_carbohydrate || 0) * ratio,
            nf_total_fat: (originalFood.nf_total_fat || 0) * ratio,
            nf_sugars: (originalFood.nf_sugars || 0) * ratio,
            nf_dietary_fiber: (originalFood.nf_dietary_fiber || 0) * ratio,
        };

        setFoodToAdd(adjustedFood);
        setModalVisible(true);
    };

    const handleSelectMeal = async (mealType: string, time: string) => {
        if (!foodToAdd || !user?.id) {
            Alert.alert("Error", "No se pudo seleccionar el alimento o no has iniciado sesión.");
            return;
        }
        setModalVisible(false);
        setLoading(true);

        try {
            const payload = {
                patient_id: user.id,
                type: mealType,
                time: time,
                food_data: foodToAdd,
            };
            await axios.post(`${API_CONFIG.BASE_URL}/dailymeallogs/add-food`, payload);
            Alert.alert("¡Éxito!", `${foodToAdd.food_name} fue añadido a tu registro.`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (err: any) {
            console.error("❌ ERROR al añadir:", err.response?.data || err.message);
            Alert.alert("Error", "No se pudo añadir el alimento a tu registro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <TextInput
                style={styles.input}
                placeholder="Ej: 1 manzana, 2 rebanadas de pan"
                placeholderTextColor={colors.textSecondary}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={searchByQuery}
            />
            <TouchableOpacity style={styles.button} onPress={searchByQuery} disabled={loading}>
                <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color={colors.primary} />}
            {error && !loading && <Text style={styles.error}>{error}</Text>}

            {/* Lógica de renderizado actualizada */}
            {searchResults && (
                viewingFood ? (
                    // Si hemos seleccionado un alimento, mostramos sus detalles
                    <>
                        <TouchableOpacity style={styles.backButton} onPress={() => setViewingFood(null)}>
                            <Text style={styles.backButtonText}>← Volver a los resultados</Text>
                        </TouchableOpacity>
                        <FoodDetails foods={[viewingFood]} onAddFood={handleAddFoodPress} />
                    </>
                ) : (
                    // Si no, mostramos la lista de resultados
                    <SearchResultsList foods={searchResults} onSelect={handleFoodSelection} />
                )
            )}

            <AddFoodModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSelectMeal={handleSelectMeal}
            />
        </ScrollView>
    );
}

// Mantenemos los estilos en una función para que usen el tema
const createStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    input: { borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 10, borderRadius: 10, fontSize: 16, color: colors.text, backgroundColor: colors.card },
    button: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, marginBottom: 20 },
    buttonText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
    error: { color: 'red', textAlign: 'center', marginVertical: 10, fontSize: 16 },
    // Estilos nuevos para la lista de resultados
    resultsContainer: { marginTop: 10 },
    resultsTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10, paddingLeft: 4 },
    resultItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
    resultImage: { width: 40, height: 40, borderRadius: 8, marginRight: 12 },
    resultText: { fontSize: 16, color: colors.text, flex: 1 },
    backButton: { marginBottom: 15, alignSelf: 'flex-start' },
    backButtonText: { color: colors.primary, fontSize: 16, fontWeight: '500' },
});