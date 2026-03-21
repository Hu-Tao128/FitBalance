import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

interface Nutritionist {
    _id: string;
    name: string;
    lastName: string;
    secondLastName?: string;
    email: string;
    city: string;
    street: string;
    neighborhood: string;
    streetNumber: string;
    licenseNumber?: string;
    specialization?: string;
}

const NutritionistProfileScreen = () => {
    const { colors, darkMode } = useTheme();
    const { user } = useUser();

    const [nutritionist, setNutritionist] = useState<Nutritionist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const styles = createDynamicStyles(colors, darkMode);

    useEffect(() => {
        if (!user || !user.nutritionist_id) {
            setError('No tienes un nutricionista asignado.');
            setLoading(false);
            return;
        }

        const fetchNutritionist = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_CONFIG.BASE_URL}/nutritionist/${user.nutritionist_id}`);
                setNutritionist(response.data);
            } catch (err: any) {
                console.error("Failed to fetch nutritionist:", err);
                setError(err.response?.data?.message || 'No se pudieron cargar los detalles del nutricionista.');
            } finally {
                setLoading(false);
            }
        };

        fetchNutritionist();
    }, [user]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centeredContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Cargando perfil...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centeredContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!nutritionist) {
        return null;
    }

    const fullName = `${nutritionist.name} ${nutritionist.lastName} ${nutritionist.secondLastName || ''}`;
    const fullAddress = `${nutritionist.street} #${nutritionist.streetNumber}, ${nutritionist.neighborhood}, ${nutritionist.city}`;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Hero Card */}
                <View style={styles.heroCard}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={require('../../assets/image.png')}
                            style={styles.avatarImage}
                        />
                    </View>
                    <Text style={styles.name}>{fullName}</Text>
                    <Text style={styles.specialization}>
                        {nutritionist.specialization || 'Especialista en Nutrición'}
                    </Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Premium</Text>
                        </View>
                    </View>
                </View>

                {/* Contact Info Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información de Contacto</Text>
                    <View style={styles.detailsCard}>
                        <InfoRow 
                            icon="mail-outline" 
                            label="Correo Electrónico" 
                            value={nutritionist.email}
                        />
                        <InfoRow 
                            icon="location-outline" 
                            label="Dirección de Consultorio" 
                            value={fullAddress}
                        />
                        {nutritionist.licenseNumber && (
                            <InfoRow 
                                icon="shield-checkmark-outline" 
                                label="Licencia Profesional" 
                                value={nutritionist.licenseNumber}
                            />
                        )}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                    <View style={styles.actionsCard}>
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.primaryContainer }]}>
                                <Ionicons name="chatbubble-ellipses" size={22} color={colors.onPrimaryContainer} />
                            </View>
                            <Text style={styles.actionText}>Enviar Mensaje</Text>
                            <Text style={styles.actionArrow}>→</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.actionItem}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.secondaryContainer }]}>
                                <Ionicons name="calendar-outline" size={22} color={colors.onSecondaryContainer} />
                            </View>
                            <Text style={styles.actionText}>Agendar Cita</Text>
                            <Text style={styles.actionArrow}>→</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => {
    const { colors, darkMode } = useTheme();
    const styles = createDynamicStyles(colors, darkMode);
    return (
        <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value} selectable>{value}</Text>
            </View>
        </View>
    );
};

const createDynamicStyles = (colors: any, darkMode: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 20, paddingBottom: 40 },
    centeredContainer: { 
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
        textAlign: 'center', 
        color: colors.error,
        padding: 20,
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
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: colors.surfaceContainerHighest,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: colors.primaryContainer,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    name: { 
        fontSize: 22, 
        fontWeight: '800', 
        color: colors.onSurface, 
        textAlign: 'center',
        marginBottom: 4,
    },
    specialization: { 
        fontSize: 14, 
        color: colors.textSecondary,
        marginBottom: 12,
    },
    badgeRow: { 
        flexDirection: 'row', 
        gap: 8 
    },
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
    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    detailsCard: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceContainerHighest,
        marginRight: 14,
    },
    infoTextContainer: { flex: 1 },
    label: { 
        fontSize: 12, 
        color: colors.textSecondary, 
        marginBottom: 2,
    },
    value: { 
        fontSize: 15, 
        color: colors.onSurface, 
        fontWeight: '500',
        lineHeight: 20,
    },
    actionsCard: {
        borderRadius: 20,
        backgroundColor: colors.card,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    actionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: colors.onSurface,
    },
    actionArrow: {
        fontSize: 18,
        color: colors.outline,
    },
});

export default NutritionistProfileScreen;