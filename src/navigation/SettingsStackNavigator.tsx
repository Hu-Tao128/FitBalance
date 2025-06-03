// src/navigation/SettingsStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsUser from '../screens/settings';
import UserProfileScreen from '../screens/userProfileScreen';

const Stack = createNativeStackNavigator();

const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0d0d0d' },
        headerTintColor: '#34C759',
        headerTitleStyle: { color: '#fff' },
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
