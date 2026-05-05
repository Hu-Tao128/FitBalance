import React, { useEffect, useState } from 'react';
import { Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { Food } from '../services/food.service';

interface Props {
    food: Food;
    onAddFood: (food: Food, grams: number) => void;
}

export default function FoodItemCard({ food, onAddFood }: Props) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const [grams, setGrams] = useState(food.serving_weight_grams?.toFixed(0) || '100');

    const [calculatedNutrients, setCalculatedNutrients] = useState({
        calories: food.nf_calories || 0,
        protein: food.nf_protein || 0,
        carbs: food.nf_total_carbohydrate || 0,
        fat: food.nf_total_fat || 0,
    });

    useEffect(() => {
        const numericGrams = parseFloat(grams);
        if (isNaN(numericGrams) || numericGrams <= 0) {
            setCalculatedNutrients({ calories: 0, protein: 0, carbs: 0, fat: 0 });
            return;
        }

        const baseGrams = food.serving_weight_grams || 100;
        if (baseGrams === 0) return;

        const ratio = numericGrams / baseGrams;

        setCalculatedNutrients({
            calories: (food.nf_calories || 0) * ratio,
            protein: (food.nf_protein || 0) * ratio,
            carbs: (food.nf_total_carbohydrate || 0) * ratio,
            fat: (food.nf_total_fat || 0) * ratio,
        });
    }, [grams, food]);

    const handleAdd = () => {
        const numericGrams = parseInt(grams, 10);
        if (isNaN(numericGrams) || numericGrams <= 0) {
            alert(t('food.invalidAmountError'));
            return;
        }
        onAddFood(food, numericGrams);
        Keyboard.dismiss();
    };

    const styles = StyleSheet.create({
        card: { backgroundColor: colors.card, borderRadius: 16, marginBottom: 20, padding: 15, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, },
        image: { width: '70%', aspectRatio: 1, alignSelf: 'center', borderRadius: 12, marginBottom: 15, },
        foodName: { fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', },
        servingText: { fontSize: 14, color: colors.text, opacity: 0.7, textAlign: 'center', marginTop: 4, marginBottom: 15, },
        macrosRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, },
        macroItem: { alignItems: 'center', },
        macroValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary, },
        macroLabel: { fontSize: 13, color: colors.text, opacity: 0.8, marginTop: 4, },
        inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, },
        inputLabel: { fontSize: 16, color: colors.text, marginRight: 10, },
        input: { flex: 1, height: 50, color: colors.text, fontSize: 18, fontWeight: '500', textAlign: 'right', },
        gramsLabel: { fontSize: 16, color: colors.text, opacity: 0.7, marginLeft: 8, },
        addButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center', },
        addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, }
    });


    return (
        <View style={styles.card}>
            {food.photo?.thumb && <Image source={{ uri: food.photo.thumb }} style={styles.image} />}

            <Text style={styles.foodName}>{food.food_name}</Text>
            <Text style={styles.servingText}>{t('food.infoBasisFor')} {food.serving_weight_grams?.toFixed(0)}g</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('food.quantity')}:</Text>
                <TextInput
                    style={styles.input}
                    value={grams}
                    onChangeText={setGrams}
                    keyboardType="numeric"
                    selectTextOnFocus
                />
                <Text style={styles.gramsLabel}>g</Text>
            </View>

            <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{calculatedNutrients.calories.toFixed(0)}</Text>
                    <Text style={styles.macroLabel}>{t('food.kcal')}</Text>
                </View>
                <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{calculatedNutrients.protein.toFixed(1)}</Text>
                    <Text style={styles.macroLabel}>{t('food.prot')}</Text>
                </View>
                <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{calculatedNutrients.carbs.toFixed(1)}</Text>
                    <Text style={styles.macroLabel}>{t('food.carbs')}</Text>
                </View>
                <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{calculatedNutrients.fat.toFixed(1)}</Text>
                    <Text style={styles.macroLabel}>{t('food.fats')}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>{t('food.addToRegister')}</Text>
            </TouchableOpacity>
        </View>
    );
}
