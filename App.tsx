import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import './src/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from "./src/context/ThemeContext";
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from './src/navigation/AppNavigator';

import {
  setupNotifications,
  scheduleDailyNotification
} from './src/services/NotificationsServices';

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        const granted = await setupNotifications();
        if (!granted) return;

        // Una vez al día a las 10:00 AM
        await scheduleDailyNotification(
          '💧 Hora de hidratarte',
          'Toma un vaso de agua ahora mismo.',
          10,
          0
        );
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    })();
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
