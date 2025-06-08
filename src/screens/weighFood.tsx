import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useTheme } from '../context/ThemeContext';


const mealsData = {
    Desayuno: [
        { name: 'Avena', gramos: 50 },
        { name: 'Leche', gramos: 200 }
    ],
    Almuerzo: [
        { name: 'Pollo a la plancha', gramos: 150 },
        { name: 'Arroz', gramos: 100 }
    ],
    Cena: [
        { name: 'Ensalada', gramos: 120 },
        { name: 'Atún', gramos: 100 }
    ]
};

export default function WeighFoodScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [registradas, setRegistradas] = useState<{ [meal: string]: { [item: string]: boolean } }>({});
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scroll: {
            paddingHorizontal: 16,
            paddingTop: 20,
        },
        mealSection: {
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
        },
        mealTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 10,
            color: colors.text,
        },
        mealTitleChecked: {
            textDecorationLine: 'underline',
            color: colors.primary,
        },
        foodItemTouchable: {
            paddingVertical: 8,
        },
        foodItemText: {
            fontSize: 16,
            color: colors.text,
            flexDirection: 'row',
            alignItems: 'center',
        },
        modalOverlay: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContainer: {
            backgroundColor: colors.card,
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 20,
        },
        optionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            gap: 10,
        },
        optionText: {
            color: colors.text,
            fontSize: 16,
        },
        closeText: {
            color: colors.primary,
            marginTop: 20,
            textAlign: 'right',
        },
    });

    const handleRegister = () => {
        if (selectedMeal && selectedItem) {
            setRegistradas(prev => ({
                ...prev,
                [selectedMeal]: {
                    ...(prev[selectedMeal] || {}),
                    [selectedItem]: true
                }
            }));
            setModalVisible(false);
        }
    };

    const isMealComplete = (meal: string, items: { name: string }[]) => {
        const mealReg = registradas[meal] || {};
        return items.every(item => mealReg[item.name]);
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll}>
                {Object.entries(mealsData).map(([mealName, items]) => {
                    const color =
                        mealName === 'Desayuno' ? '#FFEB99' :
                            mealName === 'Almuerzo' ? '#C3FBD8' :
                                '#D6C7FB';

                    const mealDone = isMealComplete(mealName, items);

                    return (
                        <View key={mealName} style={[styles.mealSection, { backgroundColor: color }]}>
                            <Text style={[styles.mealTitle, mealDone && styles.mealTitleChecked]}>
                                {mealName} {mealDone && <Ionicons name="checkmark-circle" size={18} color="#34C759" />}
                            </Text>

                            {items.map((item, idx) => {
                                const isItemRegistered = registradas[mealName]?.[item.name];

                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => {
                                            setSelectedMeal(mealName);
                                            setSelectedItem(item.name);
                                            setModalVisible(true);
                                        }}
                                        style={styles.foodItemTouchable}
                                    >
                                        <Text style={styles.foodItemText}>
                                            {item.name} - {item.gramos}g
                                            {isItemRegistered && (
                                                <Ionicons name="checkmark-circle" size={16} color="#34C759" style={{ marginLeft: 6 }} />
                                            )}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>

            <Modal
                transparent
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            ¿Cómo quieres registrar {selectedItem} de {selectedMeal}?
                        </Text>

                        <TouchableOpacity style={styles.optionButton} onPress={handleRegister}>
                            <MaterialCommunityIcons name="check-bold" size={22} color="#34C759" />
                            <Text style={styles.optionText}>Usar porción recomendada</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={handleRegister}>
                            <Ionicons name="create-outline" size={22} color="#34C759" />
                            <Text style={styles.optionText}>Ingresar manualmente</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton}>
                            <MaterialCommunityIcons name="scale" size={22} color="#aaa" />
                            <Text style={[styles.optionText, { color: '#aaa' }]}>Usar báscula (próximamente)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}