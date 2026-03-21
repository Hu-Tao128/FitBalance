import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { PatientMeal } from '../types';

import { API_CONFIG } from '../config/config';

type ManageMealsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManageMeals'>;
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function ManageMealsScreen() {
    const { user } = useUser();
    const { colors, darkMode } = useTheme();
    const navigation = useNavigation<ManageMealsScreenNavigationProp>();
    const styles = createDynamicStyles(colors, darkMode);

    const [loading, setLoading] = useState(false);
    const [patientMeals, setPatientMeals] = useState<PatientMeal[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMealForAdd, setSelectedMealForAdd] = useState<PatientMeal | null>(null);
    const [mealType, setMealType] = useState<MealType>('lunch');
    const [mealTime, setMealTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

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

    const fetchPatientMeals = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const patientId = String(user.id);
            const res = await axios.get(
                `${API_CONFIG.BASE_URL}/PatientMeals/${patientId}`
            );
            setPatientMeals(res.data);
        } catch (error: any) {
            console.error('Error fetchPatientMeals:', error);
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    Alert.alert(
                        'Error de Autenticación',
                        'Tu sesión ha expirado.',
                        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                    );
                } else {
                    Alert.alert('Error', `Servidor respondió: ${error.response.status}`);
                }
            } else if (error.request) {
                Alert.alert('Error de Red', 'No se pudo conectar al servidor.');
            } else {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    }, [user, navigation]);

    useFocusEffect(
        useCallback(() => {
            fetchPatientMeals();
        }, [fetchPatientMeals])
    );

    const handleEditMeal = (meal: PatientMeal) => {
        navigation.navigate('EditMeal', { mealToEdit: meal });
    };

    const handleDeleteMeal = (mealId: string) => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que quieres eliminar esta comida?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await axios.delete(`${API_CONFIG.BASE_URL}/PatientMeals/${mealId}`);
                            Alert.alert('Éxito', 'Comida eliminada correctamente.');
                            fetchPatientMeals();
                        } catch (error) {
                            console.error('ERROR al eliminar comida:', error);
                            Alert.alert('Error', 'No se pudo eliminar la comida.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleAddMealToDailyLog = (meal: PatientMeal) => {
        setSelectedMealForAdd(meal);
        setMealTime(new Date());
        setIsModalVisible(true);
    };

    const confirmAddMealToDailyLog = async () => {
        if (!selectedMealForAdd || !user?.id) {
            Alert.alert('Error', 'No se pudo añadir la comida.');
            return;
        }
        setLoading(true);
        setIsModalVisible(false);
        try {
            const patientId = String(user.id);
            const currentTime = `${mealTime.getHours().toString().padStart(2, '0')}:${mealTime
                .getMinutes()
                .toString()
                .padStart(2, '0')}`;

            await axios.post(
                `${API_CONFIG.BASE_URL}/DailyMealLogs/add-custom-meal`,
                {
                    patient_id: patientId,
                    meal_id: selectedMealForAdd._id,
                    type: mealType,
                    time: currentTime,
                }
            );

            Alert.alert('¡Éxito!', `"${selectedMealForAdd.name}" añadido a tu registro.`);
            setMealType('lunch');
            setMealTime(new Date());
        } catch (error) {
            console.error('ERROR al añadir comida:', error);
            Alert.alert('Error', 'No se pudo añadir la comida.');
        } finally {
            setLoading(false);
        }
    };

    const onTimeChange = (_event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || mealTime;
        setShowTimePicker(Platform.OS === 'ios');
        setMealTime(currentDate);
    };

    const renderMealItem = ({ item }: { item: PatientMeal }) => (
        <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
                <View style={styles.mealIconBox}>
                    <Ionicons name="restaurant" size={22} color={colors.primary} />
                </View>
                <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{item.name}</Text>
                    <Text style={styles.mealCalories}>{item.nutrients.energy_kcal} kcal</Text>
                </View>
            </View>
            
            <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                    <View style={[styles.macroDot, { backgroundColor: colors.progressProtein }]} />
                    <Text style={styles.macroLabel}>Prot</Text>
                    <Text style={styles.macroValue}>{item.nutrients.protein_g}g</Text>
                </View>
                <View style={styles.macroItem}>
                    <View style={[styles.macroDot, { backgroundColor: colors.progressCarbs }]} />
                    <Text style={styles.macroLabel}>Carb</Text>
                    <Text style={styles.macroValue}>{item.nutrients.carbohydrates_g}g</Text>
                </View>
                <View style={styles.macroItem}>
                    <View style={[styles.macroDot, { backgroundColor: colors.progressFat }]} />
                    <Text style={styles.macroLabel}>Grasa</Text>
                    <Text style={styles.macroValue}>{item.nutrients.fat_g}g</Text>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddMealToDailyLog(item)}
                    disabled={loading}
                >
                    <Ionicons name="add-circle" size={18} color={colors.onPrimary} />
                    <Text style={styles.addButtonText}>Añadir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditMeal(item)}
                    disabled={loading}
                >
                    <Ionicons name="create-outline" size={18} color={colors.onSecondaryContainer} />
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMeal(item._id)}
                    disabled={loading}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tus Comidas</Text>
                <Text style={styles.headerSubtitle}>Gestiona tus comidas personalizadas</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : patientMeals.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBox}>
                        <Ionicons name="restaurant-outline" size={48} color={colors.outline} />
                    </View>
                    <Text style={styles.emptyTitle}>Sin comidas personalizadas</Text>
                    <Text style={styles.emptySubtitle}>
                        Crea tus propias comidas con los ingredientes que prefieras.
                    </Text>
                    <TouchableOpacity 
                        style={styles.createButton}
                        onPress={() => navigation.navigate('CreateMealScreen')}
                    >
                        <Ionicons name="add" size={20} color={colors.onPrimary} />
                        <Text style={styles.createButtonText}>Crear Comida</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={patientMeals}
                    keyExtractor={item => item._id}
                    renderItem={renderMealItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('CreateMealScreen')}
            >
                <Ionicons name="add" size={28} color={colors.onPrimary} />
            </TouchableOpacity>

            {/* Modal */}
            <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Añadir al Registro</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color={colors.outline} />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.modalMealName}>"{selectedMealForAdd?.name}"</Text>
                        
                        <Text style={styles.modalLabel}>Tipo de comida:</Text>
                        <View style={styles.mealTypeContainer}>
                            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.mealTypeButton,
                                        mealType === type && styles.mealTypeButtonActive,
                                    ]}
                                    onPress={() => setMealType(type)}
                                >
                                    <Text style={[
                                        styles.mealTypeButtonText,
                                        mealType === type && styles.mealTypeButtonTextActive
                                    ]}>
                                        {type === 'breakfast' ? 'Desayuno' : 
                                         type === 'lunch' ? 'Almuerzo' : 
                                         type === 'dinner' ? 'Cena' : 'Snack'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <Text style={styles.modalLabel}>Hora:</Text>
                        <TouchableOpacity
                            onPress={() => setShowTimePicker(true)}
                            style={styles.timeButton}
                        >
                            <Ionicons name="time-outline" size={20} color={colors.primary} />
                            <Text style={styles.timeText}>
                                {mealTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>

                        {showTimePicker && (
                            <DateTimePicker
                                testID="timePicker"
                                value={mealTime}
                                mode="time"
                                is24Hour
                                display="default"
                                onChange={onTimeChange}
                            />
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={confirmAddMealToDailyLog}
                            >
                                <Text style={styles.confirmButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const createDynamicStyles = (colors: any, darkMode: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 20, paddingBottom: 8 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: colors.onSurface, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyIconBox: { marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.onSurface, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
    createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 24 },
    createButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15, marginLeft: 8 },
    listContent: { padding: 20, paddingTop: 8 },
    mealCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    mealIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surfaceContainerHighest, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    mealInfo: { flex: 1 },
    mealName: { fontSize: 17, fontWeight: '700', color: colors.onSurface },
    mealCalories: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    macrosRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 14 },
    macroItem: { alignItems: 'center' },
    macroDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
    macroLabel: { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    macroValue: { fontSize: 14, fontWeight: '700', color: colors.onSurface },
    actionsContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 18 },
    addButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 13, marginLeft: 4 },
    editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondaryContainer, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
    editButtonText: { color: colors.onSecondaryContainer, fontWeight: '700', fontSize: 13, marginLeft: 4 },
    deleteButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.error}15`, justifyContent: 'center', alignItems: 'center' },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: colors.onSurface },
    modalMealName: { fontSize: 15, color: colors.textSecondary, marginBottom: 20 },
    modalLabel: { fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    mealTypeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 8 },
    mealTypeButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
    mealTypeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    mealTypeButtonText: { fontSize: 13, fontWeight: '600', color: colors.onSurface },
    mealTypeButtonTextActive: { color: colors.onPrimary },
    timeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainerHighest, paddingVertical: 14, borderRadius: 14, marginBottom: 20, gap: 8 },
    timeText: { fontSize: 16, fontWeight: '600', color: colors.onSurface },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    cancelButtonText: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
    confirmButton: { flex: 1, paddingVertical: 14, borderRadius: 24, alignItems: 'center', backgroundColor: colors.primary },
    confirmButtonText: { fontSize: 15, fontWeight: '700', color: colors.onPrimary },
});
