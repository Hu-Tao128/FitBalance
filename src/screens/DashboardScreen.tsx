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
  View
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { colors } = useTheme();
  const caloriasObjetivo = 2380;
  const caloriasComidas = 2000;
  const caloriasRestantes = caloriasObjetivo - caloriasComidas;

  // Estados para el podómetro
  const [steps, setSteps] = useState<number>(0);
  const [pastStepCount, setPastStepCount] = useState<number>(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<'checking' | 'available' | 'unavailable'>('checking');

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
    }
  });

  // Configuración del podómetro
  useEffect(() => {
    const subscribe = async () => {
      try {
        // Solicitar permisos en Android
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

        // Verificar disponibilidad
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable ? 'available' : 'unavailable');

        if (isAvailable) {
          // Obtener pasos de las últimas 24 horas
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - 1);

          const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
          if (pastStepCountResult) {
            setPastStepCount(pastStepCountResult.steps);
          }

          // Suscribirse a actualizaciones en tiempo real
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
                fill={60}
                tintColor={colors.progressProtein}
                backgroundColor={colors.progressBg}
                rotation={0}
                lineCap="round"
              >
                {() => <Text style={styles.macroLabel}>60%</Text>}
              </AnimatedCircularProgress>
              <Text style={styles.macroText}>Proteínas</Text>
            </View>

            <View style={styles.macroItem}>
              <AnimatedCircularProgress
                size={70}
                width={6}
                fill={75}
                tintColor={colors.progressCarbs}
                backgroundColor={colors.progressBg}
                rotation={0}
                lineCap="round"
              >
                {() => <Text style={styles.macroLabel}>75%</Text>}
              </AnimatedCircularProgress>
              <Text style={styles.macroText}>Carbs</Text>
            </View>

            <View style={styles.macroItem}>
              <AnimatedCircularProgress
                size={70}
                width={6}
                fill={45}
                tintColor={colors.progressFat}
                backgroundColor={colors.progressBg}
                rotation={0}
                lineCap="round"
              >
                {() => <Text style={styles.macroLabel}>45%</Text>}
              </AnimatedCircularProgress>
              <Text style={styles.macroText}>Grasas</Text>
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
