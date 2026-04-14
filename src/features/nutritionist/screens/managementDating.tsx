import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { Appointment, Nutritionist, nutritionistService } from '../services/nutritionist.service';

const ManagementDatingScreen = () => {
    const { t, i18n } = useTranslation();
    const { colors, darkMode } = useTheme();
    const { user } = useUser();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [upcoming, setUpcoming] = useState<Appointment[]>([]);
    const [past, setPast] = useState<Appointment[]>([]);
    const [nutritionist, setNutritionist] = useState<Nutritionist | null>(null);

    const styles = createDynamicStyles(colors, darkMode);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [appointmentsData, nutritionistData] = await Promise.all([
                    nutritionistService.getAppointmentsByPatientId(user.id),
                    user.nutritionist_id ? nutritionistService.getById(user.nutritionist_id) : Promise.resolve(null)
                ]);
                setAppointments(appointmentsData);

                if (nutritionistData) {
                    setNutritionist(nutritionistData);
                }
            } catch (err) {
                console.error("ERROR EN FETCH:", err);
                setError(err instanceof Error ? err.message : t('auth.networkError'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        const now = new Date();
        const upcomingAppointments = appointments.filter(appt => new Date(appt.appointment_date) >= now);
        const pastAppointments = appointments.filter(appt => new Date(appt.appointment_date) < now);

        setUpcoming(upcomingAppointments.sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()));
        setPast(pastAppointments.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()));
    }, [appointments]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
        return {
            month: date.toLocaleDateString(locale, { month: 'short' }),
            day: date.getDate()
        };
    };

    const getAppointmentTitle = (type: string) => {
        switch (type) {
            case 'virtual': return t('appointments.virtual');
            case 'in-person': return t('appointments.inPerson');
            default: return t('appointments.default');
        }
    };

    const getAppointmentSubtitle = (appointment: Appointment) => {
        if (appointment.nutritionist_id && nutritionist) {
            return `${nutritionist.name} ${nutritionist.lastName}`;
        }
        return appointment.type === 'virtual' ? t('appointments.videoCall') : t('appointments.mainOffice');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{t('appointments.loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text style={styles.headerSubtitle}>{t('appointments.subtitle')}</Text>
                    <Text style={styles.headerTitle}>{t('appointments.title')}</Text>
                    <Text style={styles.headerDescription}>
                        {t('appointments.description')}
                    </Text>
                </View>

                {/* Upcoming Appointments Section */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionIcon}>📅</Text>
                        <Text style={styles.sectionTitle}>{t('appointments.upcoming')}</Text>
                    </View>
                    {upcoming.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{upcoming.length} {t('appointments.pending')}</Text>
                        </View>
                    )}
                </View>

                {upcoming.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>{t('appointments.noAppointments')}</Text>
                        <Text style={styles.emptySubtext}>{t('appointments.noAppointmentsSub')}</Text>
                    </View>
                ) : (
                    upcoming.map(appointment => {
                        const { month, day } = formatDate(appointment.appointment_date);
                        return (
                            <View key={appointment._id} style={styles.appointmentCard}>
                                <View style={styles.cardContent}>
                                    <View style={styles.dateBox}>
                                        <Text style={styles.dateMonth}>{month}</Text>
                                        <Text style={styles.dateDay}>{day}</Text>
                                    </View>
                                    <View style={styles.appointmentInfo}>
                                        <Text style={styles.appointmentTitle}>
                                            {getAppointmentTitle(appointment.type)}
                                        </Text>
                                        <Text style={styles.appointmentSubtitle}>
                                            📍 {getAppointmentSubtitle(appointment)}
                                        </Text>
                                        <View style={styles.appointmentMeta}>
                                            <Text style={styles.metaText}>
                                                🕐 {appointment.appointment_time || '10:30 AM'}
                                            </Text>
                                            <Text style={styles.metaText}>
                                                {appointment.type === 'virtual' ? `📹 ${t('appointments.videoCall')}` : `📍 ${t('appointments.inPerson')}`}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity style={styles.secondaryButton}>
                                        <Text style={styles.secondaryButtonText}>{t('appointments.reschedule')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.primaryButton}>
                                        <Text style={styles.primaryButtonText}>
                                            {appointment.status === 'confirmed' ? t('appointments.join') : t('appointments.confirm')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}

                {/* Past Appointments Section */}
                {past.length > 0 && (
                    <View style={styles.pastSection}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionIcon}>📋</Text>
                            <Text style={styles.sectionTitle}>{t('appointments.history')}</Text>
                        </View>
                        
                        {past.slice(0, 5).map(appointment => {
                            const date = new Date(appointment.appointment_date);
                            const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
                            const dateStr = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
                            return (
                                <View key={appointment._id} style={styles.historyItem}>
                                    <View style={styles.historyItemLeft}>
                                        <View style={styles.historyIconBox}>
                                            <Text style={styles.historyIcon}>✓</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.historyTitle}>
                                                {getAppointmentTitle(appointment.type)}
                                            </Text>
                                            <Text style={styles.historyDate}>{dateStr} • {t('appointments.finished')}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Mini Stats Card - Tu Especialista */}
                {nutritionist && (
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>{t('appointments.yourSpecialist')}</Text>
                        <View style={styles.nutritionistRow}>
                            <View style={styles.nutritionistAvatar}>
                                <Text style={styles.avatarText}>👩‍⚕️</Text>
                            </View>
                            <View>
                                <Text style={styles.nutritionistName}>
                                    {nutritionist.name} {nutritionist.lastName}
                                </Text>
                                <Text style={styles.nutritionistRole}>
                                    {nutritionist.specialization || t('appointments.nutritionist')}
                                </Text>
                            </View>
                        </View>
                        {nutritionist.email && (
                            <Text style={styles.quoteText}>
                                📧 {nutritionist.email}
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const createDynamicStyles = (colors: any, darkMode: boolean) => StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: colors.background 
    },
    scrollContent: { 
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
    },
    loadingText: { 
        marginTop: 12, 
        fontSize: 16, 
        color: colors.textSecondary 
    },
    errorText: { 
        fontSize: 16, 
        textAlign: 'center' 
    },
    headerSection: { 
        marginBottom: 28,
        paddingTop: 8,
    },
    headerSubtitle: { 
        fontSize: 12, 
        fontWeight: '700', 
        color: colors.primary, 
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    headerTitle: { 
        fontSize: 32, 
        fontWeight: '800', 
        color: colors.onSurface,
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    headerDescription: { 
        fontSize: 14, 
        color: colors.textSecondary,
        lineHeight: 20,
        maxWidth: 320,
    },
    sectionHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitleRow: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    sectionIcon: { 
        fontSize: 18, 
        marginRight: 8 
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: colors.onSurface,
    },
    badge: { 
        backgroundColor: `${colors.primary}20`,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    badgeText: { 
        fontSize: 11, 
        fontWeight: '700', 
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyText: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: colors.text,
        marginBottom: 4,
    },
    emptySubtext: { 
        fontSize: 14, 
        color: colors.textSecondary,
    },
    appointmentCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardContent: { 
        flexDirection: 'row', 
        marginBottom: 16 
    },
    dateBox: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    dateMonth: { 
        fontSize: 10, 
        fontWeight: '700', 
        color: colors.onPrimaryContainer,
        textTransform: 'uppercase',
    },
    dateDay: { 
        fontSize: 22, 
        fontWeight: '800', 
        color: colors.onPrimaryContainer,
    },
    appointmentInfo: { 
        flex: 1, 
        justifyContent: 'center' 
    },
    appointmentTitle: { 
        fontSize: 17, 
        fontWeight: '700', 
        color: colors.onSurface,
        marginBottom: 2,
    },
    appointmentSubtitle: { 
        fontSize: 13, 
        color: colors.textSecondary,
        marginBottom: 8,
    },
    appointmentMeta: { 
        flexDirection: 'row', 
        gap: 16 
    },
    metaText: { 
        fontSize: 12, 
        color: colors.outline,
    },
    cardActions: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        gap: 10 
    },
    secondaryButton: {
        backgroundColor: colors.secondaryContainer,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
    },
    secondaryButtonText: { 
        fontSize: 13, 
        fontWeight: '700', 
        color: colors.onSecondaryContainer,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    primaryButtonText: { 
        fontSize: 13, 
        fontWeight: '700', 
        color: colors.onPrimary,
    },
    pastSection: { 
        marginTop: 24,
        paddingTop: 24,
    },
    historyItem: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    historyItemLeft: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    historyIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${colors.success}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyIcon: { 
        fontSize: 16, 
        color: colors.success,
    },
    historyTitle: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: colors.onSurface,
        marginBottom: 2,
    },
    historyDate: { 
        fontSize: 11, 
        color: colors.textSecondary,
    },
    statsCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
        borderWidth: 1,
        borderColor: `${colors.primary}30`,
    },
    statsTitle: { 
        fontSize: 12, 
        fontWeight: '700', 
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    nutritionistRow: { 
        flexDirection: 'row', 
        alignItems: 'center',
        marginBottom: 12,
    },
    nutritionistAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { 
        fontSize: 22 
    },
    nutritionistName: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: colors.onSurface,
    },
    nutritionistRole: { 
        fontSize: 11, 
        color: colors.primary,
        fontWeight: '500',
    },
    quoteText: { 
        fontSize: 12, 
        color: colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 18,
    },
});

export default ManagementDatingScreen;
