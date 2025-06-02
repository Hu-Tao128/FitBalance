import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from 'react';
import {
    Modal,
    TouchableWithoutFeedback,
    Text,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import HomeScreen from '../screens/DashboardScreen';
import { useState } from 'react';
import SettingsStackNavigator from "../navigation/SettingsStackNavigator";
import UserProfileScreen from '../screens/userProfileScreen';
import WeighFoodScreen from '../screens/weighFood';

const Tab = createBottomTabNavigator();

export const BottomNavigation = () => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <Tab.Navigator
                tabBar={({ navigation, state }) => (
                    <View style={styles.bottomNav}>
                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                            <Ionicons
                                name="home-sharp"
                                size={24}
                                color={state.index === 0 ? '#34C759' : '#fff'}
                            />
                        </TouchableOpacity>

                        {/* 🔄 Cambiado: Navegar a weighFood */}
                        <TouchableOpacity onPress={() => navigation.navigate('weighFood')}>
                            <MaterialCommunityIcons
                                name="scale-bathroom"
                                size={24}
                                color={state.index === 1 ? '#34C759' : '#fff'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.fab}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="add" size={28} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Ionicons name="bar-chart-outline" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                            <Ionicons
                                name="settings-outline"
                                size={24}
                                color={state.index === 2 ? '#34C759' : '#fff'}
                            />
                        </TouchableOpacity>
                    </View>
                )}
                screenOptions={{
                    headerShown: false,
                }}
            >

                <Tab.Screen name="Home" component={HomeScreen} />

                {/* 🔄 Cambiado: de RecipeSearch a weighFood */}
                <Tab.Screen name="weighFood" component={WeighFoodScreen} />

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
    fab: {
        backgroundColor: '#34C759',
        borderRadius: 30,
        padding: 14,
        marginTop: -30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        elevation: 4,
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