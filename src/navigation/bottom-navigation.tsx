import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from 'react';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext'; // Importamos el hook
import SettingsStackNavigator from "../navigation/SettingsStackNavigator";
import HomeScreen from '../screens/DashboardScreen';
import NutritionixTest from "../screens/NutrionixTest";
import UserProfileScreen from '../screens/userProfileScreen';
import weighFood from '../screens/weighFood';

const Tab = createBottomTabNavigator();

export const BottomNavigation = () => {
    const insets = useSafeAreaInsets();
    const { darkMode, colors } = useTheme();  // Usamos el hook para obtener los colores del tema
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <Tab.Navigator
                tabBar={({ navigation, state }) => {
                    const currentRoute = state.routeNames[state.index];
                    return (
                        <SafeAreaView
                            style={[styles.bottomNavWrapper, { paddingBottom: insets.bottom, backgroundColor: colors.card }]}>
                            <View style={[styles.bottomNav, { backgroundColor: colors.card }]}>
                                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                                    <Ionicons
                                        name="home-sharp"
                                        size={24}
                                        color={currentRoute === 'Home' ? '#34C759' : colors.text} // Cambié aquí
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.navigate('WeighFood')}>
                                    <MaterialCommunityIcons
                                        name="scale-bathroom"
                                        size={24}
                                        color={currentRoute === 'WeighFood' ? '#34C759' : colors.text} // Cambié aquí
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.navigate('Test')}>
                                    <MaterialCommunityIcons
                                        name="silverware-fork-knife"
                                        size={24}
                                        color={currentRoute === 'Test' ? '#34C759' : colors.text} // Cambié aquí
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <Ionicons
                                        name="bar-chart-outline"
                                        size={24}
                                        color={colors.text} // Cambié aquí
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                                    <Ionicons
                                        name="settings-outline"
                                        size={24}
                                        color={currentRoute === 'Settings' ? '#34C759' : colors.text} // Cambié aquí
                                    />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    );
                }}
                screenOptions={{ headerShown: false }}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Test" component={NutritionixTest} />
                <Tab.Screen name="WeighFood" component={weighFood} />
                <Tab.Screen name="Settings" component={SettingsStackNavigator} />
                <Tab.Screen
                    name="UserProfile"
                    component={UserProfileScreen}
                    options={({ route }) => ({
                        headerShown: true,
                        headerTitle: 'Perfil',
                        headerTintColor: colors.primary,
                        headerStyle: {
                            backgroundColor: colors.background,
                            borderBottomColor: colors.border,
                            borderBottomWidth: 1,
                            elevation: 0, // Para Android
                            shadowOpacity: 0, // Para iOS
                        },
                        headerTitleStyle: {
                            color: colors.text,
                            fontSize: 18,
                            fontWeight: 'bold'
                        },
                        tabBarIcon: ({ focused }) => (
                            <Ionicons
                                name="person-outline"
                                size={24}
                                color={focused ? colors.primary : colors.text}
                            />
                        ),
                        tabBarLabel: ({ focused }) => (
                            <Text style={{
                                color: focused ? colors.primary : colors.text,
                                fontSize: 12,
                                marginBottom: 4
                            }}>
                                Perfil
                            </Text>
                        ),
                    })}
                />
            </Tab.Navigator>

            {/* Modal */}
            <Modal
                transparent
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Registrar</Text>
                                <TouchableOpacity style={styles.modalOption}>
                                    <View style={styles.optionRow}>
                                        <MaterialCommunityIcons name="food-apple" size={24} color="#34C759" />
                                        <Text style={styles.modalOptionText}>Registrar alimento</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalOption}>
                                    <View style={styles.optionRow}>
                                        <Ionicons name="water-outline" size={24} color="#34C759" />
                                        <Text style={styles.modalOptionText}>Registrar agua</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalOption}>
                                    <View style={styles.optionRow}>
                                        <MaterialCommunityIcons name="scale-bathroom" size={24} color="#34C759" />
                                        <Text style={styles.modalOptionText}>Nuevo peso</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text style={{ color: '#34C759', textAlign: 'right' }}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    bottomNavWrapper: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomNav: {
        width: '90%',
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        backgroundColor: '#0d0d0d',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#34C759',
    },
    modalOption: {
        paddingVertical: 12,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalOptionText: {
        color: 'rgb(255,255,255)',
    },
});