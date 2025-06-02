
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
  const caloriasComidas = 2000;
  const caloriasRestantes = caloriasObjetivo - caloriasComidas;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={40} color="#eee" />
        <Text style={styles.title}>FitBalance</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="#eee" />
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
            <Text style={styles.cardText}>Conéctate para monitorear</Text>
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

      <View style={styles.bottomNav}>
        <Ionicons name="home-outline" size={24} color="#34C759" />
        <Ionicons name="book-outline" size={24} color="#ccc" />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="bar-chart-outline" size={24} color="#ccc" />
        <Ionicons name="settings-outline" size={24} color="#ccc" />
      </View>

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
    backgroundColor: '#1c1c1e',
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
    color: '#aaa',
  },
  subtext: {
    marginTop: 6,
    fontSize: 16,
    color: '#ccc',
  },
  section: {
    backgroundColor: '#2c2c2e',
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
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 16,
    color: '#bbb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#aaa',
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
    color: '#eee',
  },
  macroText: {
    marginTop: 6,
    fontSize: 14,
    color: '#bbb',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: '#2c2c2e',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  fab: {
    backgroundColor: '#34C759',
    borderRadius: 30,
    padding: 14,
    marginTop: -30,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
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
    color: '#fff',
    fontSize: 16,
  },
});
