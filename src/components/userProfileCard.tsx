import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
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
  name,
  username,
  email,
  phone,
  age = 0,
  gender = 'No especificado',
  height_cm = 0,
  weight_kg = 0,
  objective = 'No especificado',
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
      backgroundColor: '#fff',
      borderRadius: 28,
      paddingVertical: 32,
      paddingHorizontal: 24,
      alignItems: 'center',
      width: '100%',
      shadowColor: '#A7C1A8',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.11,
      shadowRadius: 24,
      elevation: 8,
      marginBottom: 8,
    },
    avatarWrap: {
      borderRadius: 64,
      borderWidth: 4,
      borderColor: colors.primary,
      padding: 4,
      backgroundColor: '#fff',
      marginBottom: 15,
      shadowColor: colors.primary,
      shadowOpacity: 0.11,
      shadowOffset: { width: 0, height: 7 },
      shadowRadius: 16,
      elevation: 7,
    },
    avatar: {
      width: 95,
      height: 95,
      borderRadius: 48,
      backgroundColor: '#D1D8BE',
    },
    name: {
      fontSize: 20,
      color: '#444',
      fontWeight: '800',
      marginBottom: 1,
      letterSpacing: 0.2,
      textAlign: 'center',
    },
    username: {
      fontSize: 20,
      color: colors.primary,
      fontWeight: '500',
      marginBottom: 7,
      textAlign: 'center',
      opacity: 0.78,
    },
    email: {
      fontSize: 15,
      color: '#444',
      marginBottom: 5,
      textAlign: 'center',
      opacity: 0.83,
    },
    phone: {
      fontSize: 15,
      color: '#444',
      marginBottom: 8,
      textAlign: 'center',
      opacity: 0.8,
    },
    section: {
      width: '100%',
      marginTop: 7,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 6,
      width: '100%',
      paddingHorizontal: 3,
    },
    iconBox: {
      backgroundColor: '#F1F8EE',
      borderRadius: 9,
      padding: 6,
      marginRight: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoText: {
      color: '#444',
      fontSize: 16.5,
      flex: 1,
      fontWeight: '400',
      letterSpacing: 0.15,
    },
    bmiBadge: {
      backgroundColor: '#E6FCD8',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 9,
      marginLeft: 9,
    },
    bmiText: {
      color: colors.primary,
      fontSize: 13.5,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    sectionTitle: {
      color: colors.primary,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
      marginTop: 17,
      marginBottom: 4,
      fontSize: 15,
      letterSpacing: 0.1,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        <Image
          source={require('../../assets/FitBalanceLogo.jpg')}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.username}>@{username}</Text>
      {email && <Text style={styles.email}>{email}</Text>}
      {phone && <Text style={styles.phone}>{phone}</Text>}

      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="body-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.infoText}>{age} Age • {gender}</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="human-male-height" size={22} color={colors.primary} />
          </View>
          <Text style={styles.infoText}>{height_cm} cm • {weight_kg} kg</Text>
        </View>
        {bmi && (
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="weight" size={22} color={colors.primary} />
            </View>
            <Text style={styles.infoText}>
              IMC: {bmi}
              <Text style={styles.bmiBadge}> {getBmiCategory(Number(bmi))}</Text>
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="barbell-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.infoText}>Target: {objective}</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.infoText}>
            Last consultation: {formatLastConsultation()}
          </Text>
        </View>
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
