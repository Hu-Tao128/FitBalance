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
import { API_CONFIG } from '../config/config';
import { TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useBle } from '../context/BleContext';
import { Device } from 'react-native-ble-plx';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type RawMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealLabels: Record<RawMealType, MealType> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
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
        color: '#444',
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
    scaleWeightText: {
        fontSize: 24,
        color: colors.primary,
        textAlign: 'center',
        marginVertical: 20,
        fontWeight: 'bold'
    },
    addWeightButton: {
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 12,
        marginTop: 10
    },
    addWeightButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
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
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [scaleModal, setScaleModal] = useState(false);

    const { 
        devices: scaleDevices,
        connectedDevice: scaleConnected,
        weight: scaleWeight,
        scanDevices: scanScaleDevices,
        connectDevice: connectScale,
        disconnectDevice: disconnectScale,
        requestPermissions: reqScalePerms
    } = useBle();

    const handleUseScale = async () => {
        const ok = await reqScalePerms();
        if (!ok) {
            Alert.alert('Permissions denied', 'Cannot access Bluetooth');
            return;
        }
        scanScaleDevices();
        setScaleModal(true);
    };

    const onSelectScaleDevice = async (device: Device) => {
        await connectScale(device);
    };

    const handleAddScaleWeight = async () => {
        if (!user?.id || !selectedMeal || scaleWeight === null) return;

        try {
            await axios.post(
            `${API_CONFIG.BASE_URL}/daily-meal-logs/add-weekly-meal`,
            {
                patient_id: user.id,
                meal:        selectedMeal,
            });

            Alert.alert('Success!', `${scaleWeight}g added to your daily log`);
            setModalVisible(false);
            setScaleModal(false);
        } catch (err: any) {
            console.error('Error adding weight:', err);
            if (err.response && err.response.status === 400) {
                Alert.alert('Notice', err.response.data.error || 'This meal is already logged');
            } else {
                Alert.alert('Error', 'Could not add weight.');
            }
        }
    };

    const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: 'America/Tijuana'
    }).format(new Date()).toLowerCase();

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
            
            if (!response.data?.meals || response.data.meals.length === 0) {
                setError('No meals planned for today');
                setWeeklyPlan(null);
            } else {
                setWeeklyPlan(response.data);
            }
        } catch (error) {
            console.error('Error loading plan:', error);
            setError('Could not load meal plan.');
            setWeeklyPlan(null);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            if (user) fetchWeeklyPlan();
        }, [user, fetchWeeklyPlan])
    );

    const handleAddWeeklyMeal = async () => {
        if (!user?.id || !selectedMeal) return;

        try {
            await axios.post(
            `${API_CONFIG.BASE_URL}/daily-meal-logs/add-weekly-meal`,
                {
                    patient_id: user.id,
                    meal:        selectedMeal,
                    weight:      scaleWeight,
                }
            );

            Alert.alert('Success!', 'Meal added to your daily log');
            setModalVisible(false);
        } catch (err: any) {
            console.error('Error adding meal:', err);
            if (err.response && err.response.status === 400) {
                Alert.alert('Notice', err.response.data.error || 'This meal is already logged');
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

    const todayMeals = weeklyPlan?.meals.filter(meal => meal.day === today) ?? [];

    if (!weeklyPlan || todayMeals.length === 0) {
        return (
            <View style={[styles.container, { 
                justifyContent: 'center',
                alignItems: 'center',    
                paddingHorizontal: 20    
            }]}>
                <View style={[styles.mealSection, { 
                    backgroundColor: colors.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 30,
                    width: '100%'       
                }]}>
                    <Ionicons name="calendar-outline" size={40} color={colors.text} style={{ marginBottom: 15 }} />
                    <Text style={[styles.mealTitle, { textAlign: 'center' }]}>
                        No meal plans for this week
                    </Text>
                    <Text style={{ 
                        color: colors.text, 
                        textAlign: 'center', 
                        marginTop: 10,
                        maxWidth: '80%'
                    }}>
                        Contact your nutritionist to get your meal plan
                    </Text>
                </View>
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

            {/* Options modal */}
            <Modal transparent visible={modalVisible} animationType="slide">
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>
                                    How would you like to log this meal?
                                </Text>

                                <TouchableOpacity style={styles.optionButton} onPress={handleAddWeeklyMeal}>
                                    <MaterialCommunityIcons name="check-bold" size={22} color="#34C759" />
                                    <Text style={styles.optionText}>Use recommended portion</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.optionButton} onPress={handleUseScale}>
                                    <MaterialCommunityIcons name="scale" size={22} color={colors.text} />
                                    <Text style={styles.optionText}>Use food scale</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Scale modal */}
            <Modal transparent visible={scaleModal} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {scaleConnected ? 'Current weight' : 'Select your scale'}
                        </Text>

                        {scaleConnected && (
                            <>
                                <Text style={styles.scaleWeightText}>
                                    {scaleWeight != null ? `${scaleWeight} g` : 'Waiting for data...'}
                                </Text>
                                
                                <TouchableOpacity 
                                    style={styles.addWeightButton}
                                    onPress={handleAddScaleWeight}
                                    disabled={scaleWeight === null}
                                >
                                    <Text style={styles.addWeightButtonText}>
                                        Add {scaleWeight !== null ? `${scaleWeight}g` : 'weight'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Dentro de tu Modal de selección de báscula */}
                        {!scaleConnected && (
                        <ScrollView 
                            style={{ maxHeight: 300, marginBottom: 10 }}
                            contentContainerStyle={{ paddingVertical: 8 }}
                        >
                            {scaleDevices.length === 0 ? (
                            <ActivityIndicator />
                            ) : (
                            scaleDevices.map(dev => (
                                <TouchableOpacity
                                key={dev.id}
                                style={styles.optionButton}
                                onPress={() => onSelectScaleDevice(dev)}
                                >
                                <Text style={styles.optionText}>
                                    {dev.name || dev.id}
                                </Text>
                                </TouchableOpacity>
                            ))
                            )}
                        </ScrollView>
                        )}

                        <TouchableOpacity onPress={() => {
                            setScaleModal(false);
                            disconnectScale();
                        }}>
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}