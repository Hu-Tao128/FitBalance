import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DashboardScreen() {
    const planDelDia = [
        { comida: 'Desayuno', alimentos: ['1 taza avena', '1 plátano', '2 huevos'] },
        { comida: 'Comida', alimentos: ['100g pollo', '1 taza arroz', 'Ensalada'] },
        { comida: 'Cena', alimentos: ['Yogurt griego', '10 almendras'] },
    ];

    const alertas = [
        'Recuerda hidratarte 🥤',
        'No olvides registrar tu desayuno 🍳',
        'Tu nutriólogo ha actualizado tu plan 🍽️',
    ];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.titulo}>Hoy</Text>

            {/* PLAN ALIMENTICIO */}
            <Text style={styles.seccionTitulo}>📝 Plan Alimenticio Diario</Text>
            {planDelDia.map((bloque, idx) => (
                <View key={idx} style={styles.card}>
                    <Text style={styles.cardTitulo}>{bloque.comida}</Text>
                    {bloque.alimentos.map((alimento, i) => (
                        <Text key={i} style={styles.cardItem}>• {alimento}</Text>
                    ))}
                </View>
            ))}

            {/* ALERTAS */}
            <Text style={styles.seccionTitulo}>🔔 Recomendaciones y Alertas</Text>
            {alertas.map((mensaje, i) => (
                <View key={i} style={styles.alerta}>
                    <Text>{mensaje}</Text>
                </View>
            ))}

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Ir a Registrar Consumo</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flex: 1 },
    titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    seccionTitulo: { fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 10 },
    card: {
        backgroundColor: '#f3f3f3',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    cardTitulo: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
    cardItem: { fontSize: 14, marginLeft: 6 },
    alerta: {
        backgroundColor: '#fef3c7',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    button: {
        backgroundColor: '#188827',
        padding: 14,
        marginTop: 30,
        borderRadius: 30,
        alignItems: 'center',
    },
    buttonText: { color: 'white', fontWeight: '600' },
});
