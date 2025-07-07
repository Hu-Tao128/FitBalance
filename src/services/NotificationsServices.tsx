import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Configura permisos y comportamiento de notificaciones.
 */
export const setupNotifications = async (): Promise<boolean> => {
  Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true, // requerido en nuevas versiones
      shouldShowList: true    // requerido en nuevas versiones
    }),
  });

  if (!Device.isDevice) {
    console.warn('Las notificaciones sólo funcionan en dispositivos físicos.');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

/**
 * Programa una notificación local en segundos.
 */
export const scheduleNotification = async (
  title: string,
  body: string,
  seconds: number,
  repeats: boolean = false
): Promise<void> => {
  if (repeats && seconds < 60) {
    console.warn('⏱️ No puedes usar `repeats: true` con menos de 60 segundos. Cambiando a false.');
    repeats = false;
  }

const trigger = {
  type: 'timeInterval',
  seconds,
  repeats,
} as Notifications.TimeIntervalTriggerInput;



  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger,
  });
};

/**
 * Cancela todas las notificaciones programadas.
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Obtiene todas las notificaciones programadas actualmente.
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log('⏰ Notificaciones programadas:', scheduled);
  return scheduled;
};
