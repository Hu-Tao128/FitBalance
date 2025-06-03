import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

const SERVER_URL = 'https://fitbalance-424w.onrender.com';

export default function NutritionixTest() {
    const [upc, setUpc] = useState('');
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchByUPC = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${SERVER_URL}/api/nutritionix/upc?upc=${upc}`);
            setResult(res.data);
        } catch (err) {
            setError('❌ Error al buscar por UPC');
        } finally {
            setLoading(false);
        }
    };

    const searchByQuery = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${SERVER_URL}/api/nutritionix/natural`, { query });
            setResult(res.data);
        } catch (err) {
            setError('❌ Error al buscar por texto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>🔬 Nutritionix API Test</Text>

            <TextInput
                style={styles.input}
                placeholder="🔍 Código UPC"
                value={upc}
                onChangeText={setUpc}
                keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={searchByUPC}>
                <Text style={styles.buttonText}>Buscar por UPC</Text>
            </TouchableOpacity>

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

            {result && (
                <View style={styles.resultBox}>
                    <Text style={styles.resultText}>{JSON.stringify(result, null, 2)}</Text>
                </View>
            )}
        </ScrollView>
    );
}

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
    resultBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },
    resultText: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    }
});
