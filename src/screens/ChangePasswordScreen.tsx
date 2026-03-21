import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const ChangePasswordScreen = () => {
    const { colors, darkMode } = useTheme();
    const { user } = useUser();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const pid = user?.id;

    const styles = createDynamicStyles(colors, darkMode);

    const handleSaveChanges = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Las nuevas contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await axios.put(
                `${API_CONFIG.BASE_URL}/patients/change-password`,
                {
                    patient_id: pid,
                    currentPassword,
                    newPassword
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            Alert.alert('Éxito', response.data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Ocurrió un error al actualizar.');
            console.error(err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/\d/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(newPassword);
    const strengthLabels = ['Muy Débil', 'Débil', 'Media', 'Fuerte'];
    const strengthColors = [colors.error, '#FF9800', colors.warning, colors.success];

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
                        <Text style={styles.headerDescription}>
                            Actualiza tus credenciales para mantener tu cuenta segura.
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {/* Current Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CONTRASEÑA ACTUAL</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showCurrentPassword}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.outline}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIcon}
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    <Ionicons 
                                        name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'} 
                                        size={22} 
                                        color={colors.outline} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.outline}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIcon}
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Ionicons 
                                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} 
                                        size={22} 
                                        color={colors.outline} 
                                    />
                                </TouchableOpacity>
                            </View>
                            {/* Password Strength */}
                            <View style={styles.strengthContainer}>
                                {[0, 1, 2, 3].map((i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.strengthBar,
                                            { backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : colors.surfaceVariant }
                                        ]}
                                    />
                                ))}
                                {newPassword.length > 0 && (
                                    <Text style={[styles.strengthLabel, { color: strengthColors[passwordStrength - 1] || colors.outline }]}>
                                        {strengthLabels[passwordStrength - 1] || 'Muy Débil'}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CONFIRMAR NUEVA CONTRASEÑA</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.outline}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons 
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                                        size={22} 
                                        color={colors.outline} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Requirements Checklist */}
                        <View style={styles.requirementsCard}>
                            <Text style={styles.requirementsTitle}>Requisitos de seguridad</Text>
                            <View style={styles.requirementsList}>
                                <View style={styles.requirementItem}>
                                    <Text style={styles.checkIcon}>✓</Text>
                                    <Text style={styles.requirementText}>Mínimo 8 caracteres</Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <Text style={[styles.checkIcon, { color: /\d/.test(newPassword) ? colors.success : colors.outline }]}>
                                        {/\d/.test(newPassword) ? '✓' : '○'}
                                    </Text>
                                    <Text style={styles.requirementText}>Al menos un número</Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <Text style={[styles.checkIcon, { color: /[A-Z]/.test(newPassword) ? colors.success : colors.outline }]}>
                                        {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                                    </Text>
                                    <Text style={styles.requirementText}>Una letra mayúscula</Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <Text style={[styles.checkIcon, { color: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? colors.success : colors.outline }]}>
                                        {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? '✓' : '○'}
                                    </Text>
                                    <Text style={styles.requirementText}>Carácter especial (!@#)</Text>
                                </View>
                            </View>
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        {/* Save Button */}
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color={colors.onPrimary} />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                                    <Text style={styles.buttonIcon}>→</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Security Notice */}
                    <View style={styles.securityNotice}>
                        <View style={styles.noticeIconBox}>
                            <Text style={styles.noticeIcon}>🛡️</Text>
                        </View>
                        <View style={styles.noticeContent}>
                            <Text style={styles.noticeTitle}>Protección de Cuenta</Text>
                            <Text style={styles.noticeText}>
                                Nunca compartas tu contraseña con terceros. FitBalance utiliza cifrado de extremo a extremo para proteger tus datos de salud y privacidad.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const createDynamicStyles = (colors: any, darkMode: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 20, paddingBottom: 40 },
    headerSection: { marginBottom: 28, paddingTop: 8 },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.onSurface,
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    headerDescription: {
        fontSize: 14,
        color: colors.secondary,
        lineHeight: 20,
    },
    formCard: {
        backgroundColor: colors.surfaceContainerLowest || colors.card,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    inputGroup: { marginBottom: 20 },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.onSurfaceVariant,
        letterSpacing: 1,
        marginBottom: 10,
    },
    inputWrapper: { position: 'relative' },
    input: {
        backgroundColor: colors.surfaceContainerHighest,
        color: colors.onSurface,
        padding: 16,
        borderRadius: 14,
        fontSize: 16,
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: [{ translateY: -11 }],
        padding: 4,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 6,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 6,
    },
    requirementsCard: {
        backgroundColor: colors.surfaceContainer,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    requirementsTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.secondary,
        letterSpacing: 1,
        marginBottom: 12,
    },
    requirementsList: { gap: 8 },
    requirementItem: { flexDirection: 'row', alignItems: 'center' },
    checkIcon: { fontSize: 14, marginRight: 10, color: colors.success },
    requirementText: { fontSize: 12, color: colors.onSurface, fontWeight: '500' },
    errorText: {
        color: colors.error,
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    saveButtonText: {
        color: colors.onPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    buttonIcon: { fontSize: 18, marginLeft: 8, color: colors.onPrimary },
    securityNotice: {
        flexDirection: 'row',
        backgroundColor: colors.secondaryContainer,
        borderRadius: 20,
        padding: 18,
        alignItems: 'flex-start',
    },
    noticeIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.secondaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    noticeIcon: { fontSize: 22 },
    noticeContent: { flex: 1 },
    noticeTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.onSecondaryContainer,
        marginBottom: 4,
    },
    noticeText: {
        fontSize: 12,
        color: colors.onSecondaryFixedVariant,
        lineHeight: 18,
    },
});

export default ChangePasswordScreen;