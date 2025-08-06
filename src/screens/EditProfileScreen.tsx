import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

// Reusable input component for the form
const ProfileInput = ({ icon, label, value, onChangeText, keyboardType = 'default', ...props }) => {
    const { colors } = useTheme();
    const styles = StyleSheet.create({
        inputContainer: { marginBottom: 18 },
        label: { color: colors.text, fontSize: 16, marginBottom: 8, opacity: 0.8 },
        inputBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 15,
            height: 55,
        },
        input: { flex: 1, color: colors.text, fontSize: 16, marginLeft: 10 },
    });

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputBox}>
                <MaterialIcons name={icon} size={22} color={colors.primary} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    placeholderTextColor={colors.border}
                    {...props}
                />
            </View>
        </View>
    );
};

export default function EditProfileScreen({ navigation }: any) {
    const { colors } = useTheme();
    const { user, updateUser } = useUser();

    // State to manage all editable fields
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

        // Convert string values from the form back to numbers where needed
        const updatedData = {
            ...formData,
            age: Number(formData.age) || undefined,
            height_cm: Number(formData.height_cm) || undefined,
            weight_kg: Number(formData.weight_kg) || undefined,
        };

        try {
            // Call the context function with the updated data
            await updateUser(updatedData);
            Alert.alert('Success', 'Your profile has been updated.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert('Error', 'Could not update your profile.');
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.card },
        scrollContent: { padding: 24 },
        title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
        saveButton: {
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 28,
            alignItems: 'center',
            marginTop: 30,
        },
        saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    });

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Edit Profile</Text>

                <ProfileInput icon="mail-outline" label="Email" value={formData.email} onChangeText={(v) => handleInputChange('email', v)} keyboardType="email-address" />
                <ProfileInput icon="phone-iphone" label="Phone Number" value={formData.phone} onChangeText={(v) => handleInputChange('phone', v)} keyboardType="phone-pad" />
                <ProfileInput icon="cake" label="Age" value={formData.age} onChangeText={(v) => handleInputChange('age', v)} keyboardType="numeric" />
                <ProfileInput icon="height" label="Height (cm)" value={formData.height_cm} onChangeText={(v) => handleInputChange('height_cm', v)} keyboardType="numeric" />
                <ProfileInput icon="fitness-center" label="Weight (kg)" value={formData.weight_kg} onChangeText={(v) => handleInputChange('weight_kg', v)} keyboardType="numeric" />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}