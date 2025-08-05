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

// --- LA LÓGICA NO SE MODIFICA ---
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

  const { colors } = useTheme();
  // Se llama a la función para crear los estilos con los colores del tema
  const styles = createDynamicStyles(colors);

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

  return (
    // --- LA ESTRUCTURA JSX NO SE MODIFICA ---
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
              <View style={styles.bmiBadge}>
                <Text style={styles.bmiText}> {getBmiCategory(Number(bmi))}</Text>
              </View>
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

// --- LA LÓGICA NO SE MODIFICA ---
function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// --- SECCIÓN DE ESTILOS ACTUALIZADA ---
const createDynamicStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.card, // Antes '#fff'
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000', // Sombra estándar
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 8,
  },
  avatarWrap: {
    borderRadius: 64,
    borderWidth: 4,
    borderColor: colors.primary,
    padding: 4,
    backgroundColor: colors.card, // Antes '#fff'
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
  },
  name: {
    fontSize: 22,
    color: colors.text, // Antes '#444'
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  username: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.85,
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary, // Antes '#444'
    marginBottom: 5,
    textAlign: 'center',
  },
  phone: {
    fontSize: 15,
    color: colors.textSecondary, // Antes '#444'
    marginBottom: 8,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border, // Borde sutil
    paddingTop: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  iconBox: {
    backgroundColor: `${colors.primary}1A`, // Color primario con baja opacidad
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    color: colors.text, // Antes '#444'
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
    letterSpacing: 0.1,
    display: 'flex',
    alignItems: 'center',
  },
  bmiBadge: {
    backgroundColor: `${colors.success}30`, // Color de éxito con baja opacidad
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  bmiText: {
    color: colors.success, // Usa el color de éxito
    fontSize: 14,
    fontWeight: '700',
  },
});

export default UserProfileCard;