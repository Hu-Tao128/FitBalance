import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { API_CONFIG } from '../config';

const screenWidth = Dimensions.get('window').width;

const StatisticsScreen = () => {
    const { colors } = useTheme();
    const { user } = useUser();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const chartConfig = {
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: (opacity = 1) => colors.primary,
        labelColor: (opacity = 1) => colors.text,
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary,
        },
        propsForBackgroundLines: {
            stroke: colors.border,
            strokeWidth: 0.5,
        },
        propsForLabels: {
            fill: colors.text,
        },
    };

    const styles = StyleSheet.create({
        container: { 
            padding: 16, 
            backgroundColor: colors.background,
            flexGrow: 1,
            width: '100%',
        },
        header: { 
            fontSize: 22, 
            fontWeight: 'bold', 
            marginBottom: 16, 
            color: colors.primary,
            textAlign: 'center'
        },
        streakContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 12,
        },
        dayItem: {
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 20,
        },
        dayText: {
            fontWeight: 'bold',
            color: colors.text,
        },
        dayName: {
            fontSize: 10,
            marginBottom: 4,
            color: colors.textSecondary,
        },
        chartContainer: { 
            marginBottom: 24,
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            width: '100%',
            alignSelf: 'auto',
        },
        chartTitle: { 
            fontSize: 16, 
            fontWeight: '600', 
            marginBottom: 8,
            color: colors.text 
        },
        chart: { 
            borderRadius: 12,
            overflow: 'hidden'
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
    });

    useEffect(() => {
        axios
            .get(`${API_CONFIG.BASE_URL}/daily-meal-logs/all/${user?.id}`)
            .then((res) => {
                const sorted = res.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setData(sorted);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const hasDataForDay = (dayIndex: number) => {
        const today = new Date();
        const targetDate = new Date();
        targetDate.setDate(today.getDate() - (today.getDay() - dayIndex));
        
        return data.some(entry => {
            const entryDate = new Date(entry.date);
            return (
                entryDate.getDate() === targetDate.getDate() &&
                entryDate.getMonth() === targetDate.getMonth() &&
                entryDate.getFullYear() === targetDate.getFullYear() &&
                    (entry.totals.calories > 0 || 
                    entry.totals.protein > 0 || 
                    entry.totals.fat > 0 || 
                    entry.totals.carbs > 0)
            );
        });
    };

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const labels = data.map((entry) =>
        new Date(entry.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    );

    const caloriesData = data.map((entry) => entry.totals.calories);
    const proteinData = data.map((entry) => entry.totals.protein);
    const fatData = data.map((entry) => entry.totals.fat);
    const carbsData = data.map((entry) => entry.totals.carbs);

    const renderChart = (title: string, dataset: number[]) => (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{title}</Text>
            <LineChart
                data={{
                    labels,
                    datasets: [{ 
                        data: dataset,
                        color: (opacity = 1) => colors.primary,
                        strokeWidth: 2,
                    }],
                }}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withVerticalLines={true}
                withHorizontalLines={true}
                withShadow={false}
                segments={4}
            />
        </View>
    );

    return (
        <ScrollView 
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.header}>Estadísticas Nutricionales</Text>
            
            <View style={styles.streakContainer}>
                {days.map((day, index) => {
                    const hasData = hasDataForDay(index);
                    return (
                        <View key={day} style={{ alignItems: 'center' }}>
                            <Text style={styles.dayName}>{day}</Text>
                            <View style={[
                                styles.dayItem,
                                { 
                                    backgroundColor: hasData ? colors.primary : colors.border,
                                }
                            ]}>
                                <Text style={[
                                    styles.dayText,
                                    { color: hasData ? colors.card : colors.textSecondary }
                                ]}>
                                    {new Date().getDate() - (new Date().getDay() - index)}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {renderChart('Calorías', caloriesData)}
            {renderChart('Proteínas (g)', proteinData)}
            {renderChart('Grasas (g)', fatData)}
            {renderChart('Carbohidratos (g)', carbsData)}
        </ScrollView>
    );
};

export default StatisticsScreen;