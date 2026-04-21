// src/navigation/AppNavigator.tsx
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Login from '../features/auth/screens/login';
import SettingsScreen from '../features/settings/screens/settings';
import UserProfileScreen from '../features/profile/screens/userProfileScreen';
import weighFood from '../features/food/screens/weighFood';
import { BottomNavigation } from './bottom-navigation';
import { setupFCMListeners } from '../services/FCMService';
import { useEffect, useRef } from 'react';

import ChangePasswordScreen from '../features/auth/screens/ChangePasswordScreen'; // 2. Importa la pantalla
import CreateMealScreen from '../features/food/screens/CreateMealScreen';
import EditMealScreen from '../features/food/screens/EditMealScreen';
import EditProfileScreen from '../features/profile/screens/EditProfileScreen';
import FoodSearchScreen from '../features/food/screens/FoodSearchScreen';
import FoodScanner from '../features/food/screens/FoodScanner';
import FoodSearchOptions from '../features/food/screens/FoodSearchOptions';
import ManageMealsScreen from '../features/food/screens/ManageMeals';
import ManagementDatingScreen from '../features/nutritionist/screens/managementDating';
import MealLogHistoryScreen from '../features/food/screens/MealLogHistoryScreen'; // 2. Import the new screen
import NutritionistProfileScreen from '../features/nutritionist/screens/NutritionistProfileScreen';
import optionsFood from '../features/food/screens/optionsFood';
import StatisticsScreen from '../features/statistics/screens/Stadistics';

// Importa PatientMeal desde tu archivo de tipos compartido
import { PatientMeal } from '../types'; // O la ruta correcta a tu archivo de tipos

export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  UserProfile: undefined;
  Settings: undefined;
  weighFood: undefined;
  stadistics: undefined;
  FoodSearchOptions: undefined;
  FoodScanner: undefined;
  FoodClassicSearch: undefined;
  CreateMealScreen: undefined;
  optionsFood: undefined;
  ManageMeals: undefined;
  EditMeal: { mealToEdit: PatientMeal };
  EditProfile: undefined;
  ManagementDating: undefined;
  NutritionistProfile: undefined;
  MealLogHistory: { initialDate: string };
  ChangePassword: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useUser();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = setupFCMListeners(navigationRef.current);
      return unsubscribe;
    }
  }, [user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
          headerShadowVisible: false,
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Root"
              component={BottomNavigation}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{
                title: t('common.profile', 'Profile'),
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: t('common.settings', 'Settings'),
              }}
            />
            <Stack.Screen
              name="weighFood"
              component={weighFood}
              options={{
                title: t('dashboard.registerFood', 'Register Food'),
                headerShown: true
              }}
            />
            <Stack.Screen
              name="stadistics"
              component={StatisticsScreen}
              options={{
                title: t('statistics.title', 'User Statistics'),
                headerShown: true
              }}
            />
            {/* NUEVAS PANTALLAS */}
            <Stack.Screen
              name="FoodSearchOptions"
              component={FoodSearchOptions}
              options={{
                title: t('food.searchOptionsTitle', 'Food Options'),
              }}
            />
            <Stack.Screen
              name="FoodScanner"
              component={FoodScanner}
              options={{
                title: t('food.scanCode', 'Scan Food'),
              }}
            />
            <Stack.Screen
              name="FoodClassicSearch"
              component={FoodSearchScreen}
              options={{
                title: t('food.searchByName', 'Search for Food by Text'),
              }}
            />
            <Stack.Screen
              name="CreateMealScreen"
              component={CreateMealScreen}
              options={{
                title: t('food.createMeal', 'Create Custom Food'),
                headerBackTitle: '',
              }}
            />
            <Stack.Screen
              name="optionsFood"
              component={optionsFood}
              options={{
                title: t('food.optionsManagementTitle', 'Meal Management'),
              }}
            />
            <Stack.Screen
              name="ManageMeals"
              component={ManageMealsScreen}
              options={{
                title: t('food.myMeals', 'My Meals'),
              }}
            />
            {/* ✅ NUEVA PANTALLA DE EDICIÓN */}
            <Stack.Screen
              name="EditMeal"
              component={EditMealScreen}
              options={{
                title: t('profile.editProfile', 'Edit Meals'),
              }}
            />
            <Stack.Screen
              name="ManagementDating"
              component={ManagementDatingScreen}
              options={{
                title: t('appointments.title', 'Appointments'),
              }}
            />
            <Stack.Screen
              name="NutritionistProfile"
              component={NutritionistProfileScreen}
              options={{
                title: t('nutritionist.myNutritionist', 'My Nutritionist'),
              }}
            />
            <Stack.Screen
              name="MealLogHistory"
              component={MealLogHistoryScreen}
              options={{
                title: t('dashboard.mealLogHistory', 'Meal Log'),
              }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{
                title: t('password.title', 'Change Password'),
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                title: t('profile.editProfile', 'Edit Profile'),
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
