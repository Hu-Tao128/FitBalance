import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors, darkMode, toggleTheme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { logout } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('user-language', lng);
  };

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
    languageContainer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 5,
    },
    languageButton: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    languageButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    languageButtonText: {
      color: colors.text,
      fontSize: 14,
    },
    languageButtonTextActive: {
      color: '#fff',
      fontWeight: 'bold',
    },
    bottomNav: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    bottomNavText: {
      color: colors.text,
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: '85%',
      maxWidth: 340,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    modalText: {
      fontSize: 16,
      color: colors.textSecondary || colors.text,
      textAlign: 'center',
      marginBottom: 24,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: '600',
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
        <Text style={styles.title}>{t('common.settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Idioma */}
        <Text style={styles.sectionHeader}>{t('common.language')}</Text>
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[styles.languageButton, i18n.language === 'es' && styles.languageButtonActive]}
            onPress={() => changeLanguage('es')}
          >
            <Text style={[styles.languageButtonText, i18n.language === 'es' && styles.languageButtonTextActive]}>
              {t('common.spanish')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, i18n.language === 'en' && styles.languageButtonActive]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={[styles.languageButtonText, i18n.language === 'en' && styles.languageButtonTextActive]}>
              {t('common.english')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cuenta */}
        <Text style={styles.sectionHeader}>{t('settings.account', 'Account')}</Text>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <Ionicons name="person-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>{t('common.profile')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>{t('settings.changePassword', 'Change password')}</Text>
        </TouchableOpacity>

        {/* Preferencias */}
        <Text style={styles.sectionHeader}>{t('settings.preferences', 'Preferences')}</Text>
        <View style={styles.item}>
          <Ionicons name="notifications-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>{t('settings.notifications', 'Notifications')}</Text>
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
          <Text style={styles.itemText}>{t('settings.darkMode', 'Dark mode')}</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#555', true: colors.primary }}
            thumbColor="#fff"
            style={styles.switch}
          />
        </View>

        {/* Otros */}
        <Text style={styles.sectionHeader}>{t('settings.others', 'Others')}</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('ManagementDating')}
        >
          <Ionicons name="calendar-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>{t('settings.appointments', 'Appointments')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('NutritionistProfile')}
        >
          <Ionicons name="id-card-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>{t('settings.nutritionist', 'Nutritionist')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => WebBrowser.openBrowserAsync('https://hu-tao128.github.io/fitbalance-privacy/')}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#34C759" />
          <Text style={styles.itemText}>{t('settings.privacy', 'Privacy Policy')}</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.item}
          onPress={() => setLogoutModalVisible(true)} // Abre el modal al presionar
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={[styles.itemText, { color: '#FF3B30' }]}>{t('settings.logOff', 'Log off')}</Text>
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
                <Text style={styles.modalTitle}>{t('settings.logoutQuestion', 'Log out?')}</Text>
                <Text style={styles.modalText}>{t('settings.logoutConfirm', 'Are you sure you want to get out of your account?')}</Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setLogoutModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.confirmButtonText}>{t('settings.logOff', 'Log off')}</Text>
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