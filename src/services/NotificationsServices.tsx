import * as Notifications from 'expo-notifications';

export const setupNotifications = async () => {
    // Configuración inicial
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });

    // Solicitar permisos
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('No se otorgaron permisos para notificaciones');
        return false;
    }
    return true;
};

// Programar notificación
export const scheduleNotification = async (title: string, body: string, seconds: number) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: 'default',
        },
        trigger: {
            type: 'timeInterval',
            seconds,
            repeats: true,
        } as Notifications.TimeIntervalTriggerInput,
    });
};