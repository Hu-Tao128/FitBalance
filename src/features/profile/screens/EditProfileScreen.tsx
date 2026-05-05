import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { KeyboardTypeOptions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';

interface ProfileInputProps {
    icon: string;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const ProfileInput: React.FC<ProfileInputProps> = ({ icon, label, value, onChangeText, keyboardType = 'default', autoCapitalize = 'sentences', ...props }) => {
    const { colors, darkMode } = useTheme();
    const styles = createDynamicStyles(colors, darkMode);
    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputBox}>
                <Ionicons name={icon as any} size={20} color={colors.primary} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    placeholderTextColor={colors.outline}
                    autoCapitalize={autoCapitalize}
                    {...props}
                />
            </View>
        </View>
    );
};

export default function EditProfileScreen({ navigation }: any) {
    const { colors, darkMode } = useTheme();
    const { user, updateUser } = useUser();
    const { t } = useTranslation();
    const styles = createDynamicStyles(colors, darkMode);

    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: user?.phone || '',
        age: user?.age?.toString() || '',
        height_cm: user?.height_cm?.toString() || '',
        weight_kg: user?.weight_kg?.toString() || '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        const updatedData = {
            ...formData,
            age: Number(formData.age) || undefined,
            height_cm: Number(formData.height_cm) || undefined,
            weight_kg: Number(formData.weight_kg) || undefined,
        };

        try {
            await updateUser(updatedData);
            Alert.alert(t('auth.success'), t('profile.profileUpdated'), [
                { text: t('profile.ok'), onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert(t('error'), t('profile.profileUpdateError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{t('profile.editProfileTitle', 'Editar Perfil')}</Text>
                            <Text style={styles.subtitle}>
                                {t('profile.updateInfo', 'Actualiza tu información personal')}
                            </Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.formCard}>
                            <ProfileInput
                                icon="mail-outline"
                                label={t('profile.emailLabel')}
                                value={formData.email}
                                onChangeText={(v) => handleInputChange('email', v)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <ProfileInput
                                icon="phone-portrait-outline"
                                label={t('profile.phoneLabel')}
                                value={formData.phone}
                                onChangeText={(v) => handleInputChange('phone', v)}
                                keyboardType="phone-pad"
                            />
                            <ProfileInput
                                icon="calendar-outline"
                                label={t('profile.ageLabel')}
                                value={formData.age}
                                onChangeText={(v) => handleInputChange('age', v)}
                                keyboardType="numeric"
                            />
                            <ProfileInput
                                icon="resize-outline"
                                label={t('profile.heightLabel')}
                                value={formData.height_cm}
                                onChangeText={(v) => handleInputChange('height_cm', v)}
                                keyboardType="numeric"
                            />
                            <ProfileInput
                                icon="fitness-outline"
                                label={t('profile.weightLabel')}
                                value={formData.weight_kg}
                                onChangeText={(v) => handleInputChange('weight_kg', v)}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity 
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                            onPress={handleSave} 
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.onPrimary} />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
                                    <Ionicons name="checkmark-circle" size={22} color={colors.onPrimary} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelButtonText}>{t('profile.cancel')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createDynamicStyles = (colors: any, darkMode: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { marginBottom: 28, paddingTop: 8 },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.onSurface,
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    formCard: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputContainer: { marginBottom: 20 },
    label: { 
        color: colors.onSurfaceVariant, 
        fontSize: 12, 
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceContainerHighest,
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 52,
    },
    input: { 
        flex: 1, 
        color: colors.onSurface, 
        fontSize: 16, 
        marginLeft: 12,
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
        marginBottom: 12,
    },
    saveButtonDisabled: { opacity: 0.7 },
    buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    saveButtonText: { 
        color: colors.onPrimary, 
        fontSize: 16, 
        fontWeight: '700',
        marginRight: 8,
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: { 
        color: colors.textSecondary, 
        fontSize: 15, 
        fontWeight: '600' 
    },
});