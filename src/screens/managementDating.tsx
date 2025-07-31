import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AppointmentCard, { Appointment } from '../components/AppointmentCard';
import { API_CONFIG } from '../config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const ManagementDatingScreen = () => {
    const { colors } = useTheme();
    const { user } = useUser(); // Se vuelve a activar para usar el usuario del contexto

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [upcoming, setUpcoming] = useState<Appointment[]>([]);
    const [past, setPast] = useState<Appointment[]>([]);

    useEffect(() => {
        // 1. Se vuelve a añadir la validación. Si no hay usuario o id, no hace nada.
        // Esto es crucial para evitar errores cuando la app se inicia.
        if (!user?.id) {
            setLoading(false); // Detenemos la carga si no hay usuario
            return;
        }

        const fetchAppointments = async () => {
            setLoading(true);
            setError(null);

            // 2. Se construye la URL usando el `user.id` del contexto.
            const url = `${API_CONFIG.BASE_URL}/appointments/${user.id}`;
            console.log("Requesting user appointments:", user.id);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    const errorData = await response.text(); // Intenta leer el cuerpo del error
                    throw new Error(`Error ${response.status}: ${errorData || 'Appointments could not be uploaded.'}`);
                }
                const data: Appointment[] = await response.json();
                setAppointments(data);
            } catch (err) {
                console.error("ERROR EN FETCH:", err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
        // 3. El efecto depende del objeto 'user'. Se ejecutará de nuevo si el usuario cambia (ej. al iniciar sesión).
    }, [user]);

    // Este segundo useEffect para filtrar las citas se mantiene igual
    useEffect(() => {
        const now = new Date();
        const upcomingAppointments = appointments.filter(appt => new Date(appt.appointment_date) >= now);
        const pastAppointments = appointments.filter(appt => new Date(appt.appointment_date) < now);

        setUpcoming(upcomingAppointments.sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()));
        setPast(pastAppointments.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()));
    }, [appointments]);

    // Lógica de renderizado para los estados de carga y error
    if (loading) {
        return (
            <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>Loading your appointments...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.infoText, { color: colors.danger }]}>{error}</Text>
            </View>
        );
    }

    // Lógica para renderizar las secciones de la lista
    const renderSection = ({ title, data, emptyText }: { title: string, data: Appointment[], emptyText: string }) => (
        <View style={{ width: '100%' }}>
            <Text style={[styles.header, { color: colors.text }]}>{title}</Text>
            {data.length > 0 ? (
                data.map(item => <AppointmentCard key={item._id} appointment={item} />)
            ) : (
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>{emptyText}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={[{ key: 'upcoming' }, { key: 'past' }]}
                renderItem={({ item }) => {
                    if (item.key === 'upcoming') return renderSection({ title: 'Pending Appointments', data: upcoming, emptyText: 'You have no scheduled appointments.' });
                    if (item.key === 'past') return renderSection({ title: 'History', data: past, emptyText: 'You have no appointments on your record.' });
                    return null;
                }}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    header: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
    infoText: { marginTop: 10, fontSize: 16, textAlign: 'center' },
});

export default ManagementDatingScreen;