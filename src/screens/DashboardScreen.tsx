import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Pedometer } from 'expo-sensors';
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const Home = () => {
  const { colors } = useTheme();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Root'>;
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [steps, setSteps] = useState<number>(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<'checking' | 'available' | 'unavailable'>('checking');

  useEffect(() => {
    const subscribe = async () => {
      try {
        if (Platform.OS === 'android') {
          const pedometerPerm = await Pedometer.requestPermissionsAsync();
          if (!pedometerPerm.granted) {
            setIsPedometerAvailable('unavailable');
            return;
          }

          if (!GoogleFit.isAuthorized) {
            const options = {
              scopes: [Scopes.FITNESS_ACTIVITY_READ, Scopes.FITNESS_ACTIVITY_WRITE],
            };
            const authResult = await GoogleFit.authorize(options);
            if (!authResult.success) {
              setIsPedometerAvailable('unavailable');
              return;
            }
          }

          GoogleFit.getDailyStepCountSamples({
            startDate: new Date().toISOString().split('T')[0] + "T00:00:00.000Z",
            endDate: new Date().toISOString(),
          }).then(res => {
            const today = new Date().toISOString().split('T')[0];
            const estimatedSource = res.find(entry => entry.source === "com.google.android.gms:estimated_steps");
            if (!estimatedSource) {
              setSteps(0);
              return;
            }
            const stepsToday = estimatedSource.steps
              .filter(step => step.date === today)
              .reduce((total, step) => total + step.value, 0);
            setSteps(stepsToday);
          }).catch(() => setSteps(0));
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable ? 'available' : 'unavailable');

        if (isAvailable) {
          return Pedometer.watchStepCount(result => {
            setSteps(result.steps);
          });
        }
      } catch {
        setIsPedometerAvailable('unavailable');
      }
    };

    subscribe().then(subscription => {
      return () => { if (subscription?.remove) subscription.remove(); };
    });
  }, []);

  const estimateCaloriesFromSteps = (steps: number, weightKg: number, heightCm: number) => {
    const MET = 3.5;
    const strideLengthKm = (heightCm * 0.415) / 100000;
    const distanceKm = steps * strideLengthKm;
    return Math.round(MET * weightKg * (distanceKm / 5));
  };

  const weightKg = user?.weight_kg || 70;
  const heightCm = user?.height_cm || 170;
  const caloriesFromSteps = estimateCaloriesFromSteps(steps, weightKg, heightCm);

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user?.id) return;

      const [consumedRes, goalsRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/daily-meal-logs/today/${user.id}`),
        axios.get(`${API_CONFIG.BASE_URL}/weeklyplan/latest/${user.id}`)
      ]);
      setNutritionData({
        consumed: consumedRes.data.totals,
        meals: consumedRes.data.meals,
        goals: {
          calories: goalsRes.data?.dailyCalories || 2000,
          protein: goalsRes.data?.protein || 150,
          fat: goalsRes.data?.fat || 70,
          carbs: goalsRes.data?.carbs || 250,
        }
      });
    } catch {
      setError('No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => { if (user?.id) fetchNutritionData(); }, [user?.id])
  );

  const calorieGoal = nutritionData?.goals.calories || 2000;
  const caloriesConsumed = nutritionData?.consumed.calories || 0;
  const caloriesRemaining = calorieGoal - caloriesConsumed;
  const proteinConsumed = nutritionData?.consumed.protein || 0;
  const carbsConsumed = nutritionData?.consumed.carbs || 0;
  const fatConsumed = nutritionData?.consumed.fat || 0;

  const proteinColor = '#4CAF50';
  const carbsColor = '#FFC107';
  const fatColor = '#FF7043';
  const barBg = colors.surfaceContainerHighest || '#E0E0E0';

  type MacroBarProps = { label: string; icon: string; value: number; goal: number; color: string; unit: string; };

  const MacroBar: React.FC<MacroBarProps> = ({ label, icon, value, goal, color, unit }) => {
    const percent = Math.min(100, Math.round((value / goal) * 100));
    const widthAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(widthAnim, {
        toValue: percent,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, [percent]);

    return (
      <View style={macroStyles.barContainer}>
        <View style={macroStyles.barHeader}>
          <View style={macroStyles.barLabelRow}>
            <View style={[macroStyles.iconBox, { backgroundColor: color + '20' }]}>
              <MaterialCommunityIcons name={icon as any} size={18} color={color} />
            </View>
            <Text style={[macroStyles.barLabel, { color }]}>{label}</Text>
          </View>
          <Text style={macroStyles.barValue}>{value}/{goal}{unit}</Text>
        </View>
        <View style={[macroStyles.barBg, { backgroundColor: barBg }]}>
          <Animated.View
            style={[
              macroStyles.barFill,
              {
                width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const macroStyles = useMemo(() => StyleSheet.create({
    barContainer: { marginBottom: 16 },
    barHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    barLabelRow: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    barLabel: { fontSize: 15, fontWeight: '700' },
    barValue: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
    barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 5 },
  }), [colors.textSecondary, barBg]);

  const screenStyles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 20, paddingBottom: 120 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    greeting: { fontSize: 24, fontWeight: '800', color: colors.onSurface, letterSpacing: -0.5 },
    dateText: { fontSize: 14, color: colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
    notificationBtn: { padding: 4 },
    heroCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    heroLeft: { flex: 1 },
    heroLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginBottom: 4 },
    heroValue: { fontSize: 42, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
    heroGoal: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    heroRight: { alignItems: 'center' },
    progressCenter: { alignItems: 'center', justifyContent: 'center' },
    progressPercent: { fontSize: 22, fontWeight: '800', color: colors.primary },
    heroBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
    heroStatus: { marginLeft: 8, fontSize: 14, fontWeight: '600' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    macrosCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    activityRow: { flexDirection: 'row', gap: 12 },
    activityCard: { flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    activityIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    activityValue: { fontSize: 24, fontWeight: '800', color: colors.onSurface },
    activityLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    quickAction: { width: '47%', backgroundColor: colors.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    quickIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    quickText: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
  }), [colors]);

  if (loading) {
    return (
      <View style={[screenStyles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Cargando...</Text>
      </View>
    );
  }

  const userName = user?.name || user?.username || 'Usuario';
  const displayName = userName.split(' ')[0];

  return (
    <View style={[screenStyles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={screenStyles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={screenStyles.header}>
          <View>
            <Text style={screenStyles.greeting}>Hola, {displayName}</Text>
            <Text style={screenStyles.dateText}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <TouchableOpacity style={screenStyles.notificationBtn} onPress={() => navigation.navigate('UserProfile')}>
            <Ionicons name="person-circle" size={36} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calorie Hero Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('MealLogHistory', { initialDate: new Date().toISOString() })}
          style={screenStyles.heroCard}
        >
          <View style={screenStyles.heroContent}>
            <View style={screenStyles.heroLeft}>
              <Text style={screenStyles.heroLabel}>Calorías</Text>
              <Text style={screenStyles.heroValue}>{caloriesConsumed}</Text>
              <Text style={screenStyles.heroGoal}>de {calorieGoal} kcal</Text>
            </View>
            <View style={screenStyles.heroRight}>
              <AnimatedCircularProgress
                size={100}
                width={10}
                fill={(caloriesConsumed / calorieGoal) * 100}
                tintColor={colors.primary}
                backgroundColor={colors.surfaceContainerHighest}
                rotation={0}
                lineCap="round"
              >
                {(fill: number) => (
                  <View style={screenStyles.progressCenter}>
                    <Text style={screenStyles.progressPercent}>{Math.round(fill)}%</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>
          <View style={screenStyles.heroBottom}>
            <Ionicons name={caloriesRemaining >= 0 ? 'checkmark-circle' : 'alert-circle'} size={20} color={caloriesRemaining >= 0 ? colors.success : colors.error} />
            <Text style={[screenStyles.heroStatus, { color: caloriesRemaining >= 0 ? colors.success : colors.error }]}>
              {Math.abs(caloriesRemaining)} kcal {caloriesRemaining >= 0 ? 'restantes' : 'de exceso'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Macros Section */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Macronutrientes</Text>
          <View style={screenStyles.macrosCard}>
            <MacroBar label="Proteína" icon="food-drumstick" value={proteinConsumed} goal={nutritionData?.goals.protein || 150} color={proteinColor} unit="g" />
            <MacroBar label="Carbohidratos" icon="bread-slice" value={carbsConsumed} goal={nutritionData?.goals.carbs || 250} color={carbsColor} unit="g" />
            <MacroBar label="Grasas" icon="oil" value={fatConsumed} goal={nutritionData?.goals.fat || 70} color={fatColor} unit="g" />
          </View>
        </View>

        {/* Activity Section */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Actividad</Text>
          <View style={screenStyles.activityRow}>
            <View style={screenStyles.activityCard}>
              <View style={[screenStyles.activityIcon, { backgroundColor: colors.primaryContainer }]}>
                <MaterialCommunityIcons name="shoe-print" size={24} color={colors.primary} />
              </View>
              <Text style={screenStyles.activityValue}>{steps.toLocaleString()}</Text>
              <Text style={screenStyles.activityLabel}>pasos</Text>
            </View>
            <View style={screenStyles.activityCard}>
              <View style={[screenStyles.activityIcon, { backgroundColor: colors.secondaryContainer }]}>
                <MaterialCommunityIcons name="fire" size={24} color={colors.secondary} />
              </View>
              <Text style={screenStyles.activityValue}>{caloriesFromSteps}</Text>
              <Text style={screenStyles.activityLabel}>kcal ejercicio</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Acciones Rápidas</Text>
          <View style={screenStyles.quickActions}>
            <TouchableOpacity style={screenStyles.quickAction} onPress={() => navigation.navigate('FoodSearchOptions')}>
              <View style={[screenStyles.quickIcon, { backgroundColor: colors.primaryContainer }]}>
                <Ionicons name="search" size={22} color={colors.primary} />
              </View>
              <Text style={screenStyles.quickText}>Buscar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={screenStyles.quickAction} onPress={() => navigation.navigate('FoodScanner')}>
              <View style={[screenStyles.quickIcon, { backgroundColor: colors.tertiaryContainer }]}>
                <Ionicons name="barcode" size={22} color={colors.tertiary} />
              </View>
              <Text style={screenStyles.quickText}>Escanear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={screenStyles.quickAction} onPress={() => navigation.navigate('optionsFood')}>
              <View style={[screenStyles.quickIcon, { backgroundColor: colors.secondaryContainer }]}>
                <MaterialCommunityIcons name="plus" size={22} color={colors.secondary} />
              </View>
              <Text style={screenStyles.quickText}>Crear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={screenStyles.quickAction} onPress={() => navigation.navigate('ManageMeals')}>
              <View style={[screenStyles.quickIcon, { backgroundColor: colors.surfaceContainerHighest }]}>
                <Ionicons name="list" size={22} color={colors.onSurfaceVariant} />
              </View>
              <Text style={screenStyles.quickText}>Mis Comidas</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default Home;
