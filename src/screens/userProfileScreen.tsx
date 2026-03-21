import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { API_CONFIG } from '../config/config';

interface Appointment {
    _id: string;
    appointment_date: string;
    appointment_time: string;
    type: 'virtual' | 'in-person';
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const UserProfileScreen = ({ navigation }: any) => {
    const { colors, darkMode, toggleTheme } = useTheme();
    const { user } = useUser();
    const styles = createStyles(colors);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);

    useEffect(() => {
        if (!user?.id) {
            setLoadingAppointments(false);
            return;
        }

        const fetchAppointments = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/appointments/${user.id}`);
                if (response.ok) {
                    const data: Appointment[] = await response.json();
                    const now = new Date();
                    const upcoming = data.filter(appt =>
                        new Date(appt.appointment_date) >= now &&
                        appt.status !== 'cancelled' &&
                        appt.status !== 'completed'
                    );
                    setAppointments(upcoming.slice(0, 2));
                }
            } catch (err) {
                console.error('Error fetching appointments:', err);
            } finally {
                setLoadingAppointments(false);
            }
        };

        fetchAppointments();
    }, [user]);

    const handleLogout = () => {
        // Implement logout logic
    };

    const formatAppointmentDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${date.getDate()} ${months[date.getMonth()]}`;
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centeredContainer}>
                    <Text style={styles.noUserText}>No hay sesión iniciada</Text>
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
                {/* Profile Hero Section */}
                <View style={styles.heroCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>
                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <MaterialIcons name="edit" size={14} color={colors.onPrimary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user.username || 'Usuario'}</Text>
                    <Text style={styles.userEmail}>{user.email || 'email@ejemplo.com'}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Miembro</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions Grid */}
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => navigation?.navigate?.('EditProfile')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryContainer }]}>
                            <Ionicons name="person-outline" size={24} color={colors.onPrimaryContainer} />
                        </View>
                        <Text style={styles.quickActionText}>Perfil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => navigation?.navigate?.('NutritionistProfile')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.secondaryContainer }]}>
                            <Ionicons name="nutrition-outline" size={24} color={colors.onSecondaryContainer} />
                        </View>
                        <Text style={styles.quickActionText}>Nutricionista</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => navigation?.navigate?.('ChangePassword')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.tertiaryContainer }]}>
                            <Ionicons name="shield-checkmark-outline" size={24} color={colors.onTertiaryContainer} />
                        </View>
                        <Text style={styles.quickActionText}>Seguridad</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => navigation?.navigate?.('ManagementDating')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.surfaceContainerHighest }]}>
                            <Ionicons name="calendar-outline" size={24} color={colors.onSurfaceVariant} />
                        </View>
                        <Text style={styles.quickActionText}>Citas</Text>
                    </TouchableOpacity>
                </View>

                {/* Appointments Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Próximas Citas</Text>
                        <TouchableOpacity onPress={() => navigation?.navigate?.('ManagementDating')}>
                            <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingAppointments ? (
                        <ActivityIndicator size="small" color={colors.primary} style={styles.appointmentsLoader} />
                    ) : appointments.length > 0 ? (
                        <View style={styles.appointmentsContainer}>
                            {appointments.map((appt) => (
                                <View key={appt._id} style={styles.appointmentCard}>
                                    <View style={styles.appointmentIconBox}>
                                        <Ionicons
                                            name={appt.type === 'virtual' ? 'videocam-outline' : 'location-outline'}
                                            size={22}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.appointmentInfo}>
                                        <Text style={styles.appointmentTitle}>
                                            {appt.type === 'virtual' ? 'Consulta Virtual' : 'Consulta Presencial'}
                                        </Text>
                                        <Text style={styles.appointmentDate}>
                                            {formatAppointmentDate(appt.appointment_date)} • {appt.appointment_time || '10:30 AM'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: `${colors.primary}15` }]}>
                                        <Text style={[styles.statusText, { color: colors.primary }]}>
                                            {appt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyAppointments}>
                            <Ionicons name="calendar-outline" size={32} color={colors.outlineVariant} />
                            <Text style={styles.emptyAppointmentsText}>Sin citas programadas</Text>
                        </View>
                    )}
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferencias</Text>
                    <View style={styles.card}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIcon}>
                                    <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.menuTitle}>Notificaciones</Text>
                                    <Text style={styles.menuSubtitle}>Recordatorios y alertas</Text>
                                </View>
                            </View>
                            <Switch
                                value={true}
                                trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
                                thumbColor={colors.primary}
                            />
                        </View>

                        <View style={[styles.menuItem, styles.lastMenuItem]}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIcon}>
                                    <Ionicons name="moon-outline" size={22} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.menuTitle}>Modo Oscuro</Text>
                                    <Text style={styles.menuSubtitle}>{darkMode ? 'Activado' : 'Desactivado'}</Text>
                                </View>
                            </View>
                            <Switch
                                value={darkMode}
                                onValueChange={() => toggleTheme()}
                                trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
                                thumbColor={colors.primary}
                            />
                        </View>
                    </View>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appVersion}>FitBalance v4.8.2</Text>
                    <Text style={styles.appTagline}>Diseñado para tu bienestar</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 20, paddingBottom: 40 },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noUserText: {
        color: colors.text,
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.7,
    },
    heroCard: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.primary,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: colors.onPrimaryContainer,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.card,
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.onSurface,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    badgeRow: { flexDirection: 'row', gap: 8 },
    badge: {
        backgroundColor: `${colors.primary}20`,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    quickActionCard: {
        width: '47%',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    quickActionText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.onSurface,
    },
    section: { marginBottom: 24 },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    appointmentsLoader: {
        marginVertical: 20,
    },
    appointmentsContainer: {
        gap: 12,
    },
    appointmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    appointmentIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    appointmentInfo: {
        flex: 1,
    },
    appointmentTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.onSurface,
        marginBottom: 4,
    },
    appointmentDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    emptyAppointments: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    emptyAppointmentsText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 12,
    },
    card: {
        borderRadius: 20,
        backgroundColor: colors.card,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.surfaceContainerHighest,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.onSurface,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 32,
        opacity: 0.5,
    },
    appVersion: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textSecondary,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    appTagline: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
    },
});

export default UserProfileScreen;
