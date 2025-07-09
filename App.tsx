// App.tsx
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from "./src/context/ThemeContext";
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotifications } from './src/services/NotificationsServices';

import { PatientMeal } from './src/types'; // O la ruta correcta a tu archivo de tipos

export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  Home: undefined;
  RecipeSearch: undefined;
  Settings: undefined;
  UserProfile: undefined;
  optionsFood: undefined;
  ManageMeals: undefined;
  CreateMealScreen: { mealToEdit: PatientMeal } | undefined;
};

export default function App() {
  useEffect(() => {
    setupNotifications().then(granted => {
      if (granted) {
        console.log('🔔 Permisos de notificaciones concedidos.');
      } else {
        console.warn('❌ Permisos de notificaciones denegados.');
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <AppNavigator />
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}