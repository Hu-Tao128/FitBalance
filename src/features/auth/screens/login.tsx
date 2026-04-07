import { Entypo, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from "../../../context/UserContext";
import { authService } from '../services/auth.service';

type loginScreenProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
    const navigation = useNavigation<loginScreenProp>();
    const { colors } = useTheme();
    const { login: contextLogin } = useUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Por favor ingresa email y contraseña.');
            return;
        }

        setLoading(true);
        try {
            const data = await authService.login(email.trim(), password);
            contextLogin(data.user, data.token);
            // Navigation happens automatically via UserContext if implemented correctly
        } catch (error: any) {
            console.error('Login error:', error);
            const msg = error.response?.data?.message || 'Credenciales inválidas o error de conexión.';
            Alert.alert('Error de Inicio de Sesión', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Image
                        source={require('../../../../assets/NewLogo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.title, { color: colors.text }]}>FitBalance</Text>
                    <Text style={[styles.subtitle, { color: colors.outline }]}>Tu bienestar, bajo control</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="mail-outline" size={20} color={colors.outline} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="ejemplo@correo.com"
                                placeholderTextColor={colors.outline}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.outline} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="••••••••"
                                placeholderTextColor={colors.outline}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={secureTextEntry}
                            />
                            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                                <Ionicons name={secureTextEntry ? "eye-outline" : "eye-off-outline"} size={20} color={colors.outline} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.loginButton, { backgroundColor: colors.primary }]} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginButtonText}>Entrar</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.text }]}>¿No tienes cuenta? </Text>
                    <TouchableOpacity>
                        <Text style={[styles.footerLink, { color: colors.primary }]}>Regístrate</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 30, paddingVertical: 50, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 50 },
    logo: { width: 120, height: 120, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: '800', marginBottom: 8 },
    subtitle: { fontSize: 16, fontWeight: '500' },
    form: { marginBottom: 30 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, height: '100%' },
    eyeIcon: { padding: 4 },
    forgotPassword: { alignSelf: 'flex-end', marginBottom: 30 },
    forgotPasswordText: { fontSize: 14, fontWeight: '600' },
    loginButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { fontSize: 15, opacity: 0.7 },
    footerLink: { fontSize: 15, fontWeight: '700' }
});

export default Login;
