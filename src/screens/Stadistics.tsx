import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const screenWidth = Dimensions.get('window').width;

// Parsea "YYYY-MM-DD" a medianoche local
const parseLocalDate = (iso: string): Date => {
    const [year, month, day] = iso.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Devuelve inicio y fin de semana según offset
const getWeekDates = (offset: number) => {
    const base = new Date();
    base.setDate(base.getDate() - offset * 7);
    const dayOfWeek = base.getDay(); // 0 (dom) – 6 (sáb)
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
    const [data, setData] = useState<Array<{ date: string; totals: { calories: number; protein: number; fat: number; carbs: number }; meals: any[]; }>>([]);
    const [loading, setLoading] = useState(true);
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

    // Configuración del gráfico
    const chartConfig = {
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0 as const,
        color: (opacity = 1) => colors.primary,
        labelColor: (opacity = 1) => colors.text,
        propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
        propsForBackgroundLines: { stroke: colors.border, strokeWidth: 0.5 },
        propsForLabels: { fill: colors.text }
    };

    const fetchMealLogs = async (): Promise<void> => {
        setLoading(true);
        try {
        const res = await axios.get(
            `${API_CONFIG.BASE_URL}/daily-meal-logs/all/${user?.id}`
        );
        const sorted = (res.data as Array<any>).sort(
            (a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
        );
            setData(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
        if (user?.id) fetchMealLogs();
        }, [user?.id, weekOffset])
    );

    const { startOfWeek, endOfWeek } = getWeekDates(weekOffset);

    const weeklyData = data.filter(entry => {
        const d = parseLocalDate(entry.date);
        return d >= startOfWeek && d <= endOfWeek;
    });

    const filledWeekData = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const match = weeklyData.find(
        entry => parseLocalDate(entry.date).getTime() === date.getTime()
        );
        return {
        date,
        calories: match ? match.totals.calories : 0,
        protein:  match ? match.totals.protein  : 0,
        fat:      match ? match.totals.fat      : 0,
        carbs:    match ? match.totals.carbs    : 0
        };
    });

    const days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const hasDataForDay = (index: number): boolean => {
        const target = new Date(startOfWeek);
        target.setDate(startOfWeek.getDate() + index);
        return data.some(entry => {
        const d = parseLocalDate(entry.date);
        return (
            d.getTime() === target.getTime() &&
            (entry.totals.calories > 0 || entry.totals.protein > 0 || entry.totals.fat > 0 || entry.totals.carbs > 0)
        );
        });
    };

    if (loading) {
        return (
        <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>  
            <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
        );
    }

    const labels: string[] = filledWeekData.map(e =>
        e.date.toLocaleDateString('en-EN', { weekday: 'short' })
    );
    const caloriesData: number[] = filledWeekData.map(e => e.calories);
    const proteinData: number[] = filledWeekData.map(e => e.protein);
    const fatData: number[]     = filledWeekData.map(e => e.fat);
    const carbsData: number[]   = filledWeekData.map(e => e.carbs);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Título fijo */}
        <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>        
            <Text style={[styles.header, { color: colors.primary }]}>Nutritional Statistics</Text>
        </View>

        <ScrollView
            contentContainerStyle={[styles.container, { backgroundColor: colors.background } ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Navegación y racha */}
            <View style={styles.navAndStreakRow}>
            <Pressable onPress={() => setWeekOffset(weekOffset + 1)}>
                <Text style={[styles.arrow, { color: colors.primary }]}>‹</Text>
            </Pressable>

            <View style={styles.streakContainer}>
                {days.map((day, idx) => {
                const has = hasDataForDay(idx);
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + idx);
                const selected = idx === selectedDayIndex;
                return (
                    <Pressable
                    key={day}
                    style={styles.dayPressable}
                    onPress={() => setSelectedDayIndex(idx)}
                    >
                    <View
                        style={[
                        styles.dayItem,
                        {
                            backgroundColor: has ? colors.primary : colors.border,
                            borderWidth: selected ? 2 : 0,
                            borderColor: selected ? colors.card : 'transparent'
                        }
                        ]}
                    >
                        <Text
                        style={[styles.dayText, { color: has ? colors.card : colors.textSecondary }]}>
                        {date.getDate()}
                        </Text>
                    </View>
                    <Text style={[styles.dayName, { color: colors.text }]}> {day}</Text>
                    </Pressable>
                );
                })}
            </View>

            <Pressable
            disabled={weekOffset === 0}
            onPress={() => setWeekOffset(weekOffset - 1)}
            >
                <Text style={[styles.arrow, { color: weekOffset === 0 ? colors.border : colors.primary }]}>›</Text>
            </Pressable>
        </View>

        {/* Gráficos */}
        <LineChart
            data={{ labels, datasets: [{ data: caloriesData }] }}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
            withVerticalLines
            withHorizontalLines
            fromZero
        />
        <LineChart
            data={{ labels, datasets: [{ data: proteinData }] }}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
            fromZero
        />
        <LineChart
            data={{ labels, datasets: [{ data: fatData }] }}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
            fromZero
        />
        <LineChart
            data={{ labels, datasets: [{ data: carbsData }] }}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
            fromZero
        />

        {/* Comidas del día */}
        {selectedDayIndex !== null && (
            <View style={{ marginTop: 16 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Comidas del {labels[selectedDayIndex]}</Text>
                {weeklyData
                .find(e => parseLocalDate(e.date).getTime() === filledWeekData[selectedDayIndex].date.getTime())
                ?.meals.map((m: any) => (
                    <View key={m._id} style={[styles.mealItem, { backgroundColor: colors.card }]}> 
                    <Text style={[styles.mealName, { color: colors.text }]}>{m.notes || m.type}</Text>
                    <Text style={[styles.mealInfo, { color: colors.textSecondary }]}>{m.time}</Text>
                    </View>
                )) || <Text style={{ color: colors.textSecondary }}>No hay comidas registradas</Text>}
            </View>
            )}
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        padding: 16,
        flexGrow: 1,
        width: '100%'
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold'
    },
    navAndStreakRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    arrow: {
        fontSize: 24,
        padding: 8
    },
    streakContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1
    },
    dayPressable: {
        alignItems: 'center'
    },
    dayItem: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    dayText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    dayName: {
        fontSize: 12,
        marginTop: 4
    },
    chart: {
        marginVertical: 8,
        borderRadius: 12,
        alignSelf: 'center'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8
    },
    mealItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8
    },
    mealName: {
        fontSize: 16,
        fontWeight: '500'
    },
    mealInfo: {
        fontSize: 14,
        marginTop: 4
    }
});

export default StatisticsScreen;
