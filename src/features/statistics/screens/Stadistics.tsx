import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { API_CONFIG } from '../../../config/config';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';

const screenWidth = Dimensions.get('window').width;

const parseLocalDate = (iso: string): Date => {
    const [year, month, day] = iso.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

const getWeekDates = (offset: number) => {
    const base = new Date();
    base.setDate(base.getDate() - offset * 7);
    const dayOfWeek = base.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const start = new Date(base);
    start.setDate(base.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { startOfWeek: start, endOfWeek: end };
};

const StatisticsScreen: React.FC = () => {
    const { colors } = useTheme();
    const { user } = useUser();
    const insets = useSafeAreaInsets();

    const [data, setData] = useState<Array<{ date: string; totals: { calories: number; protein: number; fat: number; carbs: number }; meals: any[] }>>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

    const chartConfig = {
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0 as const,
        color: (opacity = 1) => colors.primary,
        labelColor: (opacity = 1) => colors.textSecondary || colors.text,
        propsForDots: { r: '6', strokeWidth: '2', stroke: colors.primary },
        propsForBackgroundLines: { stroke: colors.border, strokeWidth: 1 },
        propsForLabels: { fontSize: '12' }
    };

    const fetchMealLogs = useCallback(async () => {
        try {
            const res = await axios.get(`${API_CONFIG.BASE_URL}/daily-meal-logs/all/${user?.id}`);
            const sorted = (res.data as Array<any>).sort(
                (a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
            );
            setData(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                fetchMealLogs();
            }
        }, [user?.id, fetchMealLogs])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMealLogs();
    }, [fetchMealLogs]);

    const { startOfWeek } = getWeekDates(weekOffset);
    const weeklyData = data.filter(e => {
        const d = parseLocalDate(e.date);
        return d >= startOfWeek && d <= getWeekDates(weekOffset).endOfWeek;
    });
    const filledWeekData = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const match = weeklyData.find(e => parseLocalDate(e.date).getTime() === date.getTime());
        return {
            date,
            calories: match ? match.totals.calories : 0,
            protein: match ? match.totals.protein : 0,
            fat: match ? match.totals.fat : 0,
            carbs: match ? match.totals.carbs : 0
        };
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const labels = filledWeekData.map(e => e.date.toLocaleDateString('en-EN', { weekday: 'short' }));
    const caloriesData = filledWeekData.map(e => e.calories);
    const proteinData = filledWeekData.map(e => e.protein);
    const fatData = filledWeekData.map(e => e.fat);
    const carbsData = filledWeekData.map(e => e.carbs);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
                    <Text style={[styles.header, { color: colors.primary }]}>Nutritional Statistics</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.header, { color: colors.primary }]}>Nutritional Statistics</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Semana + navegación */}
                <View style={styles.navRow}>
                    <Pressable
                        style={styles.navButton}
                        onPress={() => setWeekOffset(prev => prev + 1)}
                    >
                        <Text style={[styles.navArrow, { color: colors.primary }]}>‹</Text>
                    </Pressable>
                    <View style={styles.weekInfo}>
                        <Text style={[styles.weekLabel, { color: colors.text }]}>Week</Text>
                        {refreshing && (
                            <ActivityIndicator size="small" color={colors.primary} style={styles.weekSpinner} />
                        )}
                    </View>
                    <Pressable
                        style={styles.navButton}
                        disabled={weekOffset === 0}
                        onPress={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                    >
                        <Text style={[styles.navArrow, { color: weekOffset === 0 ? colors.border : colors.primary }]}>›</Text>
                    </Pressable>
                </View>

                {/* Racha con número */}
                <View style={[styles.streakContainer, { backgroundColor: colors.card }]}>
                    {filledWeekData.map((entry, idx) => {
                        const has = entry.calories > 0 || entry.protein > 0 || entry.fat > 0 || entry.carbs > 0;
                        const day = days[idx];
                        const dateNum = entry.date.getDate();
                        return (
                            <Pressable key={day} style={styles.streakItem} onPress={() => setSelectedDayIndex(idx)}>
                                <View style={[styles.streakCircle, { backgroundColor: has ? colors.primary : colors.border }]}>
                                    <Text style={[styles.streakNumber, { color: has ? colors.onPrimary : colors.textSecondary }]}>
                                        {dateNum}
                                    </Text>
                                </View>
                                <Text style={[styles.streakDay, { color: colors.textSecondary }]}>{day}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Charts */}
                {[
                    { title: 'Calories', unit: 'kcal', data: caloriesData },
                    { title: 'Proteins', unit: 'g', data: proteinData },
                    { title: 'Fats', unit: 'g', data: fatData },
                    { title: 'Carbs', unit: 'g', data: carbsData }
                ].map((series) => (
                    series.data.every(v => v === 0) ? (
                        <View key={series.title} style={[styles.noDataBox, { backgroundColor: colors.card }]}>
                            <Text style={[styles.noDataText, { color: colors.textSecondary }]}>No data for {series.title}</Text>
                        </View>
                    ) : (
                        <View key={series.title} style={[styles.chartBox, { backgroundColor: colors.card }]}>
                            <Text style={[styles.chartHeader, { color: colors.text }]}>{series.title} ({series.unit})</Text>
                            <LineChart
                                data={{ labels, datasets: [{ data: series.data }] }}
                                width={screenWidth - 48}
                                height={200}
                                yAxisSuffix={series.unit}
                                chartConfig={chartConfig}
                                style={styles.chartStyle}
                                bezier
                                fromZero
                            />
                        </View>
                    )
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { padding: 16, alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold' },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    navButton: { padding: 8 },
    navArrow: { fontSize: 28, fontWeight: '300' },
    weekInfo: { flexDirection: 'row', alignItems: 'center' },
    weekLabel: { fontSize: 18, fontWeight: '600' },
    weekSpinner: { marginLeft: 8 },
    streakContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, borderRadius: 12, marginBottom: 16 },
    streakItem: { alignItems: 'center' },
    streakCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    streakNumber: { fontSize: 14, fontWeight: '600' },
    streakDay: { fontSize: 11 },
    chartBox: { marginVertical: 8, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
    chartHeader: { fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
    chartStyle: { borderRadius: 12 },
    noDataBox: { marginVertical: 8, padding: 20, borderRadius: 12, alignItems: 'center' },
    noDataText: { fontSize: 16 }
});

export default StatisticsScreen;
