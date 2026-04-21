import React from 'react';
import 'react-native-gesture-handler';
import './src/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from "./src/context/ThemeContext";
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
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
