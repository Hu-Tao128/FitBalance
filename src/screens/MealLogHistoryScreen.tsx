import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_CONFIG } from '../config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type MealLogHistoryScreenRouteProp = RouteProp<RootStackParamList, 'MealLogHistory'>;

// Component for a single meal item
const MealItem = ({ item, logId, onDelete, colors }: { item: any, logId: string | null, onDelete: (mealId: string) => void, colors: any }) => (
    <View style={[styles.mealCard, { backgroundColor: colors.card }]}>
        <View style={styles.mealHeader}>
            <Text style={[styles.mealType, { color: colors.primary }]}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
            <Text style={[styles.mealTime, { color: colors.textSecondary }]}>{item.time}</Text>
        </View>
        <View style={styles.foodList}>
            {item.foods.map((food: any, index: number) => (
                <Text key={food.food_id?._id || index} style={[styles.foodText, { color: colors.text }]}>
                    - {food.food_id?.name || 'Unknown Food'} ({food.grams}g)
                </Text>
            ))}
        </View>
        {logId && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item._id)}>
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </TouchableOpacity>
        )}
    </View>
);

const MealLogHistoryScreen = () => {
    const { colors } = useTheme();
    const { user } = useUser();
    const route = useRoute<MealLogHistoryScreenRouteProp>();

    const [currentDate, setCurrentDate] = useState(new Date(route.params.initialDate));
    const [log, setLog] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogForDate = async (date: Date) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const dateString = date.toISOString().split('T')[0];
            const response = await axios.get(`${API_CONFIG.BASE_URL}/daily-meal-logs/by-date`, {
                params: { patient_id: user.id, date: dateString },
            });
            setLog(response.data);
        } catch (err) {
            setError('Could not load the log for this day.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogForDate(currentDate);
    }, [currentDate, user]);

    const changeDate = (amount: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + amount);
        setCurrentDate(newDate);
    };

    const isToday = () => new Date().toDateString() === currentDate.toDateString();

    const handleDeleteMeal = (mealId: string) => {
        const logId = log?._id;
        if (!logId || !mealId) {
            Alert.alert("Error", `Cannot delete meal because required IDs are missing. LogID: ${logId}, MealID: ${mealId}`);
            return;
        }
        Alert.alert('Delete Meal', 'Are you sure?',
            [{ text: 'Cancel', style: 'cancel' }, {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${API_CONFIG.BASE_URL}/daily-meal-logs/${logId}/meals/${mealId}`);
                        fetchLogForDate(currentDate);
                    } catch (err) {
                        Alert.alert('Error', 'Could not delete meal.');
                        console.error(err);
                    }
                },
            }]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.dateNavigator, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navButton}><Ionicons name="chevron-back" size={28} color={colors.primary} /></TouchableOpacity>
                <Text style={[styles.dateText, { color: colors.text }]}>{currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                <TouchableOpacity onPress={() => changeDate(1)} disabled={isToday()} style={styles.navButton}><Ionicons name="chevron-forward" size={28} color={isToday() ? colors.border : colors.primary} /></TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
            ) : error ? (
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            ) : (
                <FlatList
                    data={log?.meals || []}
                    renderItem={({ item }) => <MealItem item={item} logId={log?._id} onDelete={handleDeleteMeal} colors={colors} />}
                    keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textSecondary }]}>No meals recorded for this day.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    dateNavigator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1 },
    navButton: { padding: 8 },
    dateText: { fontSize: 18, fontWeight: 'bold' },
    errorText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
    mealCard: { marginVertical: 8, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    mealType: { fontSize: 20, fontWeight: 'bold' },
    mealTime: { fontSize: 16 },
    foodList: { paddingLeft: 8 },
    foodText: { fontSize: 16, marginVertical: 4 },
    deleteButton: { position: 'absolute', top: 50, right: 12, padding: 4 },
});

export default MealLogHistoryScreen;