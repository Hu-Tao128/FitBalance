import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../features/dashboard/screens/DashboardScreen';
import NutritionixTest from "../features/food/screens/FoodSearchOptions";
import weighFood from '../features/food/screens/weighFood';
import StatisticsScreen from '../features/statistics/screens/Stadistics';
import ProfileStackNavigator from '../navigation/SettingsStackNavigator';

const Tab = createBottomTabNavigator();

export const BottomNavigation = () => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            tabBar={({ navigation, state }) => {
                const currentRoute = state.routeNames[state.index];
                const isProfileFocused = currentRoute === 'Profile';
                
                return (
                    <View style={[styles.bottomNavWrapper, { paddingBottom: insets.bottom, backgroundColor: colors.card }]}>
                        <View style={[styles.bottomNav, { backgroundColor: colors.card }]}>
                            <Ionicons
                                name="home-sharp"
                                size={24}
                                color={currentRoute === 'Home' ? colors.primary : colors.outline}
                                onPress={() => navigation.navigate('Home')}
                            />

                            <MaterialCommunityIcons
                                name="scale-bathroom"
                                size={24}
                                color={currentRoute === 'WeighFood' ? colors.primary : colors.outline}
                                onPress={() => navigation.navigate('WeighFood')}
                            />

                            <MaterialCommunityIcons
                                name="silverware-fork-knife"
                                size={24}
                                color={currentRoute === 'Test' ? colors.primary : colors.outline}
                                onPress={() => navigation.navigate('Test')}
                            />

                            <Ionicons
                                name="bar-chart-outline"
                                size={24}
                                color={currentRoute === 'Stadistics' ? colors.primary : colors.outline}
                                onPress={() => navigation.navigate('Stadistics')}
                            />

                            <Ionicons
                                name="person-outline"
                                size={24}
                                color={isProfileFocused ? colors.primary : colors.outline}
                                onPress={() => navigation.navigate('Profile')}
                            />
                        </View>
                    </View>
                );
            }}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('common.dashboard') }} />
            <Tab.Screen name="Test" component={NutritionixTest} />
            <Tab.Screen name="WeighFood" component={weighFood} />
            <Tab.Screen name="Stadistics" component={StatisticsScreen}/>
            <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ tabBarLabel: t('common.profile') }} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    bottomNavWrapper: {
        width: '100%',
    },
    bottomNav: {
        width: '90%',
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        alignSelf: 'center',
    },
});

export default BottomNavigation;
