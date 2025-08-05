// src/screens/WeighFoodScreen.tsx

import axios from 'axios';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator,
    StyleSheet,
    Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Device } from 'react-native-ble-plx';

import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { SERVICE_UUID, CHAR_UUID } from '../config/bluetooth';
import { useBLEDevice } from '../components/UseBL';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
interface FoodItem { food_id: string; grams: number; }
interface Meal { day: string; type: MealType; time: string; foods: FoodItem[]; }
interface WeeklyPlan { meals: Meal[]; }

export default function WeighFoodScreen() {
    const { user } = useUser();
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [scaleModal,  setScaleModal]    = useState(false);

    const {
        requestPermissions: reqScalePerms,
        scan: scanScaleDevices,
        connect: connectScale,
        disconnect: disconnectScale,
        devices: scaleDevices,
        connected: scaleConnected,
        dataValue: scaleWeight
    } = useBLEDevice(SERVICE_UUID, CHAR_UUID);

    // Inyectar token
    useEffect(() => {
        const i = axios.interceptors.request.use(async cfg => {
        const t = await AsyncStorage.getItem('token');
        if (t && cfg.headers) cfg.headers.Authorization = `Bearer ${t}`;
        return cfg;
        });
        return () => axios.interceptors.request.eject(i);
    }, []);

    // Cargar plan diario
    const fetchWeeklyPlan = useCallback(async () => {
        if (!user) return setLoading(false);
        setLoading(true); setError(null);
        try {
        const res = await axios.get(`${API_CONFIG.BASE_URL}/weeklyplan/daily/${user.id}`);
        if (!res.data.meals?.length) {
            setError('No hay comidas planificadas');
            setWeeklyPlan(null);
        } else {
            setWeeklyPlan(res.data);
        }
        } catch {
        setError('No se pudo cargar el plan');
        setWeeklyPlan(null);
        } finally {
        setLoading(false);
        }
    }, [user]);
    useFocusEffect(useCallback(() => { fetchWeeklyPlan(); }, [fetchWeeklyPlan]));

    // Añadir comida semanal (porción o báscula)
    const handleAddWeeklyMeal = async (weight?: number) => {
        if (!user?.id || !selectedMeal) return;
        setModalVisible(false);
        setScaleModal(false);
        setLoading(true);
        try {
        await axios.post(`${API_CONFIG.BASE_URL}/daily-meal-logs/add-weekly-meal`, {
            patient_id: user.id,
            meal:       selectedMeal,
            weight
        });
        Alert.alert('¡Éxito!', 'Comida añadida al log diario.');
        } catch (err: any) {
        Alert.alert('Error', err.response?.data.error || 'No se pudo añadir');
        } finally {
        setLoading(false);
        disconnectScale();
        }
    };

    const today = new Intl.DateTimeFormat('en-US',{ weekday:'long', timeZone:'America/Tijuana' })
                    .format(new Date()).toLowerCase();

    if (loading) return (
        <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );

    const todayMeals = weeklyPlan?.meals.filter(m => m.day === today) || [];
    if (!todayMeals.length) return (
        <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={40} color={colors.text} />
        <Text style={[styles.emptyText,{color:colors.text}]}>
            No hay comidas planificadas hoy.
        </Text>
        </View>
    );

    return (
        <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
            {todayMeals.map((meal,idx)=>(
            <View key={idx} style={styles.mealSection}>
                <Text style={styles.mealTitle}>
                {meal.type.charAt(0).toUpperCase()+meal.type.slice(1)}
                </Text>
                {meal.foods.map((f,i)=>(
                <TouchableOpacity key={i} onPress={()=>{ setSelectedMeal(meal); setModalVisible(true); }}>
                    <Text style={styles.foodText}>{f.grams}g</Text>
                </TouchableOpacity>
                ))}
            </View>
            ))}
        </ScrollView>

        {/* Opciones */}
        <Modal visible={modalVisible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={()=>setModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                <View style={[styles.modalContainer,{backgroundColor:colors.card}]}>
                    <Text style={[styles.modalTitle,{color:colors.text}]}>
                    ¿Cómo deseas añadir esta comida?
                    </Text>
                    <TouchableOpacity
                    style={styles.optionButton}
                    onPress={()=>handleAddWeeklyMeal(undefined)}
                    >
                    <MaterialCommunityIcons name="check-bold" size={22} color="#34C759"/>
                    <Text style={[styles.optionText,{color:colors.text}]}>
                        Usar porción recomendada
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={styles.optionButton}
                    onPress={async()=>{
                        if (await reqScalePerms()) {
                        scanScaleDevices();
                        setModalVisible(false);
                        setScaleModal(true);
                        }
                    }}
                    >
                    <MaterialCommunityIcons name="scale" size={22} color={colors.text}/>
                    <Text style={[styles.optionText,{color:colors.text}]}>
                        Usar báscula
                    </Text>
                    </TouchableOpacity>
                </View>
                </TouchableWithoutFeedback>
            </View>
            </TouchableWithoutFeedback>
        </Modal>

        {/* Báscula */}
        <Modal visible={scaleModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer,{backgroundColor:colors.card}]}>
                <Text style={[styles.modalTitle,{color:colors.text}]}>
                {scaleConnected ? 'Peso actual' : 'Selecciona báscula'}
                </Text>
                {scaleConnected ? (
                <>
                    <Text style={[styles.scaleWeightText,{color:colors.primary}]}>
                    {scaleWeight!=null ? `${scaleWeight} g` : 'Esperando…'}
                    </Text>
                    <TouchableOpacity
                    style={[styles.addWeightButton,{backgroundColor:colors.primary}]}
                    onPress={()=>handleAddWeeklyMeal(scaleWeight!)}
                    disabled={scaleWeight==null}
                    >
                    <Text style={styles.addWeightButtonText}>
                        Añadir {scaleWeight}g
                    </Text>
                    </TouchableOpacity>
                </>
                ) : scaleDevices.length===0 ? (
                <ActivityIndicator />
                ) : (
                scaleDevices.map((dev: Device)=>
                    <TouchableOpacity
                    key={dev.id}
                    style={styles.optionButton}
                    onPress={()=>connectScale(dev)}
                    >
                    <Text style={[styles.optionText,{color:colors.text}]}>
                        {dev.name||dev.id}
                    </Text>
                    </TouchableOpacity>
                )
                )}
                <TouchableOpacity onPress={()=>{
                setScaleModal(false);
                disconnectScale();
                }}>
                <Text style={[styles.closeText,{color:colors.primary}]}>Cancelar</Text>
                </TouchableOpacity>
            </View>
            </View>
        </Modal>
        </View>
    );
}

const makeStyles = (colors: any)=>StyleSheet.create({
    container:       { flex:1, padding:20, backgroundColor:colors.background },
    center:          { flex:1, justifyContent:'center', alignItems:'center' },
    emptyContainer:  { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
    emptyText:       { marginTop:10, fontSize:16 },
    scroll:          { paddingVertical:20 },
    mealSection:     { marginBottom:20, padding:16, borderRadius:12, backgroundColor:colors.card },
    mealTitle:       { fontSize:18, fontWeight:'bold', marginBottom:8, color:colors.text },
    foodText:        { fontSize:16, color:colors.text },
    modalOverlay:    { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.5)' },
    modalContainer:  { padding:20, borderTopLeftRadius:20, borderTopRightRadius:20 },
    modalTitle:      { fontSize:18, fontWeight:'bold', marginBottom:20 },
    optionButton:    { flexDirection:'row', alignItems:'center', paddingVertical:12, gap:10 },
    optionText:      { fontSize:16 },
    closeText:       { textAlign:'center', marginTop:20 },
    scaleWeightText: { fontSize:24, textAlign:'center', marginVertical:20 },
    addWeightButton: { padding:12, borderRadius:8, marginTop:10, justifyContent:'center' },
    addWeightButtonText:{ color:'#fff', textAlign:'center', fontWeight:'bold' }
    });