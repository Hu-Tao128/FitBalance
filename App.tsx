export type RootStackParamList = {
  Login: undefined;
  Root: undefined;
  Home: undefined;
  RecipeSearch: undefined;
  Settings: undefined;
};

import React from 'react';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator'; 

export default function App() {
  return <AppNavigator />;
}
