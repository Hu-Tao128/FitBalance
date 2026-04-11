import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { dashboardService } from '../services/dashboard.service';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Root'>;

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
        const data = await dashboardService.getDailySummary(user.id);
        setNutritionData(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    } finally {
        setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
        fetchDashboardData();
    }, [fetchDashboardData])
  );

  const styles = createStyles(colors, insets);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const consumedCalories = nutritionData?.totals?.calories || 0;
  const calorieGoal = nutritionData?.goals?.calories || 2000;
  const safeCalorieGoal = calorieGoal > 0 ? calorieGoal : 1;
  const caloriesRemaining = calorieGoal - consumedCalories;
  const proteinConsumed = nutritionData?.totals?.protein || 0;
  const carbsConsumed = nutritionData?.totals?.carbs || 0;
  const fatConsumed = nutritionData?.totals?.fat || 0;
  const proteinColor = colors.secondary;
  const carbsColor = colors.tertiary;
  const fatColor = '#FF9500';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.name || 'Usuario'}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
            <Ionicons name="person-circle-outline" size={45} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.mainCard, { backgroundColor: colors.card }]}>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Calorías</Text>
              <Text style={styles.heroValue}>{Math.round(consumedCalories)}</Text>
              <Text style={styles.heroGoal}>de {Math.round(calorieGoal)} kcal</Text>
            </View>
            <View style={styles.heroRight}>
              <AnimatedCircularProgress
                size={100}
                width={10}
                fill={Math.min(100, (consumedCalories / safeCalorieGoal) * 100)}
                tintColor={colors.primary}
                backgroundColor={colors.surfaceContainerHighest}
                rotation={0}
                lineCap="round"
              >
                {(fill: number) => (
                  <View style={styles.progressCenter}>
                    <Text style={styles.progressPercent}>{Math.round(fill)}%</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>

          <View style={styles.heroBottom}>
            <Ionicons
              name={caloriesRemaining >= 0 ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={caloriesRemaining >= 0 ? (colors.success || colors.primary) : colors.error}
            />
            <Text
              style={[
                styles.heroStatus,
                { color: caloriesRemaining >= 0 ? (colors.success || colors.primary) : colors.error }
              ]}
            >
              {Math.abs(Math.round(caloriesRemaining))} kcal {caloriesRemaining >= 0 ? 'restantes' : 'de exceso'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macronutrientes</Text>
          <View style={[styles.macrosCard, { backgroundColor: colors.card }]}>
            <MacroBar
              label="Proteína"
              icon="food-drumstick"
              value={proteinConsumed}
              goal={nutritionData?.goals?.protein || 150}
              color={proteinColor}
              unit="g"
              styles={styles}
              colors={colors}
            />
            <MacroBar
              label="Carbohidratos"
              icon="bread-slice"
              value={carbsConsumed}
              goal={nutritionData?.goals?.carbs || 250}
              color={carbsColor}
              unit="g"
              styles={styles}
              colors={colors}
            />
            <MacroBar
              label="Grasas"
              icon="oil"
              value={fatConsumed}
              goal={nutritionData?.goals?.fat || 70}
              color={fatColor}
              unit="g"
              styles={styles}
              colors={colors}
            />
          </View>
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Meal Log</Text>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            <View style={styles.mealLogHeader}>
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
              <Text style={[styles.mealLogTitle, { color: colors.text }]}>Historial diario de comidas</Text>
            </View>
            <Text style={[styles.mealLogDescription, { color: colors.outline }]}>
              Consulta tu registro diario y ve tus comidas por día.
            </Text>
            <TouchableOpacity
              style={[styles.mealLogButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('MealLogHistory', { initialDate: new Date().toISOString() })}
            >
              <Text style={styles.mealLogButtonText}>Abrir Meal Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('FoodSearchOptions')}
        >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.actionButtonText}>Registrar Comida</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const MacroBar = ({ label, icon, value, goal, color, unit, styles, colors }: any) => {
  const safeGoal = goal > 0 ? goal : 1;
  const progress = Math.max(0, Math.min(100, (value / safeGoal) * 100));
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroRowHeader}>
        <View style={styles.macroRowLeft}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
          <Text style={[styles.macroRowLabel, { color: colors.text }]}>{label}</Text>
        </View>
        <Text style={[styles.macroRowValue, { color: colors.text }]}>
          {Math.round(value)} / {Math.round(goal)} {unit}
        </Text>
      </View>
      <View style={[styles.macroTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
        <View style={[styles.macroFill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: insets.top + 10, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.text },
  dateText: { fontSize: 14, color: colors.outline, textTransform: 'capitalize' },
  mainCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: colors.surfaceContainerLowest || colors.card,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8
  },
  heroContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  heroValue: { fontSize: 38, fontWeight: '900', color: colors.text, lineHeight: 44 },
  heroGoal: { fontSize: 14, color: colors.outline, marginTop: 2, fontWeight: '500' },
  heroRight: { marginLeft: 14 },
  progressCenter: { alignItems: 'center', justifyContent: 'center' },
  progressPercent: { fontSize: 18, fontWeight: '800', color: colors.text },
  heroBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  heroStatus: { fontSize: 14, fontWeight: '700' },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  macrosCard: { borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
  macroRow: { marginBottom: 14 },
  macroRowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  macroRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  macroRowLabel: { fontSize: 14, fontWeight: '700' },
  macroRowValue: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  macroTrack: { height: 8, borderRadius: 8, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: 8 },
  activitySection: { marginTop: 26 },
  activityCard: { padding: 20, borderRadius: 20, elevation: 2 },
  mealLogHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  mealLogTitle: { fontSize: 16, fontWeight: '700' },
  mealLogDescription: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  mealLogButton: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  mealLogButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  actionButton: { flexDirection: 'row', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, elevation: 4, gap: 8 },
  actionButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
