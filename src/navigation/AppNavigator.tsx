// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '../context/UserContext';
import Login from '../screens/login';
import SettingsScreen from '../screens/settings';
import UserProfileScreen from '../screens/userProfileScreen';
import weighFood from '../screens/weighFood';
import { BottomNavigation } from './bottom-navigation';

import CreateMealScreen from '../screens/CreateMealScreen';
import EditMealScreen from '../screens/EditMealScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FoodClassicSearch from '../screens/FoodClassicSearch';
import FoodScanner from '../screens/FoodScanner';
import FoodSearchOptions from '../screens/FoodSearchOptions';
import ManageMealsScreen from '../screens/ManageMeals';
import ManagementDatingScreen from '../screens/managementDating';
import MealLogHistoryScreen from '../screens/MealLogHistoryScreen'; // 2. Import the new screen
import NutritionistProfileScreen from '../screens/NutritionistProfileScreen';
import optionsFood from '../screens/optionsFood';
import StatisticsScreen from '../screens/Stadistics';

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
  MealLogHistory: { initialDate: string }; // Pass the starting date
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
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
                title: 'Perfil',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff'
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Ajustes',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff'
              }}
            />
            <Stack.Screen
              name="weighFood"
              component={weighFood}
              options={{
                title: 'Registrar Alimento',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
                headerShown: true
              }}
            />
            <Stack.Screen
              name="stadistics"
              component={StatisticsScreen}
              options={{
                title: 'Estadisticas del Usuario',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
                headerShown: true
              }}
            />
            {/* NUEVAS PANTALLAS */}
            <Stack.Screen
              name="FoodSearchOptions"
              component={FoodSearchOptions}
              options={{
                title: 'Buscar Alimentos',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="FoodScanner"
              component={FoodScanner}
              options={{
                title: 'Escanear Alimento',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="FoodClassicSearch"
              component={FoodClassicSearch}
              options={{
                title: 'Buscar por Nombre',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="CreateMealScreen"
              component={CreateMealScreen}
              options={{
                title: 'Crear Comida Personalizada', // Ahora solo para crear
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="optionsFood"
              component={optionsFood}
              options={{
                title: 'Opciones de Comida',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="ManageMeals"
              component={ManageMealsScreen}
              options={{
                title: 'Gestionar Comidas',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
              }}
            />
            {/* ✅ NUEVA PANTALLA DE EDICIÓN */}
            <Stack.Screen
              name="EditMeal"
              component={EditMealScreen}
              options={{
                title: 'Editar Comida', // Título para la pantalla de edición
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="ManagementDating"
              component={ManagementDatingScreen}
              options={{
                title: 'Gestión de Citas', // Título para la cabecera
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff'
              }}
            />
            <Stack.Screen
              name="NutritionistProfile"
              component={NutritionistProfileScreen}
              options={{
                title: 'My Nutritionist',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="MealLogHistory"
              component={MealLogHistoryScreen}
              options={{
                title: 'Meal Log',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                title: 'Editar Perfil',
                headerStyle: { backgroundColor: '#1c1c1e' },
                headerTintColor: '#fff'
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