import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

// El campo 'profileImageUrl' ya no es necesario en la interfaz
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
    const { colors } = useTheme();
    const { user } = useUser();

    const [nutritionist, setNutritionist] = useState<Nutritionist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const styles = createDynamicStyles(colors);

    useEffect(() => {
        if (!user || !user.nutritionist_id) {
            setError('You are not assigned to a nutritionist.');
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
                setError(err.response?.data?.message || 'Could not load nutritionist details.');
            } finally {
                setLoading(false);
            }
        };

        fetchNutritionist();
    }, [user]);

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!nutritionist) {
        return null;
    }

    const fullName = `${nutritionist.name} ${nutritionist.lastName} ${nutritionist.secondLastName || ''}`;
    const fullAddress = `${nutritionist.street} #${nutritionist.streetNumber}, ${nutritionist.neighborhood}, ${nutritionist.city}`;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerCard}>
                    <View style={styles.avatarContainer}>
                        {/* ✅ Se eliminó la lógica condicional, ahora solo muestra la imagen local */}
                        <Image
                            // Asegúrate de que esta ruta a tu imagen sea correcta
                            source={require('../../assets/image.png')}
                            style={styles.avatarImage}
                        />
                    </View>
                    <Text style={styles.name}>{fullName}</Text>
                    <Text style={styles.specialization}>
                        {nutritionist.specialization || 'Nutrition Specialist'}
                    </Text>
                </View>

                <View style={styles.detailsCard}>
                    <InfoRow icon="mail-outline" label="Email" value={nutritionist.email} />
                    <InfoRow icon="location-outline" label="Office Address" value={fullAddress} />
                    {nutritionist.licenseNumber && (
                        <InfoRow icon="shield-checkmark-outline" label="Professional License" value={nutritionist.licenseNumber} />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => {
    const { colors } = useTheme();
    const styles = createDynamicStyles(colors);
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

const createDynamicStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 20 },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background },
    errorText: { fontSize: 16, textAlign: 'center', color: colors.danger },
    headerCard: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        backgroundColor: colors.card,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: colors.primary,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    name: { fontSize: 24, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
    specialization: { fontSize: 16, color: colors.textSecondary, marginTop: 4 },
    detailsCard: {
        padding: 16,
        borderRadius: 20,
        backgroundColor: colors.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: `${colors.primary}20`,
        marginRight: 16,
    },
    infoTextContainer: { flex: 1 },
    label: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
    value: { fontSize: 16, color: colors.text, fontWeight: '500' },
});

export default NutritionistProfileScreen;