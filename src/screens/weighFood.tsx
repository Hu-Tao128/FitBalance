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

import { SERVICE_UUID, CHAR_UUID } from '../config/bluetooth'; 
import { useBLEDevice } from '../components/UseBL';
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
        requestPermissions: reqScalePerms,
        scan: scanScaleDevices,
        connect: connectScale,
        disconnect: disconnectScale,
        devices: scaleDevices,
        connected: scaleConnected,
        dataValue: scaleWeight,
    } = useBLEDevice(SERVICE_UUID, CHAR_UUID);

    const handleUseScale = async () => {
        const ok = await reqScalePerms();
        if (!ok) {
            Alert.alert('Permisos denegados', 'No se puede acceder a BLE');
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
            await axios.post(`${API_CONFIG.BASE_URL}/DailyMealLogs/add-weight-meal`, {
                patient_id: user.id,
                weight: scaleWeight,
                meal: selectedMeal,
            });

            Alert.alert('¡Éxito!', `${scaleWeight}g añadidos a tu log diario`);
            setModalVisible(false);
            setScaleModal(false);
        } catch (err: any) {
            console.error('Error añadiendo peso:', err);
            if (err.response && err.response.status === 400) {
                Alert.alert('Aviso', err.response.data.error || 'Esta comida ya está registrada');
            } else {
                Alert.alert('Error', 'No se pudo añadir el peso.');
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
                setError('No hay comidas planificadas para hoy');
                setWeeklyPlan(null);
            } else {
                setWeeklyPlan(response.data);
            }
        } catch (error) {
            console.error('Error al cargar el plan:', error);
            setError('No se pudo cargar el plan.');
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
            await axios.post(`${API_CONFIG.BASE_URL}/DailyMealLogs/add-weekly-meal`, {
                patient_id: user.id,
                meal: selectedMeal,
            });

            Alert.alert('¡Éxito!', 'La comida fue añadida a tu log diario');
            setModalVisible(false);
        } catch (err: any) {
            console.error('Error añadiendo comida:', err);
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
                        No tienes planes para esta semana
                    </Text>
                    <Text style={{ 
                        color: colors.text, 
                        textAlign: 'center', 
                        marginTop: 10,
                        maxWidth: '80%'
                    }}>
                        Contacta a tu nutricionista para obtener tu plan alimenticio
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

            {/* Modal de opciones */}
            <Modal transparent visible={modalVisible} animationType="slide">
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>
                                    ¿Cómo deseas registrar esta comida?
                                </Text>

                                <TouchableOpacity style={styles.optionButton} onPress={handleAddWeeklyMeal}>
                                    <MaterialCommunityIcons name="check-bold" size={22} color="#34C759" />
                                    <Text style={styles.optionText}>Usar porción recomendada</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.optionButton} onPress={handleUseScale}>
                                    <MaterialCommunityIcons name="scale" size={22} color={colors.text} />
                                    <Text style={styles.optionText}>Usar báscula</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Modal de la báscula */}
            <Modal transparent visible={scaleModal} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {scaleConnected ? 'Peso actual' : 'Seleccione su báscula'}
                        </Text>

                        {scaleConnected && (
                            <>
                                <Text style={styles.scaleWeightText}>
                                    {scaleWeight != null ? `${scaleWeight} g` : 'Esperando dato...'}
                                </Text>
                                
                                <TouchableOpacity 
                                    style={styles.addWeightButton}
                                    onPress={handleAddScaleWeight}
                                    disabled={scaleWeight === null}
                                >
                                    <Text style={styles.addWeightButtonText}>
                                        Agregar {scaleWeight !== null ? `${scaleWeight}g` : 'peso'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {!scaleConnected && (
                            <>
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
                            </>
                        )}

                        <TouchableOpacity onPress={() => {
                            setScaleModal(false);
                            disconnectScale();
                        }}>
                            <Text style={styles.closeText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}