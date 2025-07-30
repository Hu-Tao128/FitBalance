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
      backgroundColor: colors.card,
      borderRadius: 28,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
      padding: 22,
      marginBottom: 28,
    },

    headerRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },

    username: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },

    iconBtn: {
      padding: 6,
      borderRadius: 12,
      backgroundColor: colors.background,
      shadowColor: colors.primary,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
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
        <View style={styles.headerRow}>
          <Text style={styles.username}>{username}</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate?.('EditProfile')}
          >
            <MaterialIcons name="edit" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <UserProfileCard {...user} />

      </View>


    </ScrollView>
  );
};

export default UserProfileScreen;
