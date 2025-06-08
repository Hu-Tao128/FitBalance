import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, ActivityIndicator, Image, Modal
} from 'react-native';
import axios from 'axios';
import BarCodeScanner from '../components/BardCodeScanner'; // Corregido el nombre

const SERVER_URL = 'http://192.168.0.24:3000';

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
            const res = await axios.post(`${SERVER_URL}/api/nutritionix/natural`, { query });
            setResult(res.data);
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
            const res = await axios.get(`${SERVER_URL}/api/nutritionix/upc`, {
                params: { upc },
            });
            setResult(res.data);
        } catch (err) {
            // Manejo seguro del error
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 404) {
                    setError('🔍 Producto no encontrado');
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
        console.log('Código escaneado:', data); // Verifica el valor
        setScanned(true);
        searchByBarcode(data);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>🔬 Nutritionix API Test</Text>

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

            {result?.foods && result.foods.map((food: any, index: number) => (
                <View key={index} style={styles.foodCard}>
                    <Text style={styles.foodName}>{food.food_name}</Text>
                    <Text style={styles.serving}>{food.serving_qty} {food.serving_unit}</Text>
                    <Image
                        source={{ uri: food.photo?.thumb }}
                        style={styles.foodImage}
                    />
                    <View style={styles.nutritionList}>
                        <Text>Calorías: {food.nf_calories} kcal</Text>
                        <Text>Grasa total: {food.nf_total_fat} g</Text>
                        <Text>Grasa saturada: {food.nf_saturated_fat} g</Text>
                        <Text>Colesterol: {food.nf_cholesterol} mg</Text>
                        <Text>Sodio: {food.nf_sodium} mg</Text>
                        <Text>Carbohidratos: {food.nf_total_carbohydrate} g</Text>
                        <Text>Fibra: {food.nf_dietary_fiber} g</Text>
                        <Text>Azúcares: {food.nf_sugars} g</Text>
                        <Text>Proteínas: {food.nf_protein} g</Text>
                        <Text>Potasio: {food.nf_potassium} mg</Text>
                    </View>
                </View>
            ))}
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
