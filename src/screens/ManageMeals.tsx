import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { RootStackParamList } from '../../App';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { PatientMeal } from '../types';

import { API_CONFIG } from '../config';

// ---------- TIPOS ----------
type ManageMealsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManageMeals'>;
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function ManageMealsScreen() {
    const { user } = useUser();
    const { colors } = useTheme();
    const navigation = useNavigation<ManageMealsScreenNavigationProp>();

    const [loading, setLoading] = useState(false);
    const [patientMeals, setPatientMeals] = useState<PatientMeal[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMealForAdd, setSelectedMealForAdd] = useState<PatientMeal | null>(null);
    const [mealType, setMealType] = useState<MealType>('lunch');
    const [mealTime, setMealTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Inyecta el token en cada petición de Axios
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

    // Carga las comidas personalizadas del paciente
    const fetchPatientMeals = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const patientId = String(user.id);
            // Usar ruta RESTful con :patient_id
            const res = await axios.get(
                `${API_CONFIG.BASE_URL}/PatientMeals/${patientId}`
            );
            setPatientMeals(res.data);
        } catch (error: any) {
            console.error('Error fetchPatientMeals:', error);

            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);
                if (error.response.status === 401 || error.response.status === 403) {
                    Alert.alert(
                        'Error de Autenticación',
                        'Tu sesión ha expirado o no tienes permiso. Por favor, inicia sesión de nuevo.',
                        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                    );
                } else {
                    Alert.alert('Error', `Servidor respondió: ${error.response.status}`);
                }
            } else if (error.request) {
                console.log('No hubo respuesta, request:', error.request);
                Alert.alert('Error de Red', 'No se pudo conectar al servidor.');
            } else {
                console.log('Error al configurar la petición:', error.message);
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

    // Navega a la pantalla de edición
    const handleEditMeal = (meal: PatientMeal) => {
        navigation.navigate('EditMeal', { mealToEdit: meal });
    };

    // Elimina una comida personalizada
    const handleDeleteMeal = (mealId: string) => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que quieres eliminar esta comida personalizada? Esta acción es irreversible.',
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
                            Alert.alert('Error', 'No se pudo eliminar la comida. Inténtalo de nuevo.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    // Abre el modal para agregar al log diario
    const handleAddMealToDailyLog = (meal: PatientMeal) => {
        setSelectedMealForAdd(meal);
        setMealTime(new Date());
        setIsModalVisible(true);
    };

    // Confirma y envía la comida al registro diario
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

            Alert.alert('¡Éxito!', `"${selectedMealForAdd.name}" ha sido añadido a tu registro diario.`);
            setMealType('lunch');
            setMealTime(new Date());
        } catch (error) {
            console.error('ERROR al añadir comida al registro diario:', error);
            Alert.alert('Error', 'No se pudo añadir la comida al registro diario.');
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
        <View style={[styles.mealCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.mealName, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.nutrientsContainer}>
                <Text style={[styles.nutrientText, { color: colors.textSecondary }]}>
                    {item.nutrients.energy_kcal} kcal
                </Text>
                <Text style={[styles.nutrientText, { color: colors.textSecondary }]}>
                    P: {item.nutrients.protein_g}g
                </Text>
                <Text style={[styles.nutrientText, { color: colors.textSecondary }]}>
                    C: {item.nutrients.carbohydrates_g}g
                </Text>
                <Text style={[styles.nutrientText, { color: colors.textSecondary }]}>
                    G: {item.nutrients.fat_g}g
                </Text>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleAddMealToDailyLog(item)}
                    disabled={loading}
                >
                    <Text style={[styles.buttonText, { color: '#fff' }]}>+ Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.info }]}
                    onPress={() => handleEditMeal(item)}
                    disabled={loading}
                >
                    <Text style={[styles.buttonText, { color: '#fff' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.danger }]}
                    onPress={() => handleDeleteMeal(item._id)}
                    disabled={loading}
                >
                    <Text style={[styles.buttonText, { color: '#fff' }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Your Personalized Meals</Text>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.activityIndicatorCenter} />
            ) : patientMeals.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aún no tienes comidas personalizadas.</Text>
            ) : (
                <FlatList
                    data={patientMeals}
                    keyExtractor={item => item._id}
                    renderItem={renderMealItem}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Add "{selectedMealForAdd?.name}" al log
                        </Text>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Type of food:</Text>
                        <View style={styles.mealTypeContainer}>
                            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.mealTypeButton,
                                        { borderColor: colors.border },
                                        mealType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                                    ]}
                                    onPress={() => setMealType(type)}
                                >
                                    <Text style={[styles.mealTypeButtonText, { color: mealType === type ? '#fff' : colors.text }]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Hora:</Text>
                        <TouchableOpacity
                            onPress={() => setShowTimePicker(true)}
                            style={[styles.timePickerButton, { borderColor: colors.border }]}
                        >
                            <Text style={{ color: colors.text }}>
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
                                style={[styles.modalButton, { backgroundColor: colors.border }]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                onPress={confirmAddMealToDailyLog}
                            >
                                <Text style={[styles.buttonText, { color: '#fff' }]}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    activityIndicatorCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    mealCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mealName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    nutrientsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    nutrientText: {
        fontSize: 14,
        marginRight: 10,
        marginBottom: 5,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 16,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    mealTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    mealTypeButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        margin: 5,
    },
    mealTypeButtonText: {
        fontWeight: 'bold',
    },
    timePickerButton: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
});
