// src/components/FoodItemCard.tsx

import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Interfaz para definir la estructura de un alimento
interface Food {
    food_name: string;
    serving_qty: number;
    serving_unit: string;
    serving_weight_grams?: number;
    nf_calories?: number;
    nf_protein?: number;
    nf_total_carbohydrate?: number;
    nf_total_fat?: number;
    photo?: {
        thumb?: string;
    };
}

interface Props {
    food: Food;
    onAddFood: (food: Food, grams: number) => void;
}

export default function FoodItemCard({ food, onAddFood }: Props) {
    const { colors } = useTheme();
    const [grams, setGrams] = useState(food.serving_weight_grams?.toFixed(0) || '100');

    const handleAdd = () => {
        const numericGrams = parseInt(grams, 10);
        if (isNaN(numericGrams) || numericGrams <= 0) {
            alert('Por favor, ingresa un número válido de gramos.');
            return;
        }
        onAddFood(food, numericGrams);
    };

    const styles = StyleSheet.create({
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            marginBottom: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
        },
        image: {
            width: '70%',
            aspectRatio: 1, // 1/1 para una proporción cuadrada
            alignSelf: 'center', // Esta línea centra la imagen
            borderRadius: 12, // Redondear las esquinas de la imagen
            marginBottom: 15, // Añade un espacio debajo de la imagen
        },
        contentContainer: {
            padding: 15,
        },
        foodName: {
            fontSize: 22,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
        },
        servingText: {
            fontSize: 14,
            color: colors.text,
            opacity: 0.7,
            textAlign: 'center',
            marginTop: 4,
            marginBottom: 15,
        },
        macrosRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 20,
        },
        macroItem: {
            alignItems: 'center',
        },
        macroValue: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary,
        },
        macroLabel: {
            fontSize: 13,
            color: colors.text,
            opacity: 0.8,
            marginTop: 4,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingHorizontal: 15,
            marginBottom: 15,
        },
        inputLabel: {
            fontSize: 16,
            color: colors.text,
            marginRight: 10,
        },
        input: {
            flex: 1,
            height: 50,
            color: colors.text,
            fontSize: 18,
            fontWeight: '500',
            textAlign: 'right',
        },
        gramsLabel: {
            fontSize: 16,
            color: colors.text,
            opacity: 0.7,
            marginLeft: 8,
        },
        addButton: {
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
        },
        addButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
        }
    });

    return (
        <View style={styles.card}>
            {food.photo?.thumb && (
                <Image
                    source={{ uri: food.photo.thumb }}
                    style={styles.image}
                />
            )}

            <View style={styles.contentContainer}>
                <Text style={styles.foodName}>{food.food_name}</Text>
                <Text style={styles.servingText}>
                    Info. nutricional por {food.serving_weight_grams?.toFixed(0)}g
                </Text>

                <View style={styles.macrosRow}>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{food.nf_calories?.toFixed(0)}</Text>
                        <Text style={styles.macroLabel}>Kcal</Text>
                    </View>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{food.nf_protein?.toFixed(1)}</Text>
                        <Text style={styles.macroLabel}>Proteína</Text>
                    </View>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{food.nf_total_carbohydrate?.toFixed(1)}</Text>
                        <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{food.nf_total_fat?.toFixed(1)}</Text>
                        <Text style={styles.macroLabel}>Grasa</Text>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Cantidad:</Text>
                    <TextInput
                        style={styles.input}
                        value={grams}
                        onChangeText={setGrams}
                        keyboardType="numeric"
                        selectTextOnFocus
                    />
                    <Text style={styles.gramsLabel}>g</Text>
                </View>

                <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Text style={styles.addButtonText}>Añadir al Registro</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}