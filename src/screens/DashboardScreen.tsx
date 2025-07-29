import { Ionicons } from '@expo/vector-icons';
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
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { API_CONFIG } from '../config';
import GoogleFit, { Scopes } from 'react-native-google-fit';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const Home = () => {
  const { colors } = useTheme();
  const { user } = useUser();

  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el podómetro
  const [steps, setSteps] = useState<number>(0);
  const [pastStepCount, setPastStepCount] = useState<number>(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<'checking' | 'available' | 'unavailable'>('checking');

  const estimateCaloriesFromSteps = (steps: number, weightKg: number, heightCm: number) => {
    const MET = 3.5; // caminata moderada
    const strideLengthKm = (heightCm * 0.415) / 100000; // cm a km
    const distanceKm = steps * strideLengthKm;
    const calories = MET * weightKg * (distanceKm / 5); // asume ritmo de 5km/h
    return Math.round(calories);
  };

  const weightKg = user?.weight_kg || 70;
  const heightCm = user?.height_cm || 170;
  const caloriesFromSteps = estimateCaloriesFromSteps(steps, weightKg, heightCm);


  // Función para obtener datos nutricionales
  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      
      if (!user?.id) return;

      const [consumedRes, goalsRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/daily-meal-logs/today/${user.id}`),
        axios.get(`${API_CONFIG.BASE_URL}/weeklyplan/latest/${user.id}`)
      ]);

    //console.log('Datos de consumo:', consumedRes.data);
    //console.log('Metas:', goalsRes.data);

      setNutritionData({
        consumed: consumedRes.data.totals,
        goals: {
          calories: goalsRes.data?.dailyCalories || 2000,
          protein: goalsRes.data?.protein || 150,
          fat: goalsRes.data?.fat || 70,
          carbs: goalsRes.data?.carbs || 250,
        }
      });

    } catch (err) {
      console.error('Error fetching nutrition data:', err);
      setError('No se pudieron cargar los datos nutricionales');
    } finally {
      setLoading(false);
    }
  };


  // Obtener datos nutricionales al cargar el componente
  useFocusEffect(
    React.useCallback(() => {
      fetchNutritionData();
    }, [user?.id])
  );
  
  // Configuración del podómetro
  useEffect(() => {
    const subscribe = async () => {
      try {
        if (Platform.OS === 'android') {
          const response = await Pedometer.requestPermissionsAsync();
          if (!response.granted) {
            setIsPedometerAvailable('unavailable');
            Alert.alert(
              'Permisos requeridos',
              'Necesitamos acceso a los sensores de actividad para contar tus pasos',
              [{ text: 'OK' }]
            );
            return;
          }
        }

        if (Platform.OS === 'android') {
          const options = {
            scopes: [
              Scopes.FITNESS_ACTIVITY_READ,
              Scopes.FITNESS_ACTIVITY_WRITE,
              Scopes.FITNESS_LOCATION_READ,
            ],
          };

          GoogleFit.authorize(options)
            .then(authResult => {
              if (authResult.success) {
                console.log("Google Fit autorizado");
                // Ya puedes leer pasos
                GoogleFit.getDailyStepCountSamples({
                  startDate: new Date().toISOString().split('T')[0] + "T00:00:00.000Z",
                  endDate: new Date().toISOString(),
                }).then(res => {
                  console.log("Respuesta de Google Fit:", JSON.stringify(res, null, 2));

                  const today = new Date().toISOString().split('T')[0];

                  const estimatedSource = res.find(
                    entry => entry.source === "com.google.android.gms:estimated_steps"
                  );

                  if (!estimatedSource) {
                    console.warn("No se encontró la fuente com.google.android.gms:estimated_steps");
                    return;
                  }

                  const stepsToday = estimatedSource.steps
                    .filter(step => step.date === today)
                    .reduce((total, step) => total + step.value, 0);

                  setSteps(stepsToday);
                });
              } else {
                console.warn("Autorización fallida", authResult.message);
              }
            });
        }

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

          return Pedometer.watchStepCount(result => {
            setSteps(result.steps);
          });
        }
      } catch (error) {
        console.error('Error al configurar podómetro:', error);
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

  // Calcular valores
  const caloriasObjetivo = nutritionData?.goals.calories || 2000;
  const caloriasComidas = nutritionData?.consumed.calories || 0;
  const caloriasRestantes = caloriasObjetivo - caloriasComidas;

  const proteinasObjetivo = nutritionData?.goals.protein || 150;
  const proteinasConsumidas = nutritionData?.consumed.protein || 0;

  const carbohidratosObjetivo = nutritionData?.goals.carbs || 250;
  const carbohidratosConsumidos = nutritionData?.consumed.carbs || 0;

  const grasasObjetivo = nutritionData?.goals.fat || 70;
  const grasasConsumidas = nutritionData?.consumed.fat || 0;

  // Colores para las barras (usa tu paleta pro)
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

  // --- MacroBar ahora está aquí dentro ---
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
      color: caloriasRestantes > 0 ? colors.success : colors.danger,
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
      return <Text style={styles.cardText}>Cargando...</Text>;
    }

    if (isPedometerAvailable === 'unavailable') {
      return (
        <TouchableOpacity onPress={() => Alert.alert(
          'Función no disponible',
          'El contador de pasos no está disponible en este dispositivo o requiere permisos adicionales'
        )}>
          <Text style={[styles.cardText, { color: colors.danger }]}>No disponible</Text>
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
          {Math.round((steps / 10000) * 100)}% de tu meta
        </Text>
        <Text style={[styles.cardText, { fontSize: 12 }]}>
          {pastStepCount} pasos en 24h
        </Text>
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Cargando datos nutricionales...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
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
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
        <Text style={styles.title}>FitBalance</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.caloriesWrapper}>
          <AnimatedCircularProgress
            size={180}
            width={16}
            fill={(caloriasComidas / caloriasObjetivo) * 100}
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
            {caloriasObjetivo} cal objetivo | {caloriasComidas} consumidas
          </Text>
          <Text style={styles.statusText}>
            {Math.abs(caloriasRestantes)} cal {caloriasRestantes > 0 ? 'faltantes' : 'excedidas'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macros</Text>
          {/* NUEVO DISEÑO: PROGRESS BARS */}
          <MacroBar
            label="Proteínas"
            icon="restaurant"
            value={proteinasConsumidas}
            goal={proteinasObjetivo}
            color={proteinColor}
            barBg={barBg}
            unit="g"
          />
          <MacroBar
            label="Carbohidratos"
            icon="pizza"
            value={carbohidratosConsumidos}
            goal={carbohidratosObjetivo}
            color={carbsColor}
            barBg={barBg}
            unit="g"
          />
          <MacroBar
            label="Grasas"
            icon="egg"
            value={grasasConsumidas}
            goal={grasasObjetivo}
            color={fatColor}
            barBg={barBg}
            unit="g"
          />
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pasos</Text>
            {renderStepsCard()}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ejercicio</Text>
            <Text style={styles.cardText}>{caloriesFromSteps} cal</Text>
            <Text style={[styles.cardText, { fontSize: 12 }]}>
              Estimado por {steps} pasos
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentario del nutriólogo</Text>
          <Text style={styles.sectionText}>
            {caloriasRestantes > 0
              ? '¡Vas muy bien! Sigue así.'
              : 'Te has excedido, intenta balancear tus próximas comidas.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;
