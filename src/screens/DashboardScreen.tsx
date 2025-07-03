import { Ionicons } from '@expo/vector-icons';
import { Pedometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.17:3000'; // Reemplaza con tu URL

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

  // Función para obtener datos nutricionales
  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API_BASE_URL}/daily-nutrition`, {
        params: {
          patient_id: user?.id,
          date: today
        }
      });
      
      setNutritionData(response.data);
    } catch (err) {
      console.error('Error fetching nutrition data:', err);
      setError('No se pudieron cargar los datos nutricionales');
    } finally {
      setLoading(false);
    }
  };

  // Obtener datos nutricionales al cargar el componente
  useEffect(() => {
    fetchNutritionData();
  }, [user?.id]);

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
  const caloriasComidas = nutritionData?.consumed.calories || 100;
  const caloriasRestantes = caloriasObjetivo - caloriasComidas;
  
  const proteinasObjetivo = nutritionData?.goals.protein || 150;
  const proteinasConsumidas = nutritionData?.consumed.protein || 0;
  const proteinasPorcentaje = Math.min(100, Math.round((proteinasConsumidas / proteinasObjetivo) * 100));
  
  const carbohidratosObjetivo = nutritionData?.goals.carbs || 250;
  const carbohidratosConsumidos = nutritionData?.consumed.carbs || 0;
  const carbohidratosPorcentaje = Math.min(100, Math.round((carbohidratosConsumidos / carbohidratosObjetivo) * 100));
  
  const grasasObjetivo = nutritionData?.goals.fat || 70;
  const grasasConsumidas = nutritionData?.consumed.fat || 0;
  const grasasPorcentaje = Math.min(100, Math.round((grasasConsumidas / grasasObjetivo) * 100));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 50,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.primary,
      letterSpacing: 0.2,
    },
    caloriesWrapper: {
      alignItems: 'center',
      marginBottom: 30,
    },
    caloriesNumber: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 10,
      marginBottom: 5,
    },
    subtext: {
      marginTop: 8,
      fontSize: 15,
      color: colors.text,
      opacity: 0.85,
    },
    section: {
      backgroundColor: colors.card,
      padding: 22,
      borderRadius: 18,
      marginBottom: 16,
      shadowColor: colors.border,
      shadowOpacity: 0.09,
      shadowRadius: 7,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 12,
    },
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 18,
      alignItems: 'center',
      marginHorizontal: 2,
      shadowColor: colors.border,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 10,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    sectionText: {
      fontSize: 15,
      color: colors.text,
      opacity: 0.9,
      textAlign: 'center',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.info,
      marginBottom: 7,
      letterSpacing: 0.1,
    },
    cardText: {
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
      opacity: 0.85,
    },
    macroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      gap: 8,
    },
    macroItem: {
      alignItems: 'center',
      flex: 1,
    },
    macroLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
      letterSpacing: 0.1,
    },
    macroText: {
      marginTop: 7,
      fontSize: 14,
      color: colors.text,
      opacity: 0.87,
    },
    macroLegend: {
      width: 12, height: 12, borderRadius: 6, marginRight: 5,
    },
    statusText: {
      color: caloriasRestantes > 0 ? colors.success : colors.danger,
      fontWeight: 'bold',
      marginTop: 4,
      fontSize: 15,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: colors.danger,
      textAlign: 'center',
      marginTop: 20,
    }
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

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <AnimatedCircularProgress
                size={70}
                width={6}
                fill={proteinasPorcentaje}
                tintColor={colors.progressProtein}
                backgroundColor={colors.progressBg}
                rotation={0}
                lineCap="round"
              >
                {() => <Text style={styles.macroLabel}>{proteinasPorcentaje}%</Text>}
              </AnimatedCircularProgress>
              <Text style={styles.macroText}>
                {proteinasConsumidas}g / {proteinasObjetivo}g
              </Text>
            </View>

            <View style={styles.macroItem}>
              <AnimatedCircularProgress
                size={70}
                width={6}
                fill={carbohidratosPorcentaje}
                tintColor={colors.progressCarbs}
                backgroundColor={colors.progressBg}
                rotation={0}
                lineCap="round"
              >
                {() => <Text style={styles.macroLabel}>{carbohidratosPorcentaje}%</Text>}
              </AnimatedCircularProgress>
              <Text style={styles.macroText}>
                {carbohidratosConsumidos}g / {carbohidratosObjetivo}g
              </Text>
            </View>

            <View style={styles.macroItem}>
              <AnimatedCircularProgress
                size={70}
                width={6}
                fill={grasasPorcentaje}
                tintColor={colors.progressFat}
                backgroundColor={colors.progressBg}
                rotation={0}
                lineCap="round"
              >
                {() => <Text style={styles.macroLabel}>{grasasPorcentaje}%</Text>}
              </AnimatedCircularProgress>
              <Text style={styles.macroText}>
                {grasasConsumidas}g / {grasasObjetivo}g
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pasos</Text>
            {renderStepsCard()}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ejercicio</Text>
            <Text style={styles.cardText}>0 cal</Text>
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