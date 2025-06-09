import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type UserProfileProps = {
  nombre: string;
  email: string;
  edad?: number;
  sexo?: string;
  altura_cm?: number;
  peso_kg?: number;
  objetivo?: string;
  ultima_consulta?: string;
};

const UserProfileCard = ({
  nombre,
  email,
  edad = 0,
  sexo = 'No especificado',
  altura_cm = 0,
  peso_kg = 0,
  objetivo = 'No especificado',
  ultima_consulta = 'No registrada'
}: UserProfileProps) => {
  // Calcular IMC si hay datos suficientes
  const imc = altura_cm > 0 && peso_kg > 0 
    ? (peso_kg / ((altura_cm / 100) ** 2)).toFixed(1)
    : null;

  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
      shadowColor: '#34C759',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 15,
      borderWidth: 2,
      borderColor: colors.border,
    },
    name: {
      fontSize: 22,
      color: colors.text,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    email: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 15,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 6,
      width: '100%',
    },
    infoText: {
      marginLeft: 10,
      color: colors.text,
      fontSize: 15,
      flex: 1,
    },
    sectionTitle: {
      color: colors.primary,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
      marginTop: 15,
      marginBottom: 5,
      fontSize: 16,
    },
    imcBadge: {
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    imcText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    }
  });

  return (
    <View style={styles.card}>
      <Image
        source={require('../../assets/NotFat.gif')}
        style={styles.avatar}
      />
      <Text style={styles.name}>{nombre}</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.infoRow}>
        <Ionicons name="body-outline" size={20} color="#34C759" />
        <Text style={styles.infoText}>{edad} años • {sexo}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="human-male-height" size={20} color="#34C759" />
        <Text style={styles.infoText}>{altura_cm} cm • {peso_kg} kg</Text>
      </View>
      {imc && (
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="human-male-height" size={20} color="#34C759" />
          <Text style={styles.infoText}>
            IMC: {imc} ({getImcCategory(Number(imc))})
          </Text>
        </View>
      )}
      <View style={styles.infoRow}>
        <Ionicons name="barbell-outline" size={20} color="#34C759" />
        <Text style={styles.infoText}>Objetivo: {objetivo}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={20} color="#34C759" />
        <Text style={styles.infoText}>Última consulta: {new Date(ultima_consulta).toLocaleDateString()}</Text>
      </View>
    </View>
  );
};

function getImcCategory(imc: number): string {
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidad';
}

export default UserProfileCard;