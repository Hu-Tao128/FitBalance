import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Modal, ScrollView, StyleSheet, Text,
    TouchableOpacity, View, ActivityIndicator, Alert
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { mealService } from '../services/meal.service';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type RawMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealLabels: Record<RawMealType, MealType> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack'
};

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    scroll: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    mealSection: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    mealTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#444',
    },
    foodItemTouchable: {
        paddingVertical: 8,
    },
    foodItemText: {
        fontSize: 16,
        color: 'rgba(0,0,0,0.5)',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        backgroundColor: colors.card,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 20,
        textAlign: 'center'
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 10,
    },
    optionText: {
        color: colors.text,
        fontSize: 16,
    },
    closeText: {
        color: colors.primary,
        marginTop: 20,
        textAlign: 'center',
    },
});

export default function WeighFoodScreen() {
    const { user } = useUser();
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    
    const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<any>(null);

    const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: 'America/Tijuana'
    }).format(new Date()).toLowerCase();

    const fetchWeeklyPlan = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            setLoading(true);
            const data = await mealService.getWeeklyPlan(String(user.id));
            
            if (!data?.meals || data.meals.length === 0) {
                setError('No meals planned for today');
                setWeeklyPlan(null);
            } else {
                setWeeklyPlan(data);
            }
        } catch (err) {
            console.error('Error loading plan:', err);
            setError('Could not load meal plan.');
            setWeeklyPlan(null);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchWeeklyPlan();
        }, [fetchWeeklyPlan])
    );

    const handleAddWeeklyMeal = async () => {
        if (!user?.id || !selectedMeal) return;

        try {
            await mealService.addWeeklyMeal({
                patient_id: String(user.id),
                meal: selectedMeal,
            });

            Alert.alert('Success!', 'Meal added to your daily log');
            setModalVisible(false);
        } catch (err: any) {
            console.error('Error adding meal:', err);
            if (err.response && err.response.status === 400) {
                Alert.alert('Notice', err.response?.data?.error || 'This meal is already logged');
            } else {
                Alert.alert('Error', 'Could not add meal.');
            }
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const todayMeals = weeklyPlan?.meals.filter((meal: any) => meal.day === today) ?? [];

    if (!weeklyPlan || todayMeals.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <View style={[styles.mealSection, { backgroundColor: colors.card, alignItems: 'center', paddingVertical: 30, width: '100%' }]}>
                    <Ionicons name="calendar-outline" size={40} color={colors.text} style={{ marginBottom: 15 }} />
                    <Text style={[styles.mealTitle, { textAlign: 'center' }]}>No meal plans for today</Text>
                    <Text style={{ color: colors.text, textAlign: 'center', marginTop: 10 }}>Contact your nutritionist to get your meal plan</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll}>
                {todayMeals.map((meal: any, index: number) => {
                    const label = mealLabels[meal.type as RawMealType] || meal.type;
                    const color =
                        meal.type === 'breakfast' ? '#FFEB99' :
                        meal.type === 'lunch' ? '#C3FBD8' :
                        meal.type === 'dinner' ? '#D6C7FB' : '#FFD6E7';

                    return (
                        <View key={`meal-${index}`} style={[styles.mealSection, { backgroundColor: color }]}>
                            <Text style={styles.mealTitle}>{label}</Text>
                            {meal.foods.map((item: any, idx: number) => (
                                <TouchableOpacity
                                    key={`food-${idx}`}
                                    style={styles.foodItemTouchable}
                                    onPress={() => {
                                        setSelectedMeal(meal);
                                        setModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.foodItemText}>
                                        {item.name} - {item.grams}g
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    );
                })}
            </ScrollView>

            <Modal transparent visible={modalVisible} animationType="slide">
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>How would you like to log this meal?</Text>

                                <TouchableOpacity style={styles.optionButton} onPress={handleAddWeeklyMeal}>
                                    <MaterialCommunityIcons name="check-bold" size={22} color="#34C759" />
                                    <Text style={styles.optionText}>Use recommended portion</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
