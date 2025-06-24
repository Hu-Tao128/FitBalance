import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Modal, ScrollView, StyleSheet, Text,
    TouchableOpacity, View, ActivityIndicator
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const SERVER_URL = 'https://fitbalance-backend-production.up.railway.app';

type MealType = 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack';
type RawMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealLabels: Record<RawMealType, MealType> = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Snack'
};

interface FoodItem {
    food_id: string;
    grams: number;
}

interface Meal {
    day: string;
    type: RawMealType;
    time: string;
    foods: FoodItem[];
}

interface WeeklyPlan {
    dailyCalories: number;
    protein: number;
    fat: number;
    carbs: number;
    meals: Meal[];
}

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
        color: colors.text,
    },
    mealTitleChecked: {
        textDecorationLine: 'underline',
        color: colors.primary,
    },
    foodItemTouchable: {
        paddingVertical: 8,
    },
    foodItemText: {
        fontSize: 16,
        color: colors.text,
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
        textAlign: 'right',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    }
});

export default function WeighFoodScreen() {
    const { user } = useUser();
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    interface RegistradasType {
        [meal: string]: {
            [item: string]: boolean
        }
    }

    const [registradas, setRegistradas] = useState<RegistradasType>({});

    const today = useMemo(() => 
        new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        []
    );

    const fetchWeeklyPlan = useCallback(async () => {
        if (!user) {
            console.warn('No hay usuario autenticado');
            setLoading(false);
            return;
        }

        try {
            setError(null);
            setLoading(true);
            const todayISO = new Date().toISOString().split('T')[0];

            console.log(user.id);

            const response = await axios.get(`${SERVER_URL}/weeklyplan/daily/${user.id}`);

            console.log('Respuesta del servidor:', response.data); 
            
            if (!response.data) {
            throw new Error('El servidor respondió sin datos');
            }

            setWeeklyPlan(response.data);
        } catch (error) {
            console.error('Error al cargar el plan:', error);
            setError('No se pudo cargar el plan. Verifica tu conexión o contacta al soporte.');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchWeeklyPlan();
        }
    }, [user, fetchWeeklyPlan]);

    const handleRegister = useCallback(() => {
        if (selectedMeal && selectedItem) {
            setRegistradas(prev => ({
                ...prev,
                [selectedMeal]: {
                    ...(prev[selectedMeal] || {}),
                    [selectedItem]: true
                }
            }));
            setModalVisible(false);
        }
    }, [selectedMeal, selectedItem]);

    const handleManualRegister = useCallback(() => {
        // Aquí iría la lógica para registro manual
        console.log('Registro manual para:', selectedItem);
        setModalVisible(false);
    }, [selectedItem]);

    const isMealComplete = useCallback((meal: string, items: FoodItem[]) => {
        const mealReg = registradas[meal] || {};
        return items.every(item => mealReg[item.food_id]);
    }, [registradas]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchWeeklyPlan}>
                    <Text style={styles.closeText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const todayMeals = weeklyPlan?.meals.filter(meal => meal.day === today) ?? [];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll}>
                {todayMeals.map((meal, index) => {
                    const label = mealLabels[meal.type];
                    const color =
                        meal.type === 'breakfast' ? '#FFEB99' :
                            meal.type === 'lunch' ? '#C3FBD8' :
                                meal.type === 'dinner' ? '#D6C7FB' :
                                    '#FFD6E7';

                    const mealDone = isMealComplete(label, meal.foods);

                    return (
                        <View key={`meal-${index}`} style={[styles.mealSection, { backgroundColor: color }]}>
                            <Text style={[styles.mealTitle, mealDone && styles.mealTitleChecked]}>
                                {label} {mealDone && <Ionicons name="checkmark-circle" size={18} color="#34C759" />}
                            </Text>

                            {meal.foods.map((item, idx) => {
                                const isItemRegistered = registradas[label]?.[item.food_id];
                                return (
                                    <TouchableOpacity
                                        key={`food-${idx}`}
                                        onPress={() => {
                                            setSelectedMeal(label);
                                            setSelectedItem(item.food_id);
                                            setModalVisible(true);
                                        }}
                                        style={styles.foodItemTouchable}
                                        accessibilityLabel={`Registrar ${item.food_id}`}
                                    >
                                        <Text style={styles.foodItemText}>
                                            {item.food_id} - {item.grams}g
                                            {isItemRegistered && (
                                                <Ionicons name="checkmark-circle" size={16} color="#34C759" style={{ marginLeft: 6 }} />
                                            )}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>

            <Modal
                transparent
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            ¿Cómo quieres registrar {selectedItem} de {selectedMeal}?
                        </Text>

                        <TouchableOpacity 
                            style={styles.optionButton} 
                            onPress={handleRegister}
                            accessibilityLabel="Usar porción recomendada"
                        >
                            <MaterialCommunityIcons name="check-bold" size={22} color="#34C759" />
                            <Text style={styles.optionText}>Usar porción recomendada</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.optionButton} 
                            onPress={handleManualRegister}
                            accessibilityLabel="Ingresar manualmente"
                        >
                            <Ionicons name="create-outline" size={22} color="#34C759" />
                            <Text style={styles.optionText}>Ingresar manualmente</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.optionButton}
                            accessibilityLabel="Usar báscula (no disponible)"
                            disabled
                        >
                            <MaterialCommunityIcons name="scale" size={22} color="#aaa" />
                            <Text style={[styles.optionText, { color: '#aaa' }]}>Usar báscula (próximamente)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => setModalVisible(false)}
                            accessibilityLabel="Cerrar modal"
                        >
                            <Text style={styles.closeText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}