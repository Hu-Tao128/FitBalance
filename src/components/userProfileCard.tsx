import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type UserProfileProps = {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  objective?: string;
  allergies?: string[];
  dietary_restrictions?: string[];
  last_consultation?: string | null;
  nutritionist_id?: string;
  isActive?: boolean;
};

const UserProfileCard = ({
  id,
  name,
  username,
  email,
  phone,
  age = 0,
  gender = 'Not specified',
  height_cm = 0,
  weight_kg = 0,
  objective = 'Not specified',
  last_consultation = null
}: UserProfileProps) => {
  // Calculate BMI if there's enough data
  const bmi = height_cm > 0 && weight_kg > 0 
    ? (weight_kg / ((height_cm / 100) ** 2)).toFixed(1)
    : null;

  const formatLastConsultation = () => {
    if (!last_consultation) return 'Not registered';
    try {
      return new Date(last_consultation).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

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
    username: {
      fontSize: 14,
      color: colors.text,
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
    bmiBadge: {
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    bmiText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    }
  });

  return (
    <View style={styles.card}>
      <Image
        source={require('../../assets/FitBalanceLogo.jpg')}
        style={styles.avatar}
      />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.username}>@{username}</Text>
      <Text style={styles.email}>{email}</Text>
      {phone && <Text style={styles.email}>Phone: {phone}</Text>}

      <View style={styles.infoRow}>
        <Ionicons name="body-outline" size={20} color="#34C759" />
        <Text style={styles.infoText}>{age} years • {gender}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="human-male-height" size={20} color="#34C759" />
        <Text style={styles.infoText}>{height_cm} cm • {weight_kg} kg</Text>
      </View>
      {bmi && (
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="human-male-height" size={20} color="#34C759" />
          <Text style={styles.infoText}>
            BMI: {bmi} ({getBmiCategory(Number(bmi))})
          </Text>
        </View>
      )}
      <View style={styles.infoRow}>
        <Ionicons name="barbell-outline" size={20} color="#34C759" />
        <Text style={styles.infoText}>Objective: {objective}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={20} color="#34C759" />
        <Text style={styles.infoText}>
          Last consultation: {formatLastConsultation()}
        </Text>
      </View>
    </View>
  );
};

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export default UserProfileCard;