import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { DateTime } from 'luxon';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import type { RootStackParamList } from '../navigation/AppNavigator';

type MealLogHistoryScreenRouteProp = RouteProp<RootStackParamList, 'MealLogHistory'>;

interface Meal {
    _id: string;
    type: string;
    time: string;
    foods: Array<{
        food_id: { _id: string; name: string };
        grams: number;
    }>;
    consumed?: boolean;
    notes?: string;
}

interface DailyLog {
    _id: string | null;
    date: string;
    meals: Meal[];
    totals: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
}

const MealItem = React.memo(({ 
    item, 
    logId, 
    onDelete, 
    colors 
    }: { 
    item: Meal, 
    logId: string | null, 
    onDelete: (mealId: string) => void, 
    colors: any 
}) => (
    <View style={[styles.mealCard, { backgroundColor: colors.card }]}>
        <View style={styles.mealHeader}>
        <View style={styles.mealTypeContainer}>
            <Ionicons 
            name={item.type === 'breakfast' ? 'sunny-outline' : 
                    item.type === 'lunch' ? 'fast-food-outline' : 
                    'moon-outline'} 
            size={20} 
            color={colors.primary} 
            />
            <Text style={[styles.mealType, { color: colors.primary }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
        </View>
        <View style={styles.mealHeaderRight}>
            <Text style={[styles.mealTime, { color: colors.textSecondary }]}>
            {item.time}
            </Text>
            {logId && (
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(item._id)}
            >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
            )}
        </View>
        </View>
        
        <View style={styles.foodList}>
        {item.foods
            //  ❌ si food_id es null, plántalo
            .filter(f => f.food_id !== null)
            .map((food, idx) => (
            <View key={`${food.food_id!._id}-${idx}`} style={styles.foodItem}>
                <Text style={[styles.foodText, { color: colors.text }]}>
                • {food.food_id!.name}
                </Text>
                <Text style={[styles.foodGrams, { color: colors.textSecondary }]}>
                {food.grams}g
                </Text>
            </View>
            ))
        }
        </View>

        
        {item.notes && (
        <Text style={[styles.mealNotes, { color: colors.textSecondary }]}>
            {item.notes}
        </Text>
        )}
    </View>
));

const MealLogHistoryScreen = () => {
    const { colors } = useTheme();
    const { user } = useUser();
    const route = useRoute<MealLogHistoryScreenRouteProp>();

    const [currentDate, setCurrentDate] = useState<Date>(new Date(route.params.initialDate));
    const [log, setLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogForDate = useCallback(async (date: Date) => {
        if (!user) return;
        
        setLoading(true);
        setError(null);

        try {
        const dateString = DateTime
            .fromJSDate(date)
            .setZone('America/Tijuana')
            .toISODate();

        console.log('Fetching meals for:', dateString);

        const { data } = await axios.get<DailyLog>(`${API_CONFIG.BASE_URL}/daily-meal-logs/by-date`, {
            params: {
            patient_id: user.id,
            date: dateString
            }
        });

        console.log('Received data:', data);
        setLog(data);
        } catch (err: any) {
        console.error('Error fetching log:', err);
        setError(err.response?.data?.message || 'No se pudo cargar el historial');
        } finally {
        setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLogForDate(currentDate);
    }, [currentDate, fetchLogForDate]);

    const changeDate = useCallback((delta: number) => {
        setCurrentDate(prev => {
        const newDate = DateTime.fromJSDate(prev)
            .plus({ days: delta })
            .toJSDate();
        console.log('Changing date to:', newDate);
        return newDate;
        });
    }, []);

    const isToday = useCallback(() => {
        return DateTime.local().hasSame(DateTime.fromJSDate(currentDate), 'day');
    }, [currentDate]);

    const handleDeleteMeal = useCallback(async (mealId: string) => {
        if (!log?._id) {
        Alert.alert('Error', 'Registro no encontrado');
        return;
        }

        Alert.alert(
        'Confirmar',
        '¿Eliminar esta comida del registro?',
        [
            { text: 'Cancelar', style: 'cancel' },
            {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
                try {
                await axios.delete(
                    `${API_CONFIG.BASE_URL}/daily-meal-logs/${log._id}/meals/${mealId}`
                );
                fetchLogForDate(currentDate);
                } catch (err) {
                Alert.alert('Error', 'No se pudo eliminar la comida');
                }
            }
            }
        ]
        );
    }, [log, currentDate, fetchLogForDate]);

    const renderHeader = () => (
        <View style={[styles.dateNavigator, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
            onPress={() => changeDate(-1)} 
            style={styles.navButton}
        >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: colors.text }]}>
            {DateTime.fromJSDate(currentDate)
                .setZone('America/Tijuana')
                .toLocaleString(DateTime.DATE_FULL, { locale: 'es-MX' })}
            </Text>
            {log?.totals && (
            <Text style={[styles.totalCalories, { color: colors.primary }]}>
                {log.totals.calories} kcal
            </Text>
            )}
        </View>
        
        <TouchableOpacity
            onPress={() => changeDate(1)}
            disabled={isToday()}
            style={styles.navButton}
        >
            <Ionicons
            name="chevron-forward"
            size={24}
            color={isToday() ? colors.border : colors.primary}
            />
        </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
        <Ionicons 
            name="calendar-outline" 
            size={48} 
            color={colors.textSecondary} 
            style={styles.emptyIcon}
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No hay comidas registradas
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {DateTime.fromJSDate(currentDate)
            .setZone('America/Tijuana')
            .toFormat("dd 'de' MMMM", { locale: 'es-MX' })}
        </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.errorContainer}>
        <Ionicons 
            name="warning-outline" 
            size={48} 
            color={colors.danger} 
        />
        <Text style={[styles.errorText, { color: colors.danger }]}>
            {error}
        </Text>
        <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchLogForDate(currentDate)}
        >
            <Text style={[styles.retryButtonText, { color: colors.primary }]}>
            Reintentar
            </Text>
        </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}

        {loading ? (
            <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            </View>
        ) : error ? (
            renderErrorState()
        ) : (
            <FlatList
            data={log?.meals || []}
            renderItem={({ item }) => (
                <MealItem 
                item={item} 
                logId={log?._id} 
                onDelete={handleDeleteMeal} 
                colors={colors} 
                />
            )}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState()}
            showsVerticalScrollIndicator={false}
            />
        )}
        </SafeAreaView>
    );
    };

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dateNavigator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    navButton: {
        padding: 8,
    },
    dateContainer: {
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
    },
    totalCalories: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    mealCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    mealTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealType: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    mealHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealTime: {
        fontSize: 14,
        marginRight: 12,
    },
    deleteButton: {
        padding: 4,
    },
    foodList: {
        marginTop: 8,
    },
    foodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    foodText: {
        fontSize: 15,
        flexShrink: 1,
    },
    foodGrams: {
        fontSize: 15,
    },
    mealNotes: {
        fontSize: 13,
        fontStyle: 'italic',
        marginTop: 8,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 16,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default MealLogHistoryScreen;