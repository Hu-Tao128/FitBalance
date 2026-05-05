import { Entypo, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { authService } from '../services/auth.service';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
type ForgotStep = 'email' | 'code' | 'reset';

type ForgotFlowState = {
    visible: boolean;
    step: ForgotStep;
    email: string;
    resetToken: string;
};

const FORGOT_FLOW_STORAGE_KEY = 'forgot_password_flow_state';

export default function LoginScreen() {
    const { t } = useTranslation();
    const { login } = useUser();
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();

    const ui = {
        background: '#FFFFFF',
        text: '#1F2937',
        textMuted: '#6B7280',
        primary: '#188827',
        border: '#DDE3DA',
        surface: '#F6F8F5',
        error: '#B3261E',
        success: '#2E7D32',
        cancelBg: '#FDECEC',
        cancelBorder: '#F5B5B5',
        cancelText: '#B3261E',
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: ui.background
        },
        scrollContent: {
            flexGrow: 1,
            justifyContent: 'flex-start',
        },
        header: {
            height: '50%',
            width: '100%',
            overflow: 'hidden',
        },
        logoImage: {
            width: '100%',
            height: '100%',
        },
        loginBox: {
            marginTop: -20,
            paddingHorizontal: 30,
            paddingVertical: 20,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            paddingHorizontal: 15,
            marginBottom: 15,
        },
        input: {
            flex: 1,
            height: 50,
            marginLeft: 10,
            fontSize: 16,
        },
        loginButton: {
            backgroundColor: 'transparent',
            borderColor: ui.primary,
            borderWidth: 1.5,
            borderRadius: 25,
            paddingVertical: 12,
            alignItems: 'center',
            marginBottom: 12,
        },
        loginText: {
            color: ui.primary,
            fontWeight: 'bold',
            fontSize: 16,
        },
        signUpText: {
            textAlign: 'center',
            fontSize: 14,
            color: ui.textMuted,
            marginBottom: 10,
        },
        footerDecor: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 130,
            zIndex: 100,
            backgroundColor: ui.background,
        },
        footerImage: {
            width: '100%',
            height: '130%',
        }
    });

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    const [forgotVisible, setForgotVisible] = useState(false);
    const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotMessageType, setForgotMessageType] = useState<'success' | 'error'>('error');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const getPasswordStrength = (value: string) => {
        let strength = 0;
        if (value.length >= 8) strength++;
        if (/\d/.test(value)) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(newPassword);
    const strengthLabels = [
        t('auth.veryWeak'),
        t('auth.weak'),
        t('auth.medium'),
        t('auth.strong')
    ];
    const strengthColors = [ui.error, '#FF9800', colors.warning || '#FFC107', ui.success];

    const persistForgotFlow = async (override?: Partial<ForgotFlowState>) => {
        try {
            const payload: ForgotFlowState = {
                visible: override?.visible ?? forgotVisible,
                step: override?.step ?? forgotStep,
                email: override?.email ?? forgotEmail,
                resetToken: override?.resetToken ?? resetToken,
            };
            if (!payload.visible) {
                await AsyncStorage.removeItem(FORGOT_FLOW_STORAGE_KEY);
                return;
            }
            await AsyncStorage.setItem(FORGOT_FLOW_STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
            console.error('Error saving forgot flow state:', error);
        }
    };

    const resetForgotFlow = async () => {
        setForgotVisible(false);
        setForgotStep('email');
        setForgotEmail('');
        setResetCode('');
        setResetToken('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotMessage('');
        setForgotMessageType('error');
        setForgotLoading(false);
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
        await AsyncStorage.removeItem(FORGOT_FLOW_STORAGE_KEY);
    };

    useEffect(() => {
        const restoreForgotFlow = async () => {
            try {
                const raw = await AsyncStorage.getItem(FORGOT_FLOW_STORAGE_KEY);
                if (!raw) return;
                const data = JSON.parse(raw) as ForgotFlowState;
                if (!data?.visible) return;
                setForgotVisible(true);
                setForgotStep(data.step || 'email');
                setForgotEmail(data.email || '');
                setResetToken(data.resetToken || '');
            } catch (error) {
                console.error('Error restoring forgot flow state:', error);
            }
        };

        restoreForgotFlow();
    }, []);

    useEffect(() => {
        persistForgotFlow();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forgotVisible, forgotStep, forgotEmail, resetToken]);

    const handleLogin = async () => {
        if (!username || !password) {
            setMessage(t('auth.completeCredentials', 'Please complete your username and password.'));
            return;
        }

        try {
            setMessage('');

            const res = await authService.login(username.trim(), password);

            if (!res.patient || !res.patient.username) {
                throw new Error(t('auth.invalidCredentials'));
            }

            await login({
                id: res.patient._id,
                name: res.patient.name,
                username: res.patient.username,
                email: res.patient.email,
                phone: res.patient.phone,
                age: res.patient.age,
                gender: res.patient.gender,
                height_cm: res.patient.height_cm,
                weight_kg: res.patient.weight_kg,
                objective: res.patient.objective,
                allergies: res.patient.allergies || [],
                dietary_restrictions: res.patient.dietary_restrictions || [],
                last_consultation: res.patient.last_consultation,
                nutritionist_id: res.patient.nutritionist_id,
                isActive: res.patient.isActive
            });

            setMessage(`✅ ${t('auth.welcomeUser', { name: res.patient.name, defaultValue: 'Welcome, {{name}}' })}`);
            navigation.navigate('Root');
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage('❌ ' + error.response.data.message);
            } else if (error.response && error.response.status === 401) {
                setMessage('❌ ' + t('auth.incorrectCredentials', 'Incorrect username or password'));
            } else {
                setMessage('❌ ' + t('auth.networkError', 'Network or server error'));
            }
            console.error('Login error:', error);
        }
    };

    const handleOpenForgotFlow = async () => {
        setForgotVisible(true);
        setForgotStep('email');
        setForgotMessage('');
        setForgotMessageType('error');
        await persistForgotFlow({ visible: true, step: 'email' });
    };

    const showCancelRecoveryAlert = () => {
        Alert.alert(
            t('auth.cancelRecovery'),
            t('auth.cancelRecoveryMessage'),
            [
                { text: t('auth.continueProcess'), style: 'cancel' },
                { text: t('auth.cancelRecoveryButton'), style: 'destructive', onPress: () => resetForgotFlow() }
            ]
        );
    };

    useEffect(() => {
        if (!forgotVisible) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            showCancelRecoveryAlert();
            return true;
        });
        return () => sub.remove();
    }, [forgotVisible]);

    const handleSendResetCode = async () => {
        if (!forgotEmail.trim()) {
            setForgotMessage(t('auth.enterEmail'));
            setForgotMessageType('error');
            return;
        }

        try {
            setForgotLoading(true);
            setForgotMessage('');
            const response = await authService.sendResetCode(forgotEmail.trim().toLowerCase());
            setForgotMessage(response?.message || t('auth.recoveryCodeSent'));
            setForgotMessageType('success');
            setForgotStep('code');
            await persistForgotFlow({ visible: true, step: 'code', email: forgotEmail.trim().toLowerCase() });
        } catch (error: any) {
            const backendMsg = error?.response?.data?.message;
            const status = error?.response?.status;
            setForgotMessage(backendMsg || `${t('auth.couldNotSendCode')}${status ? ` (HTTP ${status})` : ''}.`);
            setForgotMessageType('error');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleVerifyResetCode = async () => {
        if (!forgotEmail.trim() || !resetCode.trim()) {
            setForgotMessage(t('auth.enterEmailAndCode'));
            setForgotMessageType('error');
            return;
        }

        try {
            setForgotLoading(true);
            setForgotMessage('');
            const response = await authService.verifyResetCode(forgotEmail.trim().toLowerCase(), resetCode.trim());
            if (!response?.resetToken) {
                throw new Error(t('auth.noResetToken'));
            }
            setResetToken(response.resetToken);
            setForgotStep('reset');
            setForgotMessage(response?.message || t('auth.validCode'));
            setForgotMessageType('success');
            await persistForgotFlow({
                visible: true,
                step: 'reset',
                email: forgotEmail.trim().toLowerCase(),
                resetToken: response.resetToken,
            });
        } catch (error: any) {
            setForgotMessage(error.response?.data?.message || t('auth.invalidOrExpiredCode'));
            setForgotMessageType('error');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetToken) {
            setForgotMessage(t('auth.invalidResetToken'));
            setForgotMessageType('error');
            return;
        }
        if (!newPassword || !confirmNewPassword) {
            setForgotMessage(t('auth.allFieldsRequired'));
            setForgotMessageType('error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setForgotMessage(t('auth.passwordsDoNotMatch'));
            setForgotMessageType('error');
            return;
        }
        if (newPassword.length < 8) {
            setForgotMessage(t('auth.minPasswordLength'));
            setForgotMessageType('error');
            return;
        }
        if (!/\d/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            setForgotMessage(t('auth.passwordRequirements'));
            setForgotMessageType('error');
            return;
        }

        try {
            setForgotLoading(true);
            setForgotMessage('');
            const response = await authService.resetPassword(resetToken, newPassword);
            Alert.alert(t('auth.success'), response?.message || t('auth.passwordUpdated'));
            await resetForgotFlow();
        } catch (error: any) {
            setForgotMessage(error.response?.data?.message || t('auth.couldNotUpdatePassword'));
            setForgotMessageType('error');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Image
                            source={require('../../../../assets/NewLogo.png')}
                            style={styles.logoImage}
                            resizeMode="cover"
                        />
                    </View>

                    <View style={styles.loginBox}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color="#999" />
                            <TextInput
                                placeholder={t('auth.username', 'Username')}
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Entypo name="lock" size={20} color="#999" />
                            <TextInput
                                placeholder={t('auth.password', 'Password')}
                                placeholderTextColor="#999"
                                secureTextEntry={secureTextEntry}
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => {
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollTo({ y: 260, animated: true });
                                    }, 120);
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => setSecureTextEntry((prev) => !prev)}
                                style={{ padding: 4 }}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                            <Text style={styles.loginText}>{t('common.login')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleOpenForgotFlow} activeOpacity={0.85}>
                            <Text style={[styles.signUpText, { color: colors.primary, fontWeight: '700' }]}>
                                {t('auth.forgotPassword', '¿Olvidaste tu contraseña?')}
                            </Text>
                        </TouchableOpacity>

                        {message ? (
                            <Text style={{ textAlign: 'center', marginTop: 10 }}>{message}</Text>
                        ) : null}

                        <Text style={styles.signUpText}>
                            {t('auth.bestVersion', 'Be your best version.')}
                        </Text>

                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync('https://hu-tao128.github.io/fitbalance-privacy/')}
                            style={{ marginTop: 20, alignItems: 'center' }}
                        >
                            <Text style={{ color: ui.primary, textDecorationLine: 'underline', fontSize: 12 }}>
                                {t('auth.privacyPolicy', 'Privacy Policy')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footerDecor, { backgroundColor: ui.background }]}>
                <Image
                    source={require('../../../../assets/f6.png')}
                    style={styles.footerImage}
                    resizeMode="cover"
                />
            </View>

            <Modal
                visible={forgotVisible}
                animationType="slide"
                transparent
                onRequestClose={showCancelRecoveryAlert}
            >
                <View style={modalStyles.overlay}>
                    <View style={[modalStyles.container, { backgroundColor: ui.background, borderColor: ui.border }]}>
                        <Text style={[modalStyles.title, { color: ui.text }]}>{t('auth.recoverPassword')}</Text>
                        <Text style={[modalStyles.subtitle, { color: ui.textMuted }]}>
                            {forgotStep === 'email' && t('auth.emailStepDescription')}
                            {forgotStep === 'code' && t('auth.codeStepDescription')}
                            {forgotStep === 'reset' && t('auth.resetStepDescription')}
                        </Text>

                        {forgotStep === 'email' && (
                            <TextInput
                                placeholder={t('auth.emailPlaceholder')}
                                placeholderTextColor="#9CA3AF"
                                style={[modalStyles.input, { backgroundColor: ui.surface, color: ui.text, borderColor: ui.border }]}
                                value={forgotEmail}
                                onChangeText={setForgotEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        )}

                        {forgotStep === 'code' && (
                            <>
                                <TextInput
                                    placeholder={t('auth.recoveryCodePlaceholder')}
                                    placeholderTextColor="#9CA3AF"
                                    style={[modalStyles.input, { backgroundColor: ui.surface, color: ui.text, borderColor: ui.border }]}
                                    value={resetCode}
                                    onChangeText={setResetCode}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={handleSendResetCode} disabled={forgotLoading}>
                                    <Text style={[modalStyles.secondaryLink, { color: ui.primary }]}>{t('auth.resendCode')}</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {forgotStep === 'reset' && (
                            <>
                                <View style={[modalStyles.passwordWrapper, { backgroundColor: ui.surface, borderColor: ui.border }]}>
                                    <TextInput
                                        placeholder={t('auth.newPasswordPlaceholder')}
                                        placeholderTextColor="#9CA3AF"
                                        style={[modalStyles.passwordInput, { color: ui.text }]}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showNewPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowNewPassword((prev) => !prev)}>
                                        <Ionicons
                                            name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color="#6B7280"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={[modalStyles.passwordWrapper, { backgroundColor: ui.surface, borderColor: ui.border }]}>
                                    <TextInput
                                        placeholder={t('auth.confirmNewPasswordPlaceholder')}
                                        placeholderTextColor="#9CA3AF"
                                        style={[modalStyles.passwordInput, { color: ui.text }]}
                                        value={confirmNewPassword}
                                        onChangeText={setConfirmNewPassword}
                                        secureTextEntry={!showConfirmNewPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmNewPassword((prev) => !prev)}>
                                        <Ionicons
                                            name={showConfirmNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color="#6B7280"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={modalStyles.strengthContainer}>
                                    {[0, 1, 2, 3].map((i) => (
                                        <View
                                            key={i}
                                            style={[
                                                modalStyles.strengthBar,
                                                { backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#D1D5DB' },
                                            ]}
                                        />
                                    ))}
                                    {newPassword.length > 0 && (
                                        <Text style={{ color: strengthColors[passwordStrength - 1] || '#6B7280', fontSize: 10, fontWeight: '700' }}>
                                            {strengthLabels[passwordStrength - 1] || t('auth.veryWeak')}
                                        </Text>
                                    )}
                                </View>

                                <View style={[modalStyles.requirementsCard, { backgroundColor: '#F9FAFB', borderColor: ui.border }]}>
                                    <Text style={[modalStyles.requirementItem, { color: newPassword.length >= 8 ? ui.success : '#6B7280' }]}>
                                        {newPassword.length >= 8 ? '✓' : '○'} {t('auth.min8Chars')}
                                    </Text>
                                    <Text style={[modalStyles.requirementItem, { color: /\d/.test(newPassword) ? ui.success : '#6B7280' }]}>
                                        {/\d/.test(newPassword) ? '✓' : '○'} {t('auth.atLeastOneNumber')}
                                    </Text>
                                    <Text style={[modalStyles.requirementItem, { color: /[A-Z]/.test(newPassword) ? ui.success : '#6B7280' }]}>
                                        {/[A-Z]/.test(newPassword) ? '✓' : '○'} {t('auth.atLeastOneUppercase')}
                                    </Text>
                                    <Text style={[modalStyles.requirementItem, { color: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? ui.success : '#6B7280' }]}>
                                        {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? '✓' : '○'} {t('auth.specialCharacter')}
                                    </Text>
                                </View>
                            </>
                        )}

                        {forgotMessage ? (
                            <Text style={[modalStyles.message, { color: forgotMessageType === 'success' ? ui.success : ui.error }]}>
                                {forgotMessage}
                            </Text>
                        ) : null}

                        <View style={modalStyles.actionsRow}>
                            {forgotStep !== 'email' && (
                                <TouchableOpacity
                                    style={[modalStyles.secondaryButton, { borderColor: ui.border, backgroundColor: ui.background }]}
                                    onPress={async () => {
                                        if (forgotStep === 'code') {
                                            setForgotStep('email');
                                            await persistForgotFlow({ step: 'email' });
                                        } else {
                                            setForgotStep('code');
                                            await persistForgotFlow({ step: 'code' });
                                        }
                                        setForgotMessage('');
                                    }}
                                    disabled={forgotLoading}
                                >
                                    <Text style={{ color: ui.text }}>{t('common.back')}</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[modalStyles.primaryButton, { backgroundColor: ui.primary }]}
                                onPress={() => {
                                    if (forgotStep === 'email') handleSendResetCode();
                                    if (forgotStep === 'code') handleVerifyResetCode();
                                    if (forgotStep === 'reset') handleResetPassword();
                                }}
                                disabled={forgotLoading}
                            >
                                {forgotLoading ? (
                                    <ActivityIndicator color={colors.onPrimary} />
                                ) : (
                                    <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>
                                        {forgotStep === 'email' && t('auth.resendCode')}
                                        {forgotStep === 'code' && t('auth.confirm')}
                                        {forgotStep === 'reset' && t('password.saveChanges')}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                showCancelRecoveryAlert();
                            }}
                            disabled={forgotLoading}
                            style={[modalStyles.cancelAction, { backgroundColor: ui.cancelBg, borderColor: ui.cancelBorder }]}
                        >
                            <Text style={[modalStyles.cancelLink, { color: ui.cancelText }]}>Cancelar recuperación</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        borderWidth: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 14,
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        fontSize: 15,
        borderWidth: 1,
    },
    passwordWrapper: {
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 15,
    },
    secondaryLink: {
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'right',
    },
    message: {
        fontSize: 13,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 6,
    },
    primaryButton: {
        minWidth: 150,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        minWidth: 90,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    cancelLink: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 13,
    },
    cancelAction: {
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: -4,
        marginBottom: 10,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    requirementsCard: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 4,
        borderWidth: 1,
    },
    requirementItem: {
        fontSize: 12,
        marginBottom: 6,
        fontWeight: '500',
    },
});
