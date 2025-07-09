// src/screens/ManageMealsScreen.tsx
import DateTimePicker from '@react-native-community/datetimepicker'; // Para seleccionar la hora
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
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
import { RootStackParamList } from '../../App'; // Ajusta la ruta si es necesario
import { useTheme } from '../context/ThemeContext'; // Importar el hook useTheme
import { useUser } from '../context/UserContext';
import { PatientMeal } from '../types'; // Importar PatientMeal desde tu archivo de tipos compartido

// ---------- TYPES ----------
// Ya no necesitamos redefinir PatientMeal aquí si la importamos de '../types'
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// 👉 Ajusta IP o pasa a .env
const API_BASE = 'https://fitbalance-backend-production.up.railway.app';

// ---------- Componente ----------
export default function ManageMealsScreen() {
    const { user } = useUser();
    const { colors, darkMode } = useTheme(); // También obtenemos darkMode para lógica de texto
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    // --- State ---
    const [loading, setLoading] = useState(false);
    const [patientMeals, setPatientMeals] = useState<PatientMeal[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMealForAdd, setSelectedMealForAdd] = useState<PatientMeal | null>(null);
    const [mealType, setMealType] = useState<MealType>('lunch'); // Default
    const [mealTime, setMealTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // ---------- Cargar Comidas Personalizadas ----------
    const fetchPatientMeals = useCallback(async () => {
        if (!user || !user.id) return;
        setLoading(true);
        try {
            const patientId = String(user.id);
            const res = await axios.get(`${API_BASE}/PatientMeals/${patientId}`);
            setPatientMeals(res.data);
        } catch (error) {
            console.error('Error fetching patient meals:', error);
            Alert.alert('Error', 'No se pudieron cargar tus comidas personalizadas.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Recargar comidas cada vez que la pantalla está en foco
    useFocusEffect(
        useCallback(() => {
            fetchPatientMeals();
            return () => {
                // Opcional: limpiar estados si es necesario al salir de la pantalla
            };
        }, [fetchPatientMeals])
    );

    // ---------- Handlers ----------

    // Navegar a CreateMealScreen para edición
    const handleEditMeal = (meal: PatientMeal) => {
        navigation.navigate('CreateMealScreen', { mealToEdit: meal });
    };

    // Eliminar Comida
    const handleDeleteMeal = (mealId: string) => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que quieres eliminar esta comida personalizada?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await axios.delete(`${API_BASE}/PatientMeals/${mealId}`);
                            Alert.alert('Éxito', 'Comida eliminada correctamente.');
                            fetchPatientMeals(); // Recargar la lista
                        } catch (error) {
                            console.error('Error deleting meal:', error);
                            Alert.alert('Error', 'No se pudo eliminar la comida.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    // Mostrar modal para añadir al DailyMealLog
    const handleAddMealToDailyLog = (meal: PatientMeal) => {
        setSelectedMealForAdd(meal);
        setIsModalVisible(true);
    };

    // Confirmar añadir al DailyMealLog
    const confirmAddMealToDailyLog = async () => {
        if (!selectedMealForAdd || !user || !user.id) return;

        setLoading(true);
        setIsModalVisible(false); // Cerrar modal

        try {
            const patientId = String(user.id);
            const currentTime = `${mealTime.getHours().toString().padStart(2, '0')}:${mealTime.getMinutes().toString().padStart(2, '0')}`;

            await axios.post(`${API_BASE}/DailyMealLogs/add-custom-meal`, {
                patient_id: patientId,
                meal_id: selectedMealForAdd._id,
                type: mealType,
                time: currentTime,
            });

            Alert.alert('¡Éxito!', `"${selectedMealForAdd.name}" añadido al registro diario.`);
            // Opcional: navegar a la pantalla del log diario o actualizarla si es visible
            // navigation.navigate('DailyLogScreen'); // Si tienes una pantalla para esto
        } catch (error) {
            console.error('Error adding meal to daily log:', error);
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

    // ---------- Render Item de FlatList ----------
    const renderMealItem = ({ item }: { item: PatientMeal }) => {

        const getButtonTextColor = (bgColor: string): string => {

            return darkMode ? '#fff' : colors.text;
        };

        return (
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
                        <Text style={[styles.buttonText, { color: getButtonTextColor(colors.primary) }]}>+ Añadir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.info }]}
                        onPress={() => handleEditMeal(item)}
                        disabled={loading}
                    >
                        <Text style={[styles.buttonText, { color: getButtonTextColor(colors.primary) }]}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.danger }]}
                        onPress={() => handleDeleteMeal(item._id)}
                        disabled={loading}
                    >
                        <Text style={[styles.buttonText, { color: getButtonTextColor(colors.primary) }]}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // ---------- JSX ----------
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Tus Comidas Personalizadas</Text>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : patientMeals.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Aún no tienes comidas personalizadas. ¡Crea una!
                </Text>
            ) : (
                <FlatList
                    data={patientMeals}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMealItem}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Modal para seleccionar tipo y hora de comida */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Añadir "{selectedMealForAdd?.name}"
                        </Text>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Tipo de comida:</Text>
                        <View style={styles.mealTypeContainer}>
                            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.mealTypeButton,
                                        { borderColor: colors.border },
                                        mealType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                                    ]}
                                    onPress={() => setMealType(type as MealType)}
                                >
                                    {/* El texto del botón de tipo de comida también debe ser dinámico */}
                                    <Text style={[styles.mealTypeButtonText, { color: mealType === type ? (darkMode ? colors.text : '#fff') : colors.text }]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Hora:</Text>
                        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={[styles.timePickerButton, { borderColor: colors.border }]}>
                            <Text style={{ color: colors.text }}>{mealTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>

                        {showTimePicker && (
                            <DateTimePicker
                                testID="timePicker"
                                value={mealTime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={onTimeChange}
                            />
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.border }]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                onPress={confirmAddMealToDailyLog}
                            >
                                <Text style={styles.buttonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ---------- Estilos ----------
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
    },
    // ELIMINAMOS EL COLOR BLANCO FIJO DE AQUÍ
    buttonText: {
        // color: '#fff', // Este color se manejará inline o con una función
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    // Modal Styles
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
        width: '80%',
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
    },
});