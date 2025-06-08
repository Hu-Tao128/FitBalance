import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator, Image, Modal,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
<<<<<<< Updated upstream
import axios from 'axios';
import BarCodeScanner from '../components/BardCodeScanner';
=======
import BarCodeScanner from '../components/BardCodeScanner'; // Corregido el nombre
>>>>>>> Stashed changes

const SERVER_URL = 'http://192.168.1.74:3000';

export default function NutritionixTest() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scanned, setScanned] = useState(false);

    const searchByQuery = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${SERVER_URL}/api/food/search`, { query });

            // Manejar respuesta unificada
            if (res.data.source === 'nutritionix') {
                setResult(res.data.data);
            } else if (res.data.source === 'fatsecret') {
                // Adaptar la respuesta de FatSecret al formato esperado
                const fatsecretFood = res.data.data.food;
                setResult({
                    foods: [{
                        food_name: fatsecretFood.food_name,
                        serving_qty: 1,
                        serving_unit: 'serving',
                        nf_calories: fatsecretFood.calories,
                        nf_total_fat: fatsecretFood.fat,
                        nf_saturated_fat: fatsecretFood.saturated_fat,
                        nf_cholesterol: fatsecretFood.cholesterol,
                        nf_sodium: fatsecretFood.sodium,
                        nf_total_carbohydrate: fatsecretFood.carbohydrate,
                        nf_dietary_fiber: fatsecretFood.fiber,
                        nf_sugars: fatsecretFood.sugar,
                        nf_protein: fatsecretFood.protein,
                        nf_potassium: fatsecretFood.potassium,
                        photo: {
                            thumb: fatsecretFood.food_images?.[0] || 'https://via.placeholder.com/150'
                        }
                    }]
                });
            }
        } catch (err) {
            setError('Error al buscar por texto');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const searchByBarcode = async (upc: string) => {
        setShowScanner(false);
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${SERVER_URL}/api/food/upc`, {
                params: { upc },
            });

            // Manejar respuesta unificada
            if (res.data.source === 'nutritionix') {
                setResult(res.data.data);
            } else if (res.data.source === 'fatsecret') {
                // Adaptar la respuesta de FatSecret al formato esperado
                const fatsecretFood = res.data.data.food;
                setResult({
                    foods: [{
                        food_name: fatsecretFood.food_name,
                        serving_qty: 1,
                        serving_unit: 'serving',
                        nf_calories: fatsecretFood.calories,
                        nf_total_fat: fatsecretFood.fat,
                        nf_saturated_fat: fatsecretFood.saturated_fat,
                        nf_cholesterol: fatsecretFood.cholesterol,
                        nf_sodium: fatsecretFood.sodium,
                        nf_total_carbohydrate: fatsecretFood.carbohydrate,
                        nf_dietary_fiber: fatsecretFood.fiber,
                        nf_sugars: fatsecretFood.sugar,
                        nf_protein: fatsecretFood.protein,
                        nf_potassium: fatsecretFood.potassium,
                        photo: {
                            thumb: fatsecretFood.food_images?.[0] || 'https://via.placeholder.com/150'
                        }
                    }]
                });
            }
        } catch (err) {
            // Manejo seguro del error
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 404) {
                    setError('🔍 Producto no encontrado en ninguna base de datos');
                } else {
                    setError(`Error: ${err.response?.data?.error || err.message}`);
                }
            } else if (err instanceof Error) {
                setError(`Error: ${err.message}`);
            } else {
                setError("Error desconocido");
            }
        } finally {
            setLoading(false);
            setScanned(false);
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        console.log('Código escaneado:', data);
        setScanned(true);
        searchByBarcode(data);
    };

    const renderFoodCards = () => {
        if (!result?.foods) return null;

        return result.foods.map((food: any, index: number) => (
            <View key={index} style={styles.foodCard}>
                <Text style={styles.foodName}>{food.food_name}</Text>
                <Text style={styles.serving}>{food.serving_qty} {food.serving_unit}</Text>
                {food.photo?.thumb && (
                    <Image
                        source={{ uri: food.photo.thumb }}
                        style={styles.foodImage}
                    />
                )}
                <View style={styles.nutritionList}>
                    <Text>Calorías: {food.nf_calories || food.calories} kcal</Text>
                    <Text>Grasa total: {food.nf_total_fat || food.fat} g</Text>
                    {food.nf_saturated_fat !== undefined && (
                        <Text>Grasa saturada: {food.nf_saturated_fat} g</Text>
                    )}
                    {food.nf_cholesterol !== undefined && (
                        <Text>Colesterol: {food.nf_cholesterol} mg</Text>
                    )}
                    {food.nf_sodium !== undefined && (
                        <Text>Sodio: {food.nf_sodium} mg</Text>
                    )}
                    <Text>Carbohidratos: {food.nf_total_carbohydrate || food.carbohydrate} g</Text>
                    {food.nf_dietary_fiber !== undefined && (
                        <Text>Fibra: {food.nf_dietary_fiber} g</Text>
                    )}
                    {food.nf_sugars !== undefined && (
                        <Text>Azúcares: {food.nf_sugars} g</Text>
                    )}
                    <Text>Proteínas: {food.nf_protein || food.protein} g</Text>
                    {food.nf_potassium !== undefined && (
                        <Text>Potasio: {food.nf_potassium} mg</Text>
                    )}
                </View>
            </View>
        ));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>🔬 Buscador de Alimentos</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setShowScanner(true)}
            >
                <Text style={styles.buttonText}>Buscar por código de barras</Text>
            </TouchableOpacity>

            <Modal
                visible={showScanner}
                animationType="slide"
                onRequestClose={() => setShowScanner(false)}
            >
                <View style={styles.scannerContainer}>
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowScanner(false)}
                    >
                        <Text style={styles.closeButtonText}>Cerrar Escáner</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <TextInput
                style={styles.input}
                placeholder="🍎 Ej: 1 manzana, 2 rebanadas de pan"
                value={query}
                onChangeText={setQuery}
            />
            <TouchableOpacity style={styles.button} onPress={searchByQuery}>
                <Text style={styles.buttonText}>Buscar por Descripción</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#188827" style={{ marginTop: 20 }} />}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {renderFoodCards()}
        </ScrollView>
    );
}

// Los estilos permanecen igual
const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#188827',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#188827',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    foodCard: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#e7f7ea',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#188827',
        marginBottom: 5,
        textTransform: 'capitalize'
    },
    serving: {
        fontSize: 14,
        marginBottom: 10,
    },
    foodImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 10,
    },
    nutritionList: {
        gap: 2,
    },
    scannerContainer: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: '#188827',
        padding: 15,
        borderRadius: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});