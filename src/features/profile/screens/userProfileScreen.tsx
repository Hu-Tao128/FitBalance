import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { UserProfile } from '../services/profile.service';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserProfile'>;

export default function UserProfileScreen() {
    const { user, logout } = useUser();
    const { colors } = useTheme();
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const profile: UserProfile | null = user
        ? {
            id: user.id,
            name: user.name || user.username || 'Usuario',
            email: user.email || '',
            photo: undefined,
            height: user.height_cm,
            weight: user.weight_kg,
        }
        : null;

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que deseas salir?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir", style: "destructive", onPress: logout }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
                        {profile?.photo ? (
                            <Image source={{ uri: profile.photo }} style={styles.avatar} />
                        ) : (
                            <Ionicons name="person" size={80} color={colors.outline} />
                        )}
                        <TouchableOpacity 
                            style={[styles.editBadge, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Ionicons name="camera" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.userName, { color: colors.text }]}>{profile?.name || 'Usuario'}</Text>
                    <Text style={[styles.userEmail, { color: colors.outline }]}>{profile?.email}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>{profile?.weight || '--'} kg</Text>
                        <Text style={[styles.statLabel, { color: colors.outline }]}>Peso</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>{profile?.height || '--'} cm</Text>
                        <Text style={[styles.statLabel, { color: colors.outline }]}>Altura</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity 
                        style={[styles.menuItem, { backgroundColor: colors.card }]}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
                            <Ionicons name="person-outline" size={22} color={colors.primary} />
                        </View>
                        <Text style={[styles.menuText, { color: colors.text }]}>Editar Perfil</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.outline} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { backgroundColor: colors.card }]}
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                            <Ionicons name="lock-closed-outline" size={22} color="#FF9500" />
                        </View>
                        <Text style={[styles.menuText, { color: colors.text }]}>Seguridad</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.outline} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { backgroundColor: colors.card }]}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
                            <Ionicons name="settings-outline" size={22} color="#007AFF" />
                        </View>
                        <Text style={[styles.menuText, { color: colors.text }]}>Preferencias</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.outline} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { backgroundColor: colors.card, marginTop: 20 }]}
                        onPress={handleLogout}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
                        </View>
                        <Text style={[styles.menuText, { color: "#FF3B30" }]}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingVertical: 40, paddingHorizontal: 20 },
    header: { alignItems: 'center', marginBottom: 40 },
    avatarContainer: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, justifyContent: 'center', alignItems: 'center', position: 'relative', backgroundColor: '#f0f0f0' },
    avatar: { width: 132, height: 132, borderRadius: 66 },
    editBadge: { position: 'absolute', bottom: 5, right: 5, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    userName: { fontSize: 24, fontWeight: '800', marginTop: 16 },
    userEmail: { fontSize: 16, fontWeight: '500', marginTop: 4 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    statCard: { width: '47%', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 2 },
    statValue: { fontSize: 20, fontWeight: '800' },
    statLabel: { fontSize: 14, fontWeight: '600', marginTop: 4 },
    menuContainer: { gap: 12 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, elevation: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuText: { flex: 1, fontSize: 16, fontWeight: '600' }
});
