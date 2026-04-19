import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import UserProfileScreen from '../features/profile/screens/userProfileScreen';
import EditProfileScreen from '../features/profile/screens/EditProfileScreen';
import ChangePasswordScreen from '../features/auth/screens/ChangePasswordScreen';
import NutritionistProfileScreen from '../features/nutritionist/screens/NutritionistProfileScreen';
import ManagementDatingScreen from '../features/nutritionist/screens/managementDating';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
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
        options={{ title: t('profile.myProfile', 'Mi Perfil'), headerShown: true }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: t('profile.editProfile', 'Editar Perfil') }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: t('password.title', 'Cambiar Contraseña') }}
      />
      <Stack.Screen
        name="NutritionistProfile"
        component={NutritionistProfileScreen}
        options={{ title: t('nutritionist.myNutritionist', 'Mi Nutricionista') }}
      />
      <Stack.Screen
        name="ManagementDating"
        component={ManagementDatingScreen}
        options={{ title: t('appointments.title', 'Mis Citas') }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
