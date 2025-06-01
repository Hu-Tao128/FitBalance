import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';


const Dashboard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const caloriasObjetivo = 2380;
  const caloriasComidas = 5000;
  const caloriasActuales = 0;

  const [spinAnim, setSpinAnim] = useState(new Animated.Value(0));
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
  spinAnim.setValue(0); // Reset animación
  Animated.loop(
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();
}, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={40} color="#fff" />
        <Text style={styles.title}>nutrifrut</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={[styles.section, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <View>
          <Text style={styles.sectionTitle}>Calorías</Text>
          <Text style={styles.sectionText}>2380 Objetivo</Text>
          {(caloriasObjetivo - caloriasComidas) > 0 ?(
            <Text style={styles.sectionText}>
              {(caloriasObjetivo - caloriasComidas)} faltantes
            </Text>
          ) : (
              <Text style={styles.sectionText}>
              {(caloriasObjetivo - caloriasComidas) * -1} Sobrepasadas
            </Text>
          )}
        </View>

        <AnimatedCircularProgress
          size={90}
          width={8}
          fill={(caloriasComidas / caloriasObjetivo) * 100}
          tintColor="#34C759"
          backgroundColor="#333"
          rotation={0}
          lineCap="round"
        >
          {(fill: number) => (
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {Math.round(fill)}%
            </Text>
          )}
        </AnimatedCircularProgress>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macros</Text>
        <Text style={styles.sectionText}>Últimos 90 días</Text>
      </View>

      <View style={styles.sectionRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pasos</Text>
          <Text style={styles.cardText}>Conéctese para monitorear</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ejercicio</Text>
          <Text style={styles.cardText}>0 cal</Text>
        </View>
      </View>

      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentarios de tu nutriologo</Text>
          <Text style={styles.sectionText}>Soy un comentario de tu nutriologo</Text>
          {(caloriasObjetivo - caloriasComidas) > 0 ?(
            <Text style={styles.sectionText}>Vas bien</Text>
          ) : (
            <Animated.Image style={{height: 250, width: 250, transform: [{rotate: spin}]}} source={require('../../assets/NotFat.gif')}/>
          )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Ionicons name="home-outline" size={24} color="#fff" />
        <Ionicons name="book-outline" size={24} color="#fff" />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="bar-chart-outline" size={24} color="#fff" />
        <Ionicons name="settings-outline" size={24} color="#fff" />
      </View>

      {/* Modal */}
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

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
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
    color: '#34C759', // verde acento
  },
  section: {
    backgroundColor: '#1c1c1e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  sectionText: {
    fontSize: 17,
    color: '#999',
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
  bottomNav: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: '#1c1c1e',
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
    backgroundColor: '#0d0d0d',
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
    color: 'rgb(255,255,255)'
  },
  image:{
    width: 250,
    height:250,
    flex: 1,
    justifyContent:"center",
    alignItems: "center",
    resizeMode: "stretch",
  }
});
