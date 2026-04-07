import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from "./src/context/ThemeContext";
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from './src/navigation/AppNavigator';
import { BleProvider } from './src/features/ble/context/BleContext';

import {
  setupNotifications,
  scheduleNotification
} from './src/services/NotificationsServices';

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        const granted = await setupNotifications();
        if (!granted) return;

        scheduleNotification(
          '💧 Hora de hidratarte',
          'Toma un vaso de agua ahora mismo.',
          2 * 60 * 60,
          true
        );
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <BleProvider>
        <ThemeProvider>
          <UserProvider>
            <AppNavigator />
          </UserProvider>
        </ThemeProvider>
      </BleProvider>
    </SafeAreaProvider>
  );
}
