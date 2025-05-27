export type RootStackParamList = {
  Login: undefined;
  RecipeSearch: undefined;
};

import React from 'react';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
