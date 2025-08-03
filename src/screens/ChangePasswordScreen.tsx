import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { API_CONFIG } from '../config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const ChangePasswordScreen = () => {
    const { colors } = useTheme();
    const { user } = useUser();
    console.log("USUARIO EN PANTALLA ChangePassword:", JSON.stringify(user, null, 2));

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSaveChanges = async () => {
        // Validación en el frontend
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
            const response = await axios.put(`${API_CONFIG.BASE_URL}/patients/change-password`, {
                patient_id: user?.id, // Usa el ID del usuario del contexto
                currentPassword,
                newPassword,
            });

            Alert.alert('Éxito', response.data.message);
            // Limpiar campos después del éxito
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err: any) {
            // Muestra el error específico que envía el backend
            setError(err.response?.data?.message || 'Ocurrió un error al actualizar.');
            console.error(err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const styles = createDynamicStyles(colors);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Contraseña Actual</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Ingresa tu contraseña actual"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Nueva Contraseña</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Ingresa tu nueva contraseña"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirma tu nueva contraseña"
                    placeholderTextColor={colors.textSecondary}
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleSaveChanges} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Guardar Cambios</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const createDynamicStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    form: { padding: 20 },
    label: { fontSize: 16, color: colors.text, marginBottom: 8, fontWeight: '500' },
    input: { backgroundColor: colors.card, color: colors.text, padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
    button: { backgroundColor: colors.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    errorText: { color: colors.danger, textAlign: 'center', marginBottom: 15, fontSize: 14 },
});

export default ChangePasswordScreen;