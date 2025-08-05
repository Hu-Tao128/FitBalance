import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Pedometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
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
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const Home = () => {
  const { colors } = useTheme();
  const { user } = useUser();
  type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Root'>;
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for pedometer
  const [steps, setSteps] = useState<number>(0);
  const [pastStepCount, setPastStepCount] = useState<number>(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<'checking' | 'available' | 'unavailable'>('checking');

  useEffect(() => {
    const subscribe = async () => {
      try {
        if (Platform.OS === 'android') {
          // 1. Permission for step sensors
          const pedometerPerm = await Pedometer.requestPermissionsAsync();
          if (!pedometerPerm.granted) {
            setIsPedometerAvailable('unavailable');
            Alert.alert('Permission required', 'Access to sensors is needed to count steps.');
            return;
          }

          // 2. Only authorize Google Fit if needed
          if (!GoogleFit.isAuthorized) {
            const options = {
              scopes: [
                Scopes.FITNESS_ACTIVITY_READ,
                Scopes.FITNESS_ACTIVITY_WRITE
              ],
            };
            const authResult = await GoogleFit.authorize(options);
            if (!authResult.success) {
              setIsPedometerAvailable('unavailable');
              Alert.alert("Could not authorize Google Fit", authResult.message || "");
              return;
            }
          }

          // 3. Already authorized: get steps
          GoogleFit.getDailyStepCountSamples({
            startDate: new Date().toISOString().split('T')[0] + "T00:00:00.000Z",
            endDate: new Date().toISOString(),
          }).then(res => {
            // Verify Google step source exists
            const today = new Date().toISOString().split('T')[0];
            const estimatedSource = res.find(
              entry => entry.source === "com.google.android.gms:estimated_steps"
            );
            if (!estimatedSource) {
              console.warn("No com.google.android.gms:estimated_steps source found");
              setSteps(0);
              return;
            }
            const stepsToday = estimatedSource.steps
              .filter(step => step.date === today)
              .reduce((total, step) => total + step.value, 0);
            setSteps(stepsToday);
          }).catch(err => {
            console.error("Error getting steps from Google Fit:", err);
            setSteps(0);
          });
        }

        // Check pedometer availability (expo-sensors)
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable ? 'available' : 'unavailable');

        if (isAvailable) {
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - 1);

          const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
          if (pastStepCountResult) {
            setPastStepCount(pastStepCountResult.steps);
          }

          // Subscribe to real-time steps
          return Pedometer.watchStepCount(result => {
            setSteps(result.steps);
          });
        }
      } catch (error) {
        console.error('Error setting up pedometer:', error);
        setIsPedometerAvailable('unavailable');
      }
    };

    const subscriptionPromise = subscribe();

    return () => {
      subscriptionPromise.then(subscription => {
        if (subscription && subscription.remove) {
          subscription.remove();
        }
      });
    };
  }, []);

  // ---------- END GOOGLE FIT ------------

  // Calculate calories from steps (simplified formula)
  const estimateCaloriesFromSteps = (steps: number, weightKg: number, heightCm: number) => {
    const MET = 3.5; // moderate walking
    const strideLengthKm = (heightCm * 0.415) / 100000; // cm to km
    const distanceKm = steps * strideLengthKm;
    const calories = MET * weightKg * (distanceKm / 5); // assumes 5km/h pace
    return Math.round(calories);
  };

  const weightKg = user?.weight_kg || 70;
  const heightCm = user?.height_cm || 170;
  const caloriesFromSteps = estimateCaloriesFromSteps(steps, weightKg, heightCm);

  // Function to get nutrition data
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
        meals:    consumedRes.data.meals,
        goals: {
          calories: goalsRes.data?.dailyCalories || 2000,
          protein: goalsRes.data?.protein || 150,
          fat: goalsRes.data?.fat || 70,
          carbs: goalsRes.data?.carbs || 250,
        }
      });

    } catch (err) {
      console.error('Error fetching nutrition data:', err);
      setError('Could not load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  // Get nutrition data when component loads
  useFocusEffect(
    React.useCallback(() => {
      fetchNutritionData();
    }, [user?.id])
  );

  // Calculate values
  const calorieGoal = nutritionData?.goals.calories || 2000;
  const caloriesConsumed = nutritionData?.consumed.calories || 0;
  const caloriesRemaining = calorieGoal - caloriesConsumed;

  const proteinGoal = nutritionData?.goals.protein || 150;
  const proteinConsumed = nutritionData?.consumed.protein || 0;

  const carbsGoal = nutritionData?.goals.carbs || 250;
  const carbsConsumed = nutritionData?.consumed.carbs || 0;

  const fatGoal = nutritionData?.goals.fat || 70;
  const fatConsumed = nutritionData?.consumed.fat || 0;

  // Colors for bars (use your own palette)
  const proteinColor = colors.progressProtein || '#6DD6B1';
  const carbsColor = colors.progressCarbs || '#FED36A';
  const fatColor = colors.progressFat || '#FF6B81';
  const barBg = colors.progressBg || '#EAF3ED';

  type MacroBarProps = {
    label: string;
    icon: IconName;
    value: number;
    goal: number;
    color: string;
    barBg: string;
    unit: string;
  };

  const MacroBar: React.FC<MacroBarProps> = ({ label, icon, value, goal, color, barBg, unit }) => {
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
      <View style={styles.macroBarContainer}>
        <View style={styles.macroBarTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={icon} size={20} color={color} style={{ marginRight: 3 }} />
            <Text style={[styles.macroBarLabel, { color }]}>{label}</Text>
          </View>
          <Text style={styles.macroBarValue}>
            {value} / {goal} {unit}
          </Text>
        </View>
        <View style={[styles.macroBarBg, { backgroundColor: barBg }]}>
          <Animated.View
            style={[
              styles.macroBarFill,
              {
                width: widthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <Text style={[styles.macroBarPercent, { color }]}>{percent}%</Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 50,
      paddingHorizontal: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
      paddingHorizontal: 6,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    caloriesWrapper: {
      alignItems: 'center',
      marginBottom: 30,
      padding: 12,
      borderRadius: 28,
      backgroundColor: colors.card + 'DD',
      shadowColor: colors.primary,
      shadowOpacity: 0.09,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      borderWidth: 0.5,
      borderColor: colors.border + '55',
    },
    caloriesNumber: {
      fontSize: 46,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 8,
      marginBottom: 2,
      letterSpacing: 1.1,
      textShadowColor: colors.border,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    subtext: {
      marginTop: 6,
      fontSize: 15,
      color: colors.text,
      opacity: 0.8,
      fontWeight: '500',
    },
    section: {
      backgroundColor: colors.card + 'F2',
      padding: 26,
      borderRadius: 24,
      marginBottom: 18,
      shadowColor: colors.border,
      shadowOpacity: 0.10,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
      borderWidth: 0.5,
      borderColor: colors.border + '44',
    },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 18,
      marginBottom: 14,
    },
    card: {
      flex: 1,
      backgroundColor: colors.card + 'F7',
      borderRadius: 18,
      padding: 20,
      alignItems: 'center',
      marginHorizontal: 3,
      shadowColor: colors.border,
      shadowOpacity: 0.10,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 0.5,
      borderColor: colors.border + '33',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 12,
      textAlign: 'left',
      letterSpacing: 0.5,
    },
    sectionText: {
      fontSize: 15,
      color: colors.text,
      opacity: 0.92,
      textAlign: 'left',
      fontWeight: '500',
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.info,
      marginBottom: 9,
      letterSpacing: 0.2,
    },
    cardText: {
      fontSize: 15,
      color: colors.text,
      textAlign: 'center',
      opacity: 0.90,
      fontWeight: '600',
    },
    // --- MACRO BARS ---
    macroBarContainer: {
      marginBottom: 18,
    },
    macroBarTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 7,
      paddingHorizontal: 2,
    },
    macroBarLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.3,
    },
    macroBarValue: {
      fontSize: 15,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    macroBarBg: {
      height: 13,
      borderRadius: 7,
      width: '100%',
      overflow: 'hidden',
      backgroundColor: barBg,
    },
    macroBarFill: {
      height: '100%',
      borderRadius: 7,
    },
    macroBarPercent: {
      marginTop: 3,
      fontSize: 13,
      fontWeight: 'bold',
      opacity: 0.82,
      alignSelf: 'flex-end',
      paddingRight: 2,
    },
    statusText: {
      color: caloriesRemaining > 0 ? colors.success : colors.danger,
      fontWeight: 'bold',
      marginTop: 8,
      fontSize: 16,
      textShadowColor: colors.background,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    errorText: {
      color: colors.danger,
      textAlign: 'center',
      marginTop: 22,
      fontWeight: 'bold',
      fontSize: 16,
      opacity: 0.90,
    },
  });

  const renderStepsCard = () => {
    if (isPedometerAvailable === 'checking') {
      return <Text style={styles.cardText}>Loading...</Text>;
    }

    if (isPedometerAvailable === 'unavailable') {
      return (
        <TouchableOpacity onPress={() => Alert.alert(
          'Feature not available',
          'Step counter is not available on this device or requires additional permissions.'
        )}>
          <Text style={[styles.cardText, { color: colors.danger }]}>Not available</Text>
        </TouchableOpacity>
      );
    }

    return (
      <>
        <AnimatedCircularProgress
          size={60}
          width={6}
          fill={(steps / 10000) * 100}
          tintColor={colors.success}
          backgroundColor={colors.progressBg}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: 'bold' }}>
              {steps}
            </Text>
          )}
        </AnimatedCircularProgress>
        <Text style={[styles.cardText, { marginTop: 5 }]}>
          {Math.round((steps / 10000) * 100)}% of your goal
        </Text>
        <Text style={[styles.cardText, { fontSize: 12 }]}>
          {pastStepCount} steps in 24h
        </Text>
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading nutrition data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
            <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>FitBalance</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
            alignSelf: 'center'
          }}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchNutritionData();
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
          <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>FitBalance</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MealLogHistory', {
            initialDate: new Date().toISOString(),
          })}
        >
          <View style={styles.caloriesWrapper}>
            <AnimatedCircularProgress
              size={180}
              width={16}
              fill={(caloriesConsumed / calorieGoal) * 100}
              tintColor={colors.primary}
              backgroundColor={colors.progressBg}
              rotation={0}
              lineCap="round"
            >
              {(fill: number) => (
                <Text style={styles.caloriesNumber}>{Math.round(fill)}%</Text>
              )}
            </AnimatedCircularProgress>
            <Text style={styles.subtext}>
              {calorieGoal} calorie goal | {caloriesConsumed} consumed
            </Text>
            <Text style={styles.statusText}>
              {Math.abs(caloriesRemaining)} cal {caloriesRemaining > 0 ? 'remaining' : 'over'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macros</Text>
          <MacroBar
            label="Protein"
            icon="restaurant"
            value={proteinConsumed}
            goal={proteinGoal}
            color={proteinColor}
            barBg={barBg}
            unit="g"
          />
          <MacroBar
            label="Carbs"
            icon="pizza"
            value={carbsConsumed}
            goal={carbsGoal}
            color={carbsColor}
            barBg={barBg}
            unit="g"
          />
          <MacroBar
            label="Fat"
            icon="egg"
            value={fatConsumed}
            goal={fatGoal}
            color={fatColor}
            barBg={barBg}
            unit="g"
          />
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Steps</Text>
            {renderStepsCard()}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Exercise</Text>
            <Text style={styles.cardText}>{caloriesFromSteps} cal</Text>
            <Text style={[styles.cardText, { fontSize: 12 }]}>
              Estimated from {steps} steps
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;