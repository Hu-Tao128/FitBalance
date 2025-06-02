import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomNavigation } from './bottom-navigation';
import Login from '../screens/login';
import UserProfileScreen from '../screens/userProfileScreen'; // Importa la pantalla
import SettingsScreen from '../screens/settings'; // Importa Settings si es necesario

export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  UserProfile: undefined;
  Settings: undefined;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}