import { scheduleNotification } from '../services/NotificationsServices';

const scheduleWaterReminder = async () => {
    await scheduleNotification(
        '¡Hidrátate! 💧',
        'Es hora de tomar un vaso de agua',
        60
    );
};