import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Pedometer } from 'expo-sensors';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
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
  const [steps, setSteps] = useState<number>(0);

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

  useEffect(() => {
    let isMounted = true;
    const subscribe = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        if (isAvailable && isMounted) {
          return Pedometer.watchStepCount(result => {
            if (isMounted) setSteps(result.steps);
          });
        }
      } catch (err) {
        console.log('Pedometer not available', err);
      }
    };

    const subscription = subscribe();
    return () => {
      isMounted = false;
      subscription.then(sub => sub?.remove());
    };
  }, []);

  const styles = createStyles(colors, insets);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const consumedCalories = nutritionData?.totals?.calories || 0;
  const targetCalories = 2000; // Placeholder target
  const progress = (consumedCalories / targetCalories) * 100;

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
          <View style={styles.progressSection}>
            <AnimatedCircularProgress
              size={180}
              width={15}
              fill={progress}
              tintColor={colors.primary}
              backgroundColor={colors.surfaceContainer}
              rotation={0}
              lineCap="round"
            >
              {() => (
                <View style={styles.innerProgress}>
                  <Text style={styles.caloriesValue}>{Math.round(consumedCalories)}</Text>
                  <Text style={styles.caloriesLabel}>kcal consumidas</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>

          <View style={styles.macrosRow}>
            <MacroItem label="Prot" value={nutritionData?.totals?.protein || 0} unit="g" color={colors.secondary} />
            <MacroItem label="Carbs" value={nutritionData?.totals?.carbs || 0} unit="g" color={colors.tertiary} />
            <MacroItem label="Grasas" value={nutritionData?.totals?.fat || 0} unit="g" color="#FF9500" />
          </View>
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Actividad de hoy</Text>
          <View style={styles.activityGrid}>
            <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
              <Ionicons name="footsteps" size={24} color={colors.primary} />
              <Text style={styles.activityValue}>{steps}</Text>
              <Text style={styles.activityLabel}>pasos</Text>
            </View>
            <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
              <Ionicons name="water" size={24} color="#007AFF" />
              <Text style={styles.activityValue}>--</Text>
              <Text style={styles.activityLabel}>vasos agua</Text>
            </View>
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

const MacroItem = ({ label, value, unit, color }: any) => (
  <View style={styles.macroItem}>
    <View style={[styles.macroDot, { backgroundColor: color }]} />
    <Text style={styles.macroValueText}>{Math.round(value)}{unit}</Text>
    <Text style={styles.macroLabelText}>{label}</Text>
  </View>
);

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: insets.top + 10, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.text },
  dateText: { fontSize: 14, color: colors.outline, textTransform: 'capitalize' },
  mainCard: { borderRadius: 30, padding: 25, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  progressSection: { alignItems: 'center', marginBottom: 25 },
  innerProgress: { alignItems: 'center' },
  caloriesValue: { fontSize: 32, fontWeight: '900', color: colors.text },
  caloriesLabel: { fontSize: 14, color: colors.outline, fontWeight: '600' },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 20 },
  macroItem: { alignItems: 'center' },
  macroDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  macroValueText: { fontSize: 16, fontWeight: '700', color: colors.text },
  macroLabelText: { fontSize: 12, color: colors.outline, fontWeight: '600' },
  activitySection: { marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 15 },
  activityGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  activityCard: { width: '47%', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2 },
  activityValue: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 8 },
  activityLabel: { fontSize: 14, color: colors.outline, fontWeight: '600' },
  actionButton: { flexDirection: 'row', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, elevation: 4, gap: 8 },
  actionButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

const styles = StyleSheet.create({
    macroItem: { alignItems: 'center' },
    macroDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
    macroValueText: { fontSize: 16, fontWeight: '700' },
    macroLabelText: { fontSize: 12, fontWeight: '600' },
});
