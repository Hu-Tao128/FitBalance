import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsUser from '../screens/settings';
import UserProfileScreen from '../screens/userProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

const SettingsStackNavigator = () => {
    const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsUser}
        options={{ headerShown: false }} // Solo ocultamos en Settings
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;
