import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';

interface OptionCard {
    icon: string;
    iconType: 'ionicons' | 'material';
    label: string;
    sub: string;
    screen: string;
}

export default function FoodSearchOptions({ navigation }: any) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const options: OptionCard[] = [
        {
            icon: 'barcode-scan',
            iconType: 'material',
            label: t('food.scanCode'),
            sub: t('food.scanCodeSub'),
            screen: 'FoodScanner',
        },
        {
            icon: 'search',
            iconType: 'ionicons',
            label: t('food.searchByName'),
            sub: t('food.searchByNameSub'),
            screen: 'FoodClassicSearch',
        },
        {
            icon: 'restaurant-outline',
            iconType: 'ionicons',
            label: t('food.createMeal'),
            sub: t('food.createMealSub'),
            screen: 'optionsFood',
        },
    ];

    const renderIcon = (option: OptionCard, iconColor: string, iconBg: string) => {
        const iconSize = 28;
        if (option.iconType === 'material') {
            return (
                <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                    <MaterialCommunityIcons name={option.icon as any} size={iconSize} color={iconColor} />
                </View>
            );
        }
        return (
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Ionicons name={option.icon as any} size={iconSize} color={iconColor} />
            </View>
        );
    };

    const getCardColors = (index: number) => {
        const colorPairs = [
            { bg: colors.primaryContainer || '#e8f5e9', text: colors.onPrimaryContainer || '#1b5e20' },
            { bg: colors.secondaryContainer || '#e3f2fd', text: colors.onSecondaryContainer || '#1565c0' },
            { bg: colors.tertiaryContainer || '#e8f5e9', text: colors.onTertiaryContainer || '#2e7d32' },
        ];
        return colorPairs[index % colorPairs.length];
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{t('food.searchOptionsTitle')}</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {t('food.searchOptionsSub')}
                    </Text>
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {options.map((option, index) => {
                        const { bg, text } = getCardColors(index);
                        return (
                            <TouchableOpacity
                                key={option.label}
                                style={[styles.optionCard, { backgroundColor: colors.card }]}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate(option.screen)}
                            >
                                <View style={styles.optionContent}>
                                    {renderIcon(option, colors.primary, bg)}
                                    <View style={styles.textContent}>
                                        <Text style={[styles.optionLabel, { color: colors.onSurface }]}>
                                            {option.label}
                                        </Text>
                                        <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                                            {option.sub}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.outlineVariant} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.quickActionCard, { backgroundColor: colors.primaryContainer }]}
                        onPress={() => navigation.navigate('ManageMeals')}
                    >
                        <Ionicons name="list" size={24} color={colors.onPrimaryContainer} />
                        <Text style={[styles.quickActionText, { color: colors.onPrimaryContainer }]}>
                            {t('food.viewSavedMeals')}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    header: { marginBottom: 28, marginTop: 8 },
    headerTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 15, lineHeight: 22 },
    optionsContainer: { gap: 14 },
    optionCard: {
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
    optionContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    textContent: { flex: 1 },
    optionLabel: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
    optionSub: { fontSize: 13, lineHeight: 18 },
    quickActions: { marginTop: 28 },
    quickActionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 18,
        gap: 14,
    },
    quickActionText: { fontSize: 15, fontWeight: '600', flex: 1 },
});
