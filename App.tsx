export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  Home: undefined;
  RecipeSearch: undefined;
  Settings: undefined;
  UserProfile: undefined;
  Test: undefined;
};

import React, {useEffect}  from 'react';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator'; 
import { UserProvider } from "./src/context/UserContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { setupNotifications } from './src/services/NotificationsServices';

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return(
    <ThemeProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </ThemeProvider>
  );
}
