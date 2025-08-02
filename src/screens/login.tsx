import { Entypo, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { RootStackParamList } from '../../App';
import { useTheme } from '../context/ThemeContext';
import { useUser } from "../context/UserContext";

import { API_CONFIG } from '../config';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
    const { login } = useUser();
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff'
        },
        scrollContent: {
            flexGrow: 1,
            justifyContent: 'flex-start',
        },
        header: {
            height: '50%',
            width: "100%",
            overflow: 'hidden',
        },
        logoImage: {
            width: '100%',
            height: '100%',
        },
        loginBox: {
            marginTop: -20,
            paddingHorizontal: 30,
            paddingVertical: 20,
        },
        title: {
            fontSize: 22,
            fontWeight: '600',
            marginBottom: 25,
            textAlign: 'center',
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f1f1f1',
            borderRadius: 12,
            paddingHorizontal: 15,
            marginBottom: 15,
        },
        input: {
            flex: 1,
            height: 50,
            marginLeft: 10,
            fontSize: 16,
        },
        optionsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 25,
        },
        rememberMe: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        optionText: {
            fontSize: 14,
            color: '#777',
            marginLeft: 5,
        },
        loginButton: {
            backgroundColor: 'transparent',
            borderColor: 'rgb(6, 80, 16)',
            borderWidth: 1.5,
            borderRadius: 25,
            paddingVertical: 12,
            alignItems: 'center',
            marginBottom: 15,
        },
        loginText: {
            color: '#188827',
            fontWeight: 'bold',
            fontSize: 16,
        },
        signUpText: {
            textAlign: 'center',
            fontSize: 14,
            color: '#555',
            marginBottom: 10,
        },
        linkText: {
            color: '#000000ff',
            fontWeight: '600',
        },
        footerDecor: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 130,
            zIndex: 100,
            backgroundColor: '#fff',
        },
        footerImage: {
            width: '100%',
            height: '130%',
        }
    });

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            setMessage('Please complete your username and password.');
            return;
        }

        try {
            // Opcional: limpia mensaje previo
            setMessage('');

            // Enviar login
            const res = await axios.post(`${API_CONFIG.BASE_URL}/login`, {
                username: username.trim(),
                password: password // Si quieres puedes trim aquí también
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Verifica respuesta (según estructura del backend)
            if (!res.data.patient || !res.data.patient.username) {
                throw new Error('Credenciales inválidas');
            }

            // Login OK: actualiza contexto y navega
            await login({
                id: res.data.patient._id,
                name: res.data.patient.name,
                username: res.data.patient.username,
                email: res.data.patient.email,
                phone: res.data.patient.phone,
                age: res.data.patient.age,
                gender: res.data.patient.gender,
                height_cm: res.data.patient.height_cm,
                weight_kg: res.data.patient.weight_kg,
                objective: res.data.patient.objective,
                allergies: res.data.patient.allergies || [],
                dietary_restrictions: res.data.patient.dietary_restrictions || [],
                last_consultation: res.data.patient.last_consultation,
                nutritionist_id: res.data.patient.nutritionist_id,
                isActive: res.data.patient.isActive
            });

            setMessage(`✅ Welcome, ${res.data.patient.name}`);
            navigation.navigate('Root');
        } catch (error: any) {
            // Mostrar mensaje específico si lo hay en la respuesta
            if (error.response && error.response.data && error.response.data.message) {
                setMessage('❌ ' + error.response.data.message);
            } else if (error.response && error.response.status === 401) {
                setMessage('❌ Incorrect username or password');
            } else {
                setMessage('❌ Network or server error');
            }
            console.error('Login error:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/NewLogo.png')}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.loginBox}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color="#999" />
                        <TextInput
                            placeholder="Username"
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Entypo name="lock" size={20} color="#999" />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#999"
                            secureTextEntry
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>


                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>

                    {message ? (
                        <Text style={{ textAlign: 'center', marginTop: 10 }}>{message}</Text>
                    ) : null}

                    <Text style={styles.signUpText}>
                        Be your best version.
                    </Text>
                </View>
            </ScrollView>

            <View style={[styles.footerDecor, { backgroundColor: colors.background }]}>
                <Image
                    source={require('../../assets/f6.png')}
                    style={styles.footerImage}
                    resizeMode="cover"
                />
            </View>
        </SafeAreaView>
    );
}
