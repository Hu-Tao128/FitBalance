import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const MEAL_TYPES = [
    { key: 'breakfast', label: 'Desayuno', time: '09:00' },
    { key: 'lunch', label: 'Almuerzo', time: '14:00' },
    { key: 'dinner', label: 'Cena', time: '20:00' },
    { key: 'snack', label: 'Snack', time: '17:00' }
];

export const AddFoodModal = ({ visible, onClose, onSelectMeal }: any) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
        modalContent: { width: '85%', borderRadius: 15, padding: 20, alignItems: 'center', backgroundColor: colors.card },
        title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: colors.text },
        button: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, width: '100%', marginBottom: 12 },
        buttonText: { textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 16 },
        cancelButton: { marginTop: 10 },
        cancelText: { color: colors.primary, fontSize: 16 }
    });

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Añadir a:</Text>
                    {MEAL_TYPES.map(meal => (
                        <TouchableOpacity
                            key={meal.key}
                            style={styles.button}
                            onPress={() => onSelectMeal(meal.key, meal.time)}
                        >
                            <Text style={styles.buttonText}>{meal.label}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};