import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
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
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { mealService } from '../services/meal.service';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type MealLogHistoryScreenRouteProp = RouteProp<RootStackParamList, 'MealLogHistory'>;

interface Meal {
    _id: string;
    type: string;
    time: string;
    foods: Array<{
        food_id: { _id: string; name: string } | null;
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
            <Text style={[styles.mealTime, { color: colors.outline }]}>
            {item.time}
            </Text>
            {logId && (
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(item._id)}
            >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
            )}
        </View>
        </View>
        
        <View style={styles.foodList}>
        {item.foods
            .filter(f => f.food_id !== null)
            .map((food, idx) => (
            <View key={`${food.food_id!._id}-${idx}`} style={styles.foodItem}>
                <Text style={[styles.foodText, { color: colors.onSurface }]}>
                • {food.food_id!.name}
                </Text>
                <Text style={[styles.foodGrams, { color: colors.outline }]}>
                {food.grams}g
                </Text>
            </View>
            ))
        }
        </View>

        {item.notes && (
        <Text style={[styles.mealNotes, { color: colors.outline }]}>
            {item.notes}
        </Text>
        )}
    </View>
));

export default function MealLogHistoryScreen() {
    const { colors } = useTheme();
    const { user } = useUser();
    const route = useRoute<MealLogHistoryScreenRouteProp>();

    const [currentDate, setCurrentDate] = useState<Date>(new Date(route.params.initialDate));
    const [log, setLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogForDate = useCallback(async (date: Date) => {
        if (!user?.id) return;
        
        setLoading(true);
        setError(null);

        try {
            const dateString = DateTime
                .fromJSDate(date)
                .setZone('America/Tijuana')
                .toISODate();

            if (dateString) {
                const data = await mealService.getMealLogByDate(String(user.id), dateString);
                setLog(data);
            }
        } catch (err: any) {
            console.error('Error fetching log:', err);
            setError('No se pudo cargar el historial');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchLogForDate(currentDate);
    }, [currentDate, fetchLogForDate]);

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const handleDeleteMeal = async (mealId: string) => {
        Alert.alert(
            "Eliminar registro",
            "¿Estás seguro de que deseas eliminar este registro de comida?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive",
                    onPress: async () => {
                        // Logic to delete meal would go here, 
                        // for now just alert
                        Alert.alert("Info", "Funcionalidad de eliminación pendiente de migración a servicio.");
                    }
                }
            ]
        );
    };

    const renderHeader = () => (
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.dateSelector}>
            <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateNavButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.dateLabelContainer}>
            <Text style={[styles.dateLabel, { color: colors.onSurface }]}>
                {DateTime.fromJSDate(currentDate).setLocale('es').toLocaleString(DateTime.DATE_HUGE)}
            </Text>
            </View>

            <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateNavButton}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </TouchableOpacity>
        </View>

        {log && log.totals && (
            <View style={[styles.statsContainer, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{log.totals.calories.toFixed(0)}</Text>
                <Text style={[styles.statLabel, { color: colors.outline }]}>kcal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.secondary }]}>{log.totals.protein.toFixed(0)}g</Text>
                <Text style={[styles.statLabel, { color: colors.outline }]}>Proteína</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.tertiary }]}>{log.totals.carbs.toFixed(0)}g</Text>
                <Text style={[styles.statLabel, { color: colors.outline }]}>Carbs</Text>
            </View>
            </View>
        )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}

        {loading ? (
            <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            </View>
        ) : error ? (
            <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.outline} />
            <Text style={[styles.errorText, { color: colors.outline }]}>{error}</Text>
            <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
                onPress={() => fetchLogForDate(currentDate)}
            >
                <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
            </View>
        ) : log && log.meals.length > 0 ? (
            <FlatList
            data={log.meals}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <MealItem 
                item={item} 
                logId={log._id} 
                onDelete={handleDeleteMeal}
                colors={colors}
                />
            )}
            contentContainerStyle={styles.listContent}
            />
        ) : (
            <View style={styles.centerContainer}>
            <Ionicons name="restaurant-outline" size={64} color={colors.outline} />
            <Text style={[styles.emptyText, { color: colors.outline }]}>No hay registros para este día</Text>
            </View>
        )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    dateSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    dateNavButton: { padding: 8 },
    dateLabelContainer: { flex: 1, alignItems: 'center' },
    dateLabel: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
    statsContainer: { flexDirection: 'row', borderRadius: 16, padding: 16, justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '800' },
    statLabel: { fontSize: 12, fontWeight: '600' },
    statDivider: { width: 1, height: '60%', backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center' },
    listContent: { padding: 16 },
    mealCard: { borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    mealTypeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    mealType: { fontSize: 16, fontWeight: '700' },
    mealHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mealTime: { fontSize: 14, fontWeight: '500' },
    deleteButton: { padding: 4 },
    foodList: { gap: 8 },
    foodItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    foodText: { fontSize: 15, flex: 1 },
    foodGrams: { fontSize: 14 },
    mealNotes: { marginTop: 12, fontSize: 14, fontStyle: 'italic' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    errorText: { marginTop: 16, textAlign: 'center', fontSize: 16 },
    emptyText: { marginTop: 16, textAlign: 'center', fontSize: 16 },
    retryButton: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
    retryText: { color: 'white', fontWeight: '700' }
});
