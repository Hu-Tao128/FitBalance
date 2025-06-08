import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Pedometer } from 'expo-sensors';
import { useTheme } from '../context/ThemeContext';

const { colors } = useTheme();

const Home = () => {
  const caloriasObjetivo = 2380;
  const caloriasComidas = 2000;
  const caloriasRestantes = caloriasObjetivo - caloriasComidas;

  // Estados para el podómetro
  const [steps, setSteps] = useState<number>(0);
  const [pastStepCount, setPastStepCount] = useState<number>(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<'checking' | 'available' | 'unavailable'>('checking');

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
            <Text style={[styles.cardText, { color: '#ff5555' }]}>No disponible</Text>
          </TouchableOpacity>
      );
    }

    return (
        <>
          <AnimatedCircularProgress
              size={60}
              width={6}
              fill={(steps / 10000) * 100}
              tintColor="#34C759"
              backgroundColor="#3a3a3c"
              rotation={0}
              lineCap="round"
          >
            {() => (
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
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
          <Ionicons name="person-circle-outline" size={40} color={colors.text} />
          <Text style={styles.title}>FitBalance</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color={colors.text}/>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.caloriesWrapper}>
            <AnimatedCircularProgress
                size={180}
                width={16}
                fill={(caloriasComidas / caloriasObjetivo) * 100}
                tintColor="#34C759"
                backgroundColor="#2c2c2e"
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
            <Text style={[styles.subtext, { color: caloriasRestantes > 0 ? '#4caf50' : '#e53935' }]}>
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
                    tintColor="#4e8ef7"
                    backgroundColor="#3a3a3c"
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
                    tintColor="#34C759"
                    backgroundColor="#3a3a3c"
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
                    tintColor="#f5a623"
                    backgroundColor="#3a3a3c"
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

// Tus estilos permanecen igual
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
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  caloriesWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  caloriesNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtext: {
    marginTop: 6,
    fontSize: 16,
    color: colors.text,
  },
  section: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 16,
    color: colors.text,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  macroText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.text,
  },
});

export default Home;