import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from 'react';
import { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import SettingsStackNavigator from "../navigation/SettingsStackNavigator";
import HomeScreen from '../screens/DashboardScreen';
import NutritionixTest from "../screens/NutrionixTest";
import UserProfileScreen from '../screens/userProfileScreen';
import weighFood from '../screens/weighFood';


const Tab = createBottomTabNavigator();

export const BottomNavigation = () => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <Tab.Navigator
                tabBar={({ navigation, state }) => {
                    const currentRoute = state.routeNames[state.index];
                    return (
                        <View style={styles.bottomNav}>
                            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                                <Ionicons
                                    name="home-sharp"
                                    size={24}
                                    color={currentRoute === 'Home' ? '#34C759' : '#fff'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('WeighFood')}>
                                <MaterialCommunityIcons
                                    name="scale-bathroom"
                                    size={24}
                                    color={currentRoute === 'WeighFood' ? '#34C759' : '#fff'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('Test')}>
                                <MaterialCommunityIcons
                                    name="silverware-fork-knife"
                                    size={24}
                                    color={currentRoute === 'Test' ? '#34C759' : '#fff'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <Ionicons
                                    name="bar-chart-outline"
                                    size={24}
                                    color={'#fff'} // sin navegación aún
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                                <Ionicons
                                    name="settings-outline"
                                    size={24}
                                    color={currentRoute === 'Settings' ? '#34C759' : '#fff'}
                                />
                            </TouchableOpacity>
                        </View>
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
                    options={{
                        headerShown: true,
                        headerTitle: 'Perfil',
                        headerTintColor: '#34C759',
                        headerStyle: { backgroundColor: '#0d0d0d' },
                        headerTitleStyle: { color: '#fff' },
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="person-outline" size={24} color={color} />
                        ),
                        tabBarLabel: 'Perfil',
                    }}
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
}

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 10,
        left: 20,
        right: 20,
        height: 60,
        backgroundColor: '#1c1c1e',
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
        color: 'rgb(255,255,255)'
    },
});
