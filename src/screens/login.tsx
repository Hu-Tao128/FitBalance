import { Entypo, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function App() {
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Reemplazamos el fondo degradado por una imagen */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/a6.png')}
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
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Entypo name="lock" size={20} color="#999" />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        style={styles.input}
                    />
                </View>

                <View style={styles.optionsRow}>
                    <View style={styles.rememberMe}>
                        <Switch
                            value={rememberMe}
                            onValueChange={setRememberMe}
                            thumbColor={rememberMe ? "#5f2c82" : "#ccc"}
                        />
                        <Text style={styles.optionText}>Remember me</Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.optionText}>Forget password?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.loginButton}>
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>

                <Text style={styles.signUpText}>
                    New user? <Text style={styles.linkText}>Sign Up</Text>
                </Text>

                <Text style={styles.or}>OR</Text>

                <View style={styles.socials}>
                    <TouchableOpacity><Entypo name="linkedin" size={24} color="#0077b5" /></TouchableOpacity>
                    <TouchableOpacity><Entypo name="facebook" size={24} color="#3b5998" /></TouchableOpacity>
                    <TouchableOpacity><Entypo name="google--with-circle" size={24} color="#db4437" /></TouchableOpacity>
                </View>

                <Text style={styles.footerText}>Sign in with another account</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
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
        borderColor: '#5f2c82',
        borderWidth: 1.5,
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    loginText: {
        color: '#5f2c82',
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
        color: '#5f2c82',
        fontWeight: '600',
    },
    or: {
        textAlign: 'center',
        color: '#aaa',
        marginBottom: 10,
    },
    socials: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 10,
    },
    footerText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
    },
});
