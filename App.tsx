export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  Home: undefined;
  RecipeSearch: undefined;
  Settings: undefined;
  UserProfile: undefined;
};

import React from 'react';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator'; 
import { UserProvider } from "./src/context/UserContext";

export default function App() {
  return(
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}
