import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    TouchableOpacity,
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
import { apiClient } from '../../../core/api/apiClient';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';

const screenWidth = Dimensions.get('window').width;

const parseLocalDate = (iso: string): Date => {
    const [year, month, day] = iso.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

const toDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getWeekDates = (baseDate: Date) => {
    const base = new Date(baseDate);
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
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);

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
            const res = await apiClient.get(`/daily-meal-logs/all/${user?.id}`);
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

    const selectedDateKey = toDateKey(selectedDate);
    const { startOfWeek, endOfWeek } = getWeekDates(selectedDate);
    const weeklyData = data.filter(e => {
        const d = parseLocalDate(e.date);
        return d >= startOfWeek && d <= endOfWeek;
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

    const labels = filledWeekData.map(e => e.date.toLocaleDateString('en-EN', { weekday: 'short' }));
    const caloriesData = filledWeekData.map(e => e.calories);
    const proteinData = filledWeekData.map(e => e.protein);
    const fatData = filledWeekData.map(e => e.fat);
    const carbsData = filledWeekData.map(e => e.carbs);
    const markedDates = filledWeekData.reduce<Record<string, any>>((acc, entry) => {
        const key = toDateKey(entry.date);
        acc[key] = {
            marked: entry.calories > 0 || entry.protein > 0 || entry.fat > 0 || entry.carbs > 0,
            dotColor: colors.secondary,
            selected: key === selectedDateKey,
            selectedColor: colors.primary
        };
        return acc;
    }, {});
    const weekRangeLabel = `${startOfWeek.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${endOfWeek.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;

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
                <View style={[styles.calendarContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.calendarHeaderRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.weekLabel, { color: colors.text }]}>Semana seleccionada</Text>
                            <Text style={[styles.weekRangeLabel, { color: colors.textSecondary }]}>Semana: {weekRangeLabel}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.calendarButton, { borderColor: colors.primary }]}
                            onPress={() => setIsCalendarVisible(true)}
                        >
                            <Text style={[styles.calendarButtonText, { color: colors.primary }]}>Calendario</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Racha con número */}
                <View style={[styles.streakContainer, { backgroundColor: colors.card }]}>
                    {filledWeekData.map((entry, idx) => {
                        const has = entry.calories > 0 || entry.protein > 0 || entry.fat > 0 || entry.carbs > 0;
                        const day = entry.date.toLocaleDateString('es-ES', { weekday: 'short' });
                        const dateNum = entry.date.getDate();
                        return (
                            <Pressable key={`${day}-${idx}`} style={styles.streakItem} onPress={() => setSelectedDate(entry.date)}>
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

            <Modal
                visible={isCalendarVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsCalendarVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
                        <Calendar
                            current={selectedDateKey}
                            markedDates={markedDates}
                            onDayPress={(day: DateData) => {
                                const [year, month, date] = day.dateString.split('-').map(Number);
                                setSelectedDate(new Date(year, month - 1, date));
                                setIsCalendarVisible(false);
                            }}
                            renderArrow={(direction) => (
                                <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>
                                    {direction === 'left' ? '‹' : '›'}
                                </Text>
                            )}
                            theme={{
                                calendarBackground: colors.card,
                                monthTextColor: colors.text,
                                dayTextColor: colors.onSurface,
                                textDisabledColor: colors.outlineVariant || colors.outline,
                                arrowColor: colors.primary,
                                todayTextColor: colors.primary,
                                selectedDayTextColor: colors.onPrimary,
                                textMonthFontWeight: '700',
                                textDayHeaderFontWeight: '600'
                            }}
                            enableSwipeMonths
                        />
                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: colors.primary }]}
                            onPress={() => setIsCalendarVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { padding: 16, alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold' },
    calendarContainer: { borderRadius: 12, padding: 12, marginBottom: 16 },
    calendarHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    weekLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    weekRangeLabel: { fontSize: 13, fontWeight: '600' },
    calendarButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
    calendarButtonText: { fontSize: 13, fontWeight: '700' },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 16 },
    modalCard: { borderRadius: 16, padding: 12 },
    closeButton: { marginTop: 10, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    closeButtonText: { color: '#FFFFFF', fontWeight: '700' },
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
