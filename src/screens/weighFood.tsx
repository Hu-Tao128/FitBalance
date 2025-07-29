import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Modal, ScrollView, StyleSheet, Text,
    TouchableOpacity, View, ActivityIndicator, Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';
import { TouchableWithoutFeedback } from 'react-native';

type MealType = 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack';
type RawMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealLabels: Record<RawMealType, MealType> = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Snack'
};

interface FoodItem {
    name: string;
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
        color: 'rgba(0,0,0,0.5)',
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
    
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

    const today = useMemo(() => 
        new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        []
    );

    // Interceptor para token
    useEffect(() => {
        const reqInterceptor = axios.interceptors.request.use(
            async config => {
                const t = await AsyncStorage.getItem('token');
                if (t && config.headers) {
                    config.headers['Authorization'] = `Bearer ${t}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );
        return () => {
            axios.interceptors.request.eject(reqInterceptor);
        };
    }, []);

    const fetchWeeklyPlan = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            setLoading(true);
            const response = await axios.get(`${API_CONFIG.BASE_URL}/weeklyplan/daily/${user.id}`);
            setWeeklyPlan(response.data);
        } catch (error) {
            console.error('Error al cargar el plan:', error);
            setError('No se pudo cargar el plan.');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) fetchWeeklyPlan();
    }, [user, fetchWeeklyPlan]);

    const handleAddWeeklyMeal = async () => {
    if (!user?.id || !selectedMeal) return;

    try {
        await axios.post(`${API_CONFIG.BASE_URL}/DailyMealLogs/add-weekly-meal`, {
        patient_id: user.id,
        meal: selectedMeal,
        });

        Alert.alert('¡Éxito!', 'La comida fue añadida a tu log diario');
        setModalVisible(false);
    } catch (err: any) {
        console.error('Error añadiendo comida: Comida ya registrada');
        if (err.response && err.response.status === 400) {
        Alert.alert('Aviso', err.response.data.error || 'Esta comida ya está registrada');
        } else {
        Alert.alert('Error', 'No se pudo añadir la comida.');
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

    const todayMeals = weeklyPlan?.meals.filter(meal => meal.day === today) ?? [];

    if (!weeklyPlan || todayMeals.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.mealTitle}>No tienes planes para esta semana</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll}>
                {todayMeals.map((meal, index) => {
                    const label = mealLabels[meal.type];
                    const color =
                        meal.type === 'breakfast' ? '#FFEB99' :
                        meal.type === 'lunch' ? '#C3FBD8' :
                        meal.type === 'dinner' ? '#D6C7FB' : '#FFD6E7';

                    return (
                        <View key={`meal-${index}`} style={[styles.mealSection, { backgroundColor: color }]}>
                            <Text style={styles.mealTitle}>{label}</Text>
                            {meal.foods.map((item, idx) => (
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

            {/* Modal mejorado */}
            <Modal transparent visible={modalVisible} animationType="slide">
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        ¿Cómo deseas registrar esta comida?
                    </Text>

                    {/* Opción usar porción recomendada */}
                    <TouchableOpacity style={styles.optionButton} onPress={handleAddWeeklyMeal}>
                        <MaterialCommunityIcons name="check-bold" size={22} color="#34C759" />
                        <Text style={styles.optionText}>Usar porción recomendada</Text>
                    </TouchableOpacity>

                    {/* Opción usar báscula */}
                    <TouchableOpacity style={styles.optionButton}>
                        <MaterialCommunityIcons name="scale" size={22} color="#aaa" />
                        <Text style={[styles.optionText, { color: '#aaa' }]}>
                        Usar báscula (próximamente)
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeText}>Cancelar</Text>
                    </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}