import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import UserProfileCard from '../../components/userProfileCard';

const UserProfileScreen = () => {
  const user = {
    nombre: 'Juan Martínez',
    email: 'juan.martinez@example.com',
    edad: 28,
    sexo: 'masculino',
    altura_cm: 180,
    peso_kg: 85,
    objetivo: 'ganar masa muscular',
    ultima_consulta: '2025-05-15T12:00:00Z',
  };

  return (
    <ScrollView style={styles.container}>
      <UserProfileCard {...user} />
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
    backgroundColor: '#0d0d0d',
    padding: 20,
  },
  notes: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
  },
  notesTitle: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    color: '#fff',
    fontSize: 14,
  },
});
