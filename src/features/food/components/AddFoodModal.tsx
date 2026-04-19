import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Food } from '../services/food.service';

const MEAL_TYPES = [
    { key: 'breakfast', time: '09:00' },
    { key: 'lunch', time: '14:00' },
    { key: 'dinner', time: '20:00' },
    { key: 'snack', time: '17:00' }
];

interface AddFoodModalProps {
    visible: boolean;
    food: Food | null;
    onClose: () => void;
    onSelectMeal: (type: string, time: string) => void;
}

export const AddFoodModal = ({ visible, food, onClose, onSelectMeal }: AddFoodModalProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
        modalContent: { width: '85%', borderRadius: 20, padding: 24, backgroundColor: colors.card, maxHeight: '80%' },
        title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: colors.text, textAlign: 'center' },
        subtitle: { fontSize: 16, color: colors.outline, marginBottom: 20, textAlign: 'center' },
        statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
        statItem: { alignItems: 'center' },
        statValue: { fontSize: 16, fontWeight: 'bold', color: colors.text },
        statLabel: { fontSize: 12, color: colors.outline },
        button: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, width: '100%', marginBottom: 10 },
        buttonText: { textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 16 },
        cancelButton: { marginTop: 10, paddingVertical: 10 },
        cancelText: { color: colors.primary, fontSize: 16, textAlign: 'center', fontWeight: '600' }
    });

    if (!food) return null;

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>{t('food.addToMealsTitle')}</Text>
                    <Text style={styles.subtitle}>{food.food_name}</Text>
                    
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{food.nf_calories?.toFixed(0)}</Text>
                            <Text style={styles.statLabel}>kcal</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{food.nf_protein?.toFixed(1)}g</Text>
                            <Text style={styles.statLabel}>Prot</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{food.nf_total_carbohydrate?.toFixed(1)}g</Text>
                            <Text style={styles.statLabel}>Carbs</Text>
                        </View>
                    </View>

                    <Text style={[styles.statLabel, { marginBottom: 12, fontWeight: 'bold' }]}>{t('food.selectMealMoment')}</Text>
                    
                    <ScrollView bounces={false}>
                        {MEAL_TYPES.map(meal => (
                            <TouchableOpacity
                                key={meal.key}
                                style={styles.button}
                                onPress={() => onSelectMeal(meal.key, meal.time)}
                            >
                                <Text style={styles.buttonText}>{t(`food.meals.${meal.key}` as any)}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
