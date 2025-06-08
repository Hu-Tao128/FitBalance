import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import UserProfileCard from '../components/userProfileCard';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const { colors } = useTheme();

const UserProfileScreen = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUserText}>No hay usuario logueado</Text>
      </View>
    );
  }

  // Extrae solo las propiedades necesarias
  const { usuario, ...userData } = user;

  return (
    <ScrollView style={styles.container}>
      <UserProfileCard {...userData} />
      <View style={styles.notes}>
        <Text style={styles.notesTitle}>Notas del nutricionista</Text>
        <Text style={styles.noteText}>
          Buen seguimiento. Incluir suplemento de proteína vegetal.
        </Text>
      </View>
    </ScrollView>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  noUserText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  notes: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  notesTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});