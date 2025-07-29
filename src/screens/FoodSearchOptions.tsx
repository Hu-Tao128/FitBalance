// FoodSearchOptions.tsx
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const iconConfig = [
    {
        name: 'barcode-scan',
        lib: MaterialCommunityIcons,
        label: 'Buscar con código de barras',
        sub: 'Escanea el empaque del alimento',
        color: '#7CB342',
        bg: '#ECF9E4',
        screen: 'FoodScanner',
        size: 38,
    },
    {
        name: 'search',
        lib: MaterialIcons,
        label: 'Buscar por nombre o descripción',
        sub: 'Encuentra alimentos con texto',
        color: '#1976D2',
        bg: '#E7F0FB',
        screen: 'FoodClassicSearch',
        size: 38,
    },
    {
        name: 'utensils',
        lib: FontAwesome5,
        label: 'Crear tu propio platillo',
        sub: 'Arma recetas y guarda combinaciones',
        color: '#FA3E44',   // Guinda
        bg: '#FDE5E7',      // Fondo suave rosado
        screen: 'optionsFood', // <--- ¡CAMBIA ESTA LÍNEA!
        size: 33,
    },
];

export default function FoodSearchOptions({ navigation }: any) {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 18,
            paddingTop: 40,
            paddingBottom: 30,
        },
        title: {
            fontSize: 23,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 35,
            letterSpacing: 0.2,
            textAlign: 'center',
            opacity: 0.96,
        },
        cards: {
            width: '100%',
            gap: 22,
        },
        cardShadow: {
            width: '100%',
            borderRadius: 22,
            marginBottom: 6,
            paddingVertical: 22,
            paddingHorizontal: 16,
            shadowColor: '#B6D0B533',
            shadowOpacity: 0.20,
            shadowOffset: { width: 0, height: 7 },
            shadowRadius: 16,
            elevation: 7,
            ...Platform.select({
                android: {
                    borderWidth: 1,
                    borderColor: '#F3F6ED',
                },
            }),
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconCircle: {
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 15,
            backgroundColor: '#fff',
            shadowColor: '#8ec47e44',
            shadowOpacity: 0.18,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
        },
        textContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        cardLabel: {
            fontSize: 17.5,
            fontWeight: 'bold',
            letterSpacing: 0.3,
            marginBottom: 4,
        },
        cardSub: {
            fontSize: 14,
            color: '#444',
            opacity: 0.80,
            flexWrap: 'wrap',
        },
    });
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={styles.title}>¿Cómo quieres buscar o crear alimentos?</Text>
            <View style={styles.cards}>
                {iconConfig.map((btn, idx) => {
                    const IconLib = btn.lib;
                    return (
                        <TouchableOpacity
                            key={btn.label}
                            style={[styles.cardShadow, { backgroundColor: btn.bg }]}
                            activeOpacity={0.88}
                            onPress={() => navigation.navigate(btn.screen)}
                        >
                            <View style={styles.row}>
                                <View style={[styles.iconCircle, { backgroundColor: btn.bg }]}>
                                    <IconLib name={btn.name} size={btn.size} color={btn.color} />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.cardLabel, { color: btn.color }]}>{btn.label}</Text>
                                    <Text style={styles.cardSub}>{btn.sub}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}