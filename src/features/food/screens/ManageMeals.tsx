import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { mealService, PatientMeal } from '../services/meal.service';

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 20,
    },
    mealCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    mealStats: {
        fontSize: 14,
        color: colors.text,
        opacity: 0.7,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: colors.text,
        opacity: 0.6,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: colors.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default function ManageMealsScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { user } = useUser();
    const { colors } = useTheme();
    const styles = makeStyles(colors);

    const [patientMeals, setPatientMeals] = useState<PatientMeal[]>([]);
    const [loading, setLoading] = useState(false);
    const [consumeModalVisible, setConsumeModalVisible] = useState(false);
    const [mealToConsume, setMealToConsume] = useState<PatientMeal | null>(null);

    const MEAL_TYPES = [
        { key: 'breakfast', time: '09:00' },
        { key: 'lunch', time: '14:00' },
        { key: 'dinner', time: '20:00' },
        { key: 'snack', time: '17:00' },
    ];

    const fetchPatientMeals = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await mealService.getPatientMeals(String(user.id));
            setPatientMeals(data || []);
        } catch (error: any) {
            console.error('Error fetchPatientMeals:', error);
            Alert.alert(t('food.error'), t('food.manageMealsLoadError'));
        } finally {
            setLoading(false);
        }
    }, [user?.id, t]);

    useFocusEffect(
        useCallback(() => {
            fetchPatientMeals();
        }, [fetchPatientMeals])
    );

    const handleEditMeal = (meal: PatientMeal) => {
        navigation.navigate('EditMeal', { mealToEdit: meal });
    };

    const handleConsumePress = (meal: PatientMeal) => {
        setMealToConsume(meal);
        setConsumeModalVisible(true);
    };

    const handleConsumeMeal = async (type: string, time: string) => {
        if (!mealToConsume?._id || !user?.id) return;
        setConsumeModalVisible(false);
        try {
            await mealService.addCustomMealLog({
                patient_id: String(user.id),
                meal_id: mealToConsume._id,
                type,
                time,
            });
            Alert.alert(t('food.addMealSuccess'), t('food.addMealSuccessMsg'));
        } catch (error) {
            console.error('Error addCustomMealLog:', error);
            Alert.alert(t('food.error'), t('food.addMealError'));
        } finally {
            setMealToConsume(null);
        }
    };

    const renderMealItem = ({ item }: { item: PatientMeal }) => (
        <View style={styles.mealCard}>
            <View style={styles.mealInfo}>
                <Text style={styles.mealName}>
                    {(item as any).name || (item as any).meal_name || t('food.unnamedMeal')}
                </Text>
                <Text style={styles.mealStats}>
                    {((item as any).nutrients?.energy_kcal ?? (item as any).nutrients?.calories ?? 0).toFixed(0)} kcal
                    {' • '}
                    P: {((item as any).nutrients?.protein_g ?? (item as any).nutrients?.protein ?? 0).toFixed(1)}g
                </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => handleConsumePress(item)} style={{ padding: 6 }}>
                    <Ionicons name="restaurant-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEditMeal(item)} style={{ padding: 6 }}>
                    <Ionicons name="create-outline" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('food.myMeals')}</Text>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : patientMeals.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('food.manageMealsEmpty')}</Text>
                </View>
            ) : (
                <FlatList
                    data={patientMeals}
                    keyExtractor={(item) => item._id || String(Math.random())}
                    renderItem={renderMealItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateMealScreen')}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            <Modal
                visible={consumeModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setConsumeModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 18 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
                            {t('food.consumeMeal')}
                        </Text>
                        {MEAL_TYPES.map((mealType) => (
                            <TouchableOpacity
                                key={mealType.key}
                                style={{ backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, marginBottom: 10 }}
                                onPress={() => handleConsumeMeal(mealType.key, mealType.time)}
                            >
                                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
                                    {t(`food.meals.${mealType.key}` as any)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setConsumeModalVisible(false)} style={{ paddingVertical: 10 }}>
                            <Text style={{ color: colors.primary, textAlign: 'center', fontWeight: '700' }}>
                                {t('common.cancel')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
