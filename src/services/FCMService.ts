import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { apiClient } from '../core/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestUserPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (!enabled) {
      console.log('FCM: Permission denied');
      return false;
    }
  }
  // Android 13+ permission is handled via AndroidManifest and system prompt
  // react-native-firebase handles this automatically or you can use PermissionsAndroid
  return true;
};

export const getFCMToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('=========================================');
      console.log('FCM TOKEN PARA PRUEBAS:');
      console.log(fcmToken);
      console.log('=========================================');
      
      // Alert temporal para ver el token en el dispositivo
      Alert.alert('FCM Token (Cópialo para pruebas)', fcmToken);
      
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
    console.error('FCM: Error registering token with backend:', error);
  }
};

export const initNotifications = async () => {
  const hasPermission = await requestUserPermission();
  if (!hasPermission) return;

  const fcmToken = await getFCMToken();
  if (fcmToken) {
    await registerFCMTokenWithBackend(fcmToken);
  }
};

export const setupFCMListeners = (navigation: any) => {
  // Foreground message handler
  const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
    console.log('FCM: Foreground message received:', remoteMessage);
    Alert.alert(
      remoteMessage.notification?.title || 'Notificación',
      remoteMessage.notification?.body || ''
    );
  });

  // Handle notification opening while app is in background
  const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('FCM: Notification caused app to open from background:', remoteMessage);
    handleNotificationNavigation(remoteMessage, navigation);
  });

  // Handle token refresh
  const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async newToken => {
    console.log('FCM: Token refreshed:', newToken);
    await registerFCMTokenWithBackend(newToken);
  });

  // Check if app was opened from a closed state via notification
  messaging()
    .getInitialNotification()
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
    // Basic navigation logic
    // Add more cases as needed for FitBalance
    if (screen === 'PlanScreen') {
      navigation.navigate('Root', { screen: 'Dashboard' }); // Example
    } else if (screen === 'weighFood') {
        navigation.navigate('weighFood');
    }
  }
};
