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


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
    const { login } = useUser();
    const navigation = useNavigation<NavigationProp>();
    const { darkMode, toggleTheme, colors } = useTheme();

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
            marginTop: -50,
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
            color: '#188827',
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

    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');

    // 1) Cambia aquí '192.168.1.42' por la IP local de tu computadora
    //    donde estás corriendo tu servidor de Node/Express.
    //    Por ejemplo: '192.168.1.42'  (sin puerto ni slash).

    //Nota: ahora pones tu ip y el puerto
    // 1    192.168.1.42:3000
    const SERVER_IP = 'fitbalance-backend-production.up.railway.app';

    //const SERVER_IP = 'mi-ippruebas';

    const handleLogin = async () => {
        try {
            // Usa http o https consistentemente
            const res = await axios.post(`https://${SERVER_IP}/login`, {
                usuario,
                password,
            });

            // Verifica la respuesta del servidor
            console.log('Respuesta del servidor:', res.data);

            if (!res.data.usuario) {
                throw new Error('Credenciales incorrectas');
            }

            // 1. Primero guarda los datos básicos
            const basicUserData = {
                nombre: res.data.nombre,
                usuario: res.data.usuario
            };
            await login(basicUserData);

            // 2. Luego carga los datos completos
            const userDetails = await axios.get(`http://${SERVER_IP}/user/${res.data.usuario}`);

            // 3. Actualiza el estado con todos los datos
            await login({
                ...basicUserData,
                email: userDetails.data.correo || userDetails.data.email, // Maneja ambos casos
                edad: userDetails.data.edad,
                sexo: userDetails.data.sexo,
                altura_cm: userDetails.data.altura_cm,
                peso_kg: userDetails.data.peso_kg,
                objetivo: userDetails.data.objetivo,
                ultima_consulta: userDetails.data.ultima_consulta
            });

            setMensaje(`✅ Bienvenido, ${res.data.nombre}`);
            navigation.navigate('Root');
        } catch (error: any) {
            console.error('Error en login:', error.response?.data || error.message);
            setMensaje('❌ Usuario o contraseña incorrectos');
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
                            value={usuario}
                            onChangeText={setUsuario}
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

                    <View style={styles.optionsRow}>
                        <TouchableOpacity>
                            <Text style={styles.optionText}>Forgot your password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>

                    {mensaje ? (
                        <Text style={{ textAlign: 'center', marginTop: 10 }}>{mensaje}</Text>
                    ) : null}

                    <Text style={styles.signUpText}>
                        Want to try the app? <Text style={styles.linkText}>Sign up</Text>
                    </Text>
                </View>
            </ScrollView>

            <View style={[styles.footerDecor, { backgroundColor: colors.background }]}>
                <Image
                    source={require('../../assets/f5.png')}
                    style={styles.footerImage}
                    resizeMode="cover"
                />
            </View>
        </SafeAreaView>
    );
}
