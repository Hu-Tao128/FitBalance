import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';

interface ActionCard {
    icon: string;
    label: string;
    sub: string;
    screen: string;
    color: string;
}

const mainActions: ActionCard[] = [
    {
        icon: 'add-circle-outline',
        label: 'Nueva Comida',
        sub: 'Crea un plato desde cero',
        screen: 'CreateMealScreen',
        color: 'primary',
    },
    {
        icon: 'list-outline',
        label: 'Mis Comidas',
        sub: 'Ver, editar o eliminar comidas guardadas',
        screen: 'ManageMeals',
        color: 'secondary',
    },
];

export default function OptionsFood({ navigation }: any) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const getColorScheme = (colorName: string) => {
        switch (colorName) {
            case 'primary':
                return { bg: colors.primaryContainer, text: colors.onPrimaryContainer, icon: colors.primary };
            case 'secondary':
                return { bg: colors.secondaryContainer, text: colors.onSecondaryContainer, icon: colors.secondary };
            case 'tertiary':
                return { bg: colors.tertiaryContainer, text: colors.onTertiaryContainer, icon: colors.tertiary };
            default:
                return { bg: colors.surfaceContainerHighest, text: colors.onSurfaceVariant, icon: colors.outline };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
                        Gestión de Comidas
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Crea y administra tus propias comidas y recetas
                    </Text>
                </View>

                {/* Main Actions */}
                <View style={styles.actionsContainer}>
                    {mainActions.map((action) => {
                        const scheme = getColorScheme(action.color);
                        return (
                            <TouchableOpacity
                                key={action.screen}
                                style={[styles.actionCard, { backgroundColor: colors.card }]}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate(action.screen)}
                            >
                                <View style={[styles.actionIconBox, { backgroundColor: scheme.bg }]}>
                                    <Ionicons name={action.icon as any} size={32} color={scheme.icon} />
                                </View>
                                <View style={styles.actionTextContent}>
                                    <Text style={[styles.actionLabel, { color: colors.onSurface }]}>
                                        {action.label}
                                    </Text>
                                    <Text style={[styles.actionSub, { color: colors.textSecondary }]}>
                                        {action.sub}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.outlineVariant} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Tips Section */}
                <View style={styles.tipsSection}>
                    <Text style={[styles.tipsTitle, { color: colors.onSurface }]}>
                        Consejos
                    </Text>
                    <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
                        <View style={styles.tipRow}>
                            <View style={[styles.tipIcon, { backgroundColor: colors.primaryContainer }]}>
                                <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={[styles.tipLabel, { color: colors.onSurface }]}>
                                    Incluye todos los ingredientes
                                </Text>
                                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                    Añade cada ingrediente con su cantidad para un cálculo preciso de macros.
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
                        <View style={styles.tipRow}>
                            <View style={[styles.tipIcon, { backgroundColor: colors.secondaryContainer }]}>
                                <Ionicons name="nutrition-outline" size={20} color={colors.secondary} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={[styles.tipLabel, { color: colors.onSurface }]}>
                                    Guarda tus recetas
                                </Text>
                                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                    Crea tus recetas favoritas y úsalas rápidamente en tu registro diario.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    header: { marginBottom: 28 },
    headerTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 15, lineHeight: 22 },
    actionsContainer: { gap: 14, marginBottom: 32 },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIconBox: {
        width: 64,
        height: 64,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionTextContent: { flex: 1 },
    actionLabel: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    actionSub: { fontSize: 13, lineHeight: 18 },
    tipsSection: {},
    tipsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    tipCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    tipRow: { flexDirection: 'row', alignItems: 'flex-start' },
    tipIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    tipContent: { flex: 1 },
    tipLabel: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
    tipText: { fontSize: 13, lineHeight: 18 },
});
