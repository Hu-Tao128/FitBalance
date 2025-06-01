import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type UserProfileProps = {
  nombre: string;
  email: string;
  usuario?: string;
  edad?: number;       // Hacer opcional
  sexo?: string;       // Hacer opcional
  altura_cm?: number;  // Hacer opcional
  peso_kg?: number;    // Hacer opcional
  objetivo?: string;   // Hacer opcional
  ultima_consulta?: string; // Hacer opcional
};

const UserProfileCard = ({
  nombre,
  email,
  edad = 0,              // Valor por defecto
  sexo = 'No especificado', // Valor por defecto
  altura_cm = 0,         // Valor por defecto
  peso_kg = 0,           // Valor por defecto
  objetivo = 'No especificado', // Valor por defecto
  ultima_consulta = 'No registrada' // Valor por defecto
}: UserProfileProps) => {
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

export default UserProfileCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
  },
});
