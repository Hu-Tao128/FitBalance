import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export interface Appointment {
    _id: string;
    patient_name: string;
    appointment_date: string;
    appointment_time: string;
    appointment_type: string | null;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string | null;
}

interface AppointmentCardProps {
    appointment: Appointment;
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
    const { colors } = useTheme();
    const appointmentDate = new Date(appointment.appointment_date);

    // Date formatters for English abbreviations (SUN, AUG, etc.)
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayOfMonth = appointmentDate.getDate();
    const month = appointmentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

    const getStatusStyle = () => {
        switch (appointment.status) {
            case 'completed':
                return { icon: 'check-circle', color: colors.success || '#34C759', text: 'Completed' };
            case 'cancelled':
                return { icon: 'close-circle', color: colors.danger || '#FF453A', text: 'Cancelled' };
            case 'scheduled':
            default:
                return { icon: 'clock-time-three', color: colors.warning || '#FF9500', text: 'Scheduled' };
        }
    };

    const statusStyle = getStatusStyle();

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.dateContainer, { backgroundColor: colors.primary }]}>
                <Text style={styles.dateTextDayOfWeek}>{dayOfWeek}</Text>
                <Text style={styles.dateTextDay}>{dayOfMonth}</Text>
                <Text style={styles.dateTextMonth}>{month}</Text>
            </View>

            <View style={styles.detailsContainer}>
                <Text style={[styles.typeText, { color: colors.primary }]}>
                    {appointment.appointment_type || 'General Consultation'}
                </Text>
                <Text style={[styles.timeText, { color: colors.text }]}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
                    {' '}{appointment.appointment_time}
                </Text>
                <View style={styles.statusContainer}>
                    <MaterialCommunityIcons name={statusStyle.icon as any} size={16} color={statusStyle.color} />
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderRadius: 16,
        marginVertical: 8,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1,
    },
    dateContainer: {
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    dateTextDayOfWeek: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    dateTextDay: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 38,
    },
    dateTextMonth: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    detailsContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    typeText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    timeText: {
        fontSize: 16,
        marginBottom: 12,
        opacity: 0.9,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    statusText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default AppointmentCard;