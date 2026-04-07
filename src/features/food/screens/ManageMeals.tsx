import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { mealService, PatientMeal } from '../services/meal.service';

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 20,
    },
    mealCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    mealStats: {
        fontSize: 14,
        color: colors.text,
        opacity: 0.7,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: colors.text,
        opacity: 0.6,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: colors.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default function ManageMealsScreen({ navigation }: any) {
    const { user } = useUser();
    const { colors } = useTheme();
    const styles = makeStyles(colors);

    const [patientMeals, setPatientMeals] = useState<PatientMeal[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPatientMeals = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await mealService.getPatientMeals(String(user.id));
            setPatientMeals(data || []);
        } catch (error: any) {
            console.error('Error fetchPatientMeals:', error);
            Alert.alert('Error', 'No se pudieron cargar tus comidas personalizadas.');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchPatientMeals();
        }, [fetchPatientMeals])
    );

    const handleEditMeal = (meal: PatientMeal) => {
        navigation.navigate('EditMeal', { mealToEdit: meal });
    };

    const renderMealItem = ({ item }: { item: PatientMeal }) => (
        <TouchableOpacity style={styles.mealCard} onPress={() => handleEditMeal(item)}>
            <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{item.meal_name}</Text>
                <Text style={styles.mealStats}>
                    {item.nutrients.energy_kcal.toFixed(0)} kcal • P: {item.nutrients.protein_g.toFixed(1)}g
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Comidas</Text>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : patientMeals.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No has creado comidas todavía.</Text>
                </View>
            ) : (
                <FlatList
                    data={patientMeals}
                    keyExtractor={(item) => item._id || String(Math.random())}
                    renderItem={renderMealItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateMealScreen')}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}
