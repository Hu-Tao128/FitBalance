// src/screens/optionsFood.tsx
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';

type OptionsFoodScreenNavigationProp = StackNavigationProp<RootStackParamList, 'optionsFood'>;

type ButtonConfig = {
    name: string;
    lib: typeof FontAwesome5 | typeof MaterialCommunityIcons;
    label: string;
    sub: string;
    color: string;
    bg: string;
    screen: keyof RootStackParamList;
    size: number;
};

const buttonsConfig: ButtonConfig[] = [
    {
        name: 'plus-circle', // Icono para "Nueva comida"
        lib: FontAwesome5, // O puedes usar MaterialIcons si prefieres
        label: 'New food',
        sub: 'Create a new dish from scratch',
        color: '#34C759', // Verde vibrante
        bg: '#EAF7EB', // Fondo suave para el botón
        screen: 'CreateMealScreen',
        size: 33,
    },
    {
        name: 'food-fork-drink', // Icono para "Gestionar comidas"
        lib: MaterialCommunityIcons, // O puedes usar FontAwesome5 si prefieres
        label: 'Manage meals',
        sub: 'Edit or delete your saved dishes',
        color: '#FF9500', // Naranja
        bg: '#FFF3E0', // Fondo suave para el botón
        screen: 'ManageMeals',
        size: 38,
    },
];

export default function OptionsFood() {
    const { colors } = useTheme();
    const navigation = useNavigation<OptionsFoodScreenNavigationProp>(); // Hook de navegación

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>What do you want to do with your meals?</Text>
            <View style={styles.cards}>
                {buttonsConfig.map((btn) => {
                    const IconLib = btn.lib;
                    return (
                        <TouchableOpacity
                            key={btn.label}
                            style={[styles.cardShadow, { backgroundColor: btn.bg }]}
                            activeOpacity={0.88}
                            onPress={() => navigation.navigate(btn.screen as any)}
                        >
                            <View style={styles.row}>
                                <View style={[styles.iconCircle, { backgroundColor: btn.bg }]}>
                                    <IconLib name={btn.name} size={btn.size} color={btn.color} />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.cardLabel, { color: btn.color }]}>{btn.label}</Text>
                                    <Text style={[styles.cardSub, { color: colors.textSecondary }]}>{btn.sub}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 40,
        paddingBottom: 30,
    },
    title: {
        fontSize: 23,
        fontWeight: 'bold',
        marginBottom: 35,
        letterSpacing: 0.2,
        textAlign: 'center',
        opacity: 0.96,
    },
    cards: {
        width: '100%',
        gap: 22,
    },
    cardShadow: {
        width: '100%',
        borderRadius: 22,
        marginBottom: 6,
        paddingVertical: 22,
        paddingHorizontal: 16,
        shadowColor: '#B6D0B533',
        shadowOpacity: 0.20,
        shadowOffset: { width: 0, height: 7 },
        shadowRadius: 16,
        elevation: 7,
        ...Platform.select({
            android: {
                borderWidth: 1,
                borderColor: '#F3F6ED',
            },
        }),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        backgroundColor: '#fff',
        shadowColor: '#8ec47e44',
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    cardLabel: {
        fontSize: 17.5,
        fontWeight: 'bold',
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    cardSub: {
        fontSize: 14,
        opacity: 0.80,
        flexWrap: 'wrap',
    },
});