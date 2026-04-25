import { 
  getMessaging, 
  requestPermission, 
  getToken, 
  onMessage, 
  onNotificationOpenedApp, 
  onTokenRefresh, 
  getInitialNotification,
  AuthorizationStatus
} from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { apiClient } from '../core/api/apiClient';

const messaging = getMessaging();

export const requestUserPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;
    
    if (!enabled) {
      console.log('FCM: Permission denied');
      return false;
    }
  }
  return true;
};

export const getFCMToken = async () => {
  try {
    const fcmToken = await getToken(messaging);
    if (fcmToken) {
      console.log('=========================================');
      console.log('FCM TOKEN PARA PRUEBAS:');
      console.log(fcmToken);
      console.log('=========================================');
      
      return fcmToken;
    }
  } catch (error) {
    console.log('FCM Error getting token:', error);
  }
  return null;
};

export const registerFCMTokenWithBackend = async (fcmToken: string) => {
  try {
    await apiClient.post('/users/fcm-token', { token: fcmToken });
    console.log('FCM Token registered with backend');
  } catch (error) {
    // No lanzamos error para evitar que la app se detenga si falla el registro del token
    console.warn('FCM: Token registration failed (session likely expired/missing):', error);
  }
};

export const initNotifications = async () => {
  const hasPermission = await requestUserPermission();
  if (!hasPermission) return;

  const fcmToken = await getFCMToken();
  if (fcmToken) {
    // Intentar registrar, pero no bloquea la app si falla el JWT
    await registerFCMTokenWithBackend(fcmToken);
  }
};

export const setupFCMListeners = (navigation: any) => {
  // Foreground message handler
  const unsubscribeOnMessage = onMessage(messaging, async remoteMessage => {
    console.log('FCM: Foreground message received:', remoteMessage);
    Alert.alert(
      remoteMessage.notification?.title || 'Notificación',
      remoteMessage.notification?.body || ''
    );
  });

  // Handle notification opening while app is in background
  const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(messaging, remoteMessage => {
    console.log('FCM: Notification caused app to open from background:', remoteMessage);
    handleNotificationNavigation(remoteMessage, navigation);
  });

  // Handle token refresh
  const unsubscribeOnTokenRefresh = onTokenRefresh(messaging, async newToken => {
    console.log('FCM: Token refreshed:', newToken);
    await registerFCMTokenWithBackend(newToken);
  });

  // Check if app was opened from a closed state via notification
  getInitialNotification(messaging)
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('FCM: Notification caused app to open from quit state:', remoteMessage);
        handleNotificationNavigation(remoteMessage, navigation);
      }
    });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnNotificationOpenedApp();
    unsubscribeOnTokenRefresh();
  };
};

const handleNotificationNavigation = (remoteMessage: any, navigation: any) => {
  const screen = remoteMessage.data?.screen;
  if (screen && navigation) {
    if (screen === 'PlanScreen') {
      navigation.navigate('Root', { screen: 'Dashboard' });
    } else if (screen === 'weighFood') {
        navigation.navigate('weighFood');
    }
  }
};
