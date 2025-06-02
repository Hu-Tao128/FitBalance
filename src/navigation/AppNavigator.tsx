import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/login';
import SettingsScreen from '../screens/settings'; // Importa Settings si es necesario
import UserProfileScreen from '../screens/userProfileScreen'; // Importa la pantalla
import weighFood from '../screens/weighFood'; // Importa weighFood si es necesario
import { BottomNavigation } from './bottom-navigation';

export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  UserProfile: undefined;
  Settings: undefined;
  weighFood: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Root"
          component={BottomNavigation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserProfile"
          component={UserProfileScreen}
        />
        {/* Añade Settings si es necesario */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="weighFood"
          component={weighFood}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}