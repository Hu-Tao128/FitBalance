import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const { colors, darkMode, toggleTheme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { logout } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 50,
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      color: colors.primary,
      fontWeight: 'bold',
    },
    scroll: {
      paddingBottom: 30,
    },
    sectionHeader: {
      fontSize: 16,
      color: colors.text,
      marginTop: 20,
      marginBottom: 10,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
    },
    itemText: {
      flex: 1,
      marginLeft: 12,
      color: colors.text,
      fontSize: 16,
    },
    switch: {
      marginLeft: 'auto',
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
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: '#1c1c1e',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 16,
      color: '#aaa',
      textAlign: 'center',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: '#2c2c2e',
    },
    cancelButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    confirmButton: {
      backgroundColor: '#FF3B30',
    },
    confirmButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });


  const handleLogout = async () => {
    await logout();
    navigation.replace('Login'); // Redirige al login
    setLogoutModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cuenta */}
        <Text style={styles.sectionHeader}>Account</Text>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <Ionicons name="person-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Ionicons name="lock-closed-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>Change password</Text>
        </TouchableOpacity>

        {/* Preferencias */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.item}>
          <Ionicons name="notifications-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#555', true: '#34C759' }}
            thumbColor="#fff"
            style={styles.switch}
          />
        </View>
        <View style={styles.item}>
          <Ionicons name="moon-outline" size={24} color={colors.primary} />
          <Text style={styles.itemText}>Dark mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#555', true: colors.primary }}
            thumbColor="#fff"
            style={styles.switch}
          />
        </View>

        {/* Otros */}
        <Text style={styles.sectionHeader}>Others</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('ManagementDating')}
        >
          <Ionicons name="calendar-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('NutritionistProfile')}
        >
          <Ionicons name="id-card-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>Nutritionist</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.item}
          onPress={() => setLogoutModalVisible(true)} // Abre el modal al presionar
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={[styles.itemText, { color: '#FF3B30' }]}>Log off</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de confirmación de cierre de sesión */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLogoutModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Log out?</Text>
                <Text style={styles.modalText}>Are you sure you want to get out of your account?</Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setLogoutModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.confirmButtonText}>Log off</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
};

export default SettingsScreen;