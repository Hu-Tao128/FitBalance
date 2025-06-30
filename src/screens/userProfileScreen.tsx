import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import UserProfileCard from '../components/userProfileCard';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const UserProfileScreen = ({ navigation }: any) => {
  const { user } = useUser();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 0,
    },
    scrollContent: {
      padding: 24,
      paddingTop: 44,
      alignItems: 'center',
    },
    noUserText: {
      color: colors.text,
      fontSize: 18,
      textAlign: 'center',
      marginTop: 48,
      opacity: 0.7,
    },
    profileCardBox: {
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.78)',
      borderRadius: 28,
      shadowColor: '#B6D0B533',
      shadowOpacity: 0.15,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
      marginBottom: 28,
      padding: 26,
      alignItems: 'center',
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 11,
      paddingHorizontal: 28,
      borderRadius: 22,
      alignSelf: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.17,
      shadowRadius: 10,
      elevation: 3,
      marginTop: 18,
    },
    editText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      marginLeft: 10,
      letterSpacing: 0.1,
    },
    notes: {
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 22,
      marginTop: 16,
      shadowColor: '#A7C1A8',
      shadowOpacity: 0.10,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 14,
      elevation: 2,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    notesIcon: {
      marginRight: 6,
      marginTop: 3,
    },
    notesTextWrap: {
      flex: 1,
    },
    notesTitle: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 3,
      letterSpacing: 0.2,
    },
    noteText: {
      color: colors.text,
      fontSize: 14.5,
      lineHeight: 21,
      opacity: 0.92,
    },
  });

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUserText}>No hay sesión iniciada</Text>
      </View>
    );
  }

  // Extract only the necessary properties
  const { username, ...userData } = user;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* CARD DEL PERFIL */}
      <View style={styles.profileCardBox}>
        <UserProfileCard {...userData} username={username} />
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.82}
          onPress={() => navigation && navigation.navigate ? navigation.navigate('EditProfile') : null}
        >
          <MaterialIcons name="edit" size={22} color="#fff" />
          <Text style={styles.editText}>Editar perfil</Text>
        </TouchableOpacity>
      </View>

      {/* CARD DE NOTAS */}
      <View style={styles.notes}>
        <MaterialIcons
          name="sticky-note-2"
          size={32}
          color={colors.primary}
          style={styles.notesIcon}
        />
        <View style={styles.notesTextWrap}>
          <Text style={styles.notesTitle}>Notas del nutriólogo</Text>
          <Text style={styles.noteText}>
            Vas muy bien, sigue así. Recuerda incluir proteína vegetal en tus desayunos y procura al menos 1 fruta diaria.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserProfileScreen;
