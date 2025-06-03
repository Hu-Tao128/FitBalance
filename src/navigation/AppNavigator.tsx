import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/login';
import SettingsScreen from '../screens/settings'; // Importa Settings si es necesario
import UserProfileScreen from '../screens/userProfileScreen'; // Importa la pantalla
import weighFood from '../screens/weighFood'; // Importa weighFood si es necesario
import { BottomNavigation } from './bottom-navigation';
import { useUser } from '../context/UserContext';
import { View, ActivityIndicator } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  UserProfile: undefined;
  Settings: undefined;
  weighFood: undefined;
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
              // Usuario autenticado - Flujo principal
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
              </>
          ) : (
              // Usuario no autenticado - Solo pantalla de login
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