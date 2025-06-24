import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function FoodSearchOptions({ navigation }: any) {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 24,
            color: colors.primary,
        },
        button: {
            backgroundColor: colors.primary,
            paddingVertical: 14,
            paddingHorizontal: 30,
            borderRadius: 10,
            marginBottom: 18,
            width: '100%',
        },
        buttonText: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
            textAlign: 'center',
        }
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>¿Cómo quieres buscar tu alimento?</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FoodScanner')}>
                <Text style={styles.buttonText}>Buscar por código de barras</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FoodClassicSearch')}>
                <Text style={styles.buttonText}>Buscar por nombre o descripción</Text>
            </TouchableOpacity>
        </View>
    );
}
