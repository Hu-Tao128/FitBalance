import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserProfileScreen from '../screens/userProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NutritionistProfileScreen from '../screens/NutritionistProfileScreen';
import ManagementDatingScreen from '../screens/managementDating';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
    const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={UserProfileScreen}
        options={{ title: 'Mi Perfil', headerShown: true }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Editar Perfil' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Cambiar Contraseña' }}
      />
      <Stack.Screen
        name="NutritionistProfile"
        component={NutritionistProfileScreen}
        options={{ title: 'Mi Nutricionista' }}
      />
      <Stack.Screen
        name="ManagementDating"
        component={ManagementDatingScreen}
        options={{ title: 'Mis Citas' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
