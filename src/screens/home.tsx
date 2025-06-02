import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const caloriasObjetivo = 2380;
  const caloriasComidas = 5000;
  const caloriasRestantes = caloriasObjetivo - caloriasComidas;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={40} color="#333" />
        <Text style={styles.title}>NutriFrut</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* CÍRCULO CALORÍAS CENTRAL */}
        <View style={styles.caloriesWrapper}>
          <AnimatedCircularProgress
            size={180}
            width={16}
            fill={(caloriasComidas / caloriasObjetivo) * 100}
            tintColor="#34C759"
            backgroundColor="#e5e5e5"
            rotation={0}
            lineCap="round"
          >
            {(fill: number) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.caloriesNumber}>{Math.round(fill)}%</Text>
                <Text style={styles.caloriesLabel}>de tu meta diaria</Text>
              </View>
            )}
          </AnimatedCircularProgress>
          <Text style={styles.subtext}>
            {caloriasObjetivo} cal objetivo | {caloriasComidas} consumidas
          </Text>
          <Text style={[styles.subtext, { color: caloriasRestantes > 0 ? '#4caf50' : '#e53935' }]}>
            {Math.abs(caloriasRestantes)} cal {caloriasRestantes > 0 ? 'faltantes' : 'excedidas'}
          </Text>
        </View>

        {/* SECCIÓN MACROS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macros</Text>
          <Text style={styles.sectionText}>Últimos 90 días</Text>
        </View>

        {/* TARJETAS */}
        <View style={styles.sectionRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pasos</Text>
            <Text style={styles.cardText}>Conéctate para monitorear</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ejercicio</Text>
            <Text style={styles.cardText}>0 cal</Text>
          </View>
        </View>

        {/* COMENTARIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentario del nutriólogo</Text>
          <Text style={styles.sectionText}>
            {caloriasRestantes > 0
              ? '¡Vas muy bien! Sigue así.'
              : 'Te has excedido, intenta balancear tus próximas comidas.'}
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <Ionicons name="home-outline" size={24} color="#34C759" />
        <Ionicons name="book-outline" size={24} color="#888" />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="bar-chart-outline" size={24} color="#888" />
        <Ionicons name="settings-outline" size={24} color="#888" />
      </View>

      {/* MODAL */}
      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Registrar</Text>
                <TouchableOpacity style={styles.modalOption}>
                  <View style={styles.optionRow}>
                    <MaterialCommunityIcons name="food-apple" size={24} color="#34C759" />
                    <Text style={styles.modalOptionText}>Registrar alimento</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption}>
                  <View style={styles.optionRow}>
                    <Ionicons name="water-outline" size={24} color="#34C759" />
                    <Text style={styles.modalOptionText}>Registrar agua</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption}>
                  <View style={styles.optionRow}>
                    <MaterialCommunityIcons name="scale-bathroom" size={24} color="#34C759" />
                    <Text style={styles.modalOptionText}>Nuevo peso</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#34C759', textAlign: 'right' }}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7', // Claro pero no blanco puro
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
    color: '#34C759',
  },
  caloriesWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  caloriesNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#333',
  },
  subtext: {
    marginTop: 6,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 16,
    color: '#555',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#777',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fab: {
    backgroundColor: '#34C759',
    borderRadius: 30,
    padding: 14,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#34C759',
  },
  modalOption: {
    paddingVertical: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalOptionText: {
    color: '#333',
    fontSize: 16,
  },
});
