import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from "./src/context/ThemeContext";
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from './src/navigation/AppNavigator';

import {
  setupNotifications,
  scheduleNotification
} from './src/services/NotificationsServices';
import * as Notifications from 'expo-notifications';

export default function App() {
useEffect(() => {
  (async () => {
    const granted = await setupNotifications();
    if (!granted) return;

    // 1) Cada 2 horas: “Hora de hidratarte”
    scheduleNotification(
      '💧 Hora de hidratarte',
      'Toma un vaso de agua ahora mismo.',
      2 * 60 * 60,  // segundos
      true          // repeats
    );

    // 2) Notificación única: 4 de agosto de 2025 a las 07:00 AM
    const targetDate = new Date(2025, 7, 4, 8, 0, 0); // mes: 0=ene…7=ago
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🗓 Recordatorio especial',
        body: '¡Es 4 de agosto de 2025 a las 07:00! Tu app con notificaciones está funcionando.',
      },
      trigger: {
        type: 'date',
        date: targetDate,
        repeats: false
      } as any, // el "as any" evita el error de null
    });
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
