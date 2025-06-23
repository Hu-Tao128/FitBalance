import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import UserProfileCard from '../components/userProfileCard';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const UserProfileScreen = () => {
  const { user } = useUser();
  const { colors } = useTheme();

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

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUserText}>No user logged in</Text>
      </View>
    );
  }

  // Extract only the necessary properties
  const { username, ...userData } = user;

  return (
    <ScrollView style={styles.container}>
      <UserProfileCard {...userData} username={username} />
      <View style={styles.notes}>
        <Text style={styles.notesTitle}>Nutritionist Notes</Text>
        <Text style={styles.noteText}>
          Good progress. Include plant-based protein supplement.
        </Text>
      </View>
    </ScrollView>
  );
};

export default UserProfileScreen;