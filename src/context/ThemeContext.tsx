import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

type ThemeContextType = {
    darkMode: boolean;
    toggleTheme: () => void;
    colors: {
        background: string;
        text: string;
        card: string;
        border: string;
        primary: string;
    };
};

const lightColors = {
    background: '#EEEFE0', // fondo general
    text: '#000000 ',       // textos principales y títulos
    card: '#D1D8BE',       // fondos de tarjetas/secciones
    border: '#A7C1A8',     // bordes y líneas suaves
    primary: '#819A91',    // color principal, botones, FAB, iconos activos
};


const darkColors = {
    background: '#0d0d0d',
    text: '#ffffff',
    card: '#1c1c1e',
    border: '#2c2c2e',
    primary: '#34C759',
};

// Crea el contexto con un valor por defecto más completo
const ThemeContext = createContext<ThemeContextType>({
    darkMode: false,
    toggleTheme: () => { },
    colors: lightColors
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('darkMode');
                if (savedTheme !== null) {
                    setDarkMode(JSON.parse(savedTheme));
                } else {
                    const colorScheme = Appearance.getColorScheme();
                    setDarkMode(colorScheme === 'dark');
                }
            } catch (error) {
                console.error('Error loading theme', error);
                setDarkMode(false);
            }
        };

        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        try {
            await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
        } catch (error) {
            console.error('Error saving theme', error);
        }
    };

    const value = {
        darkMode,
        toggleTheme,
        colors: darkMode ? darkColors : lightColors
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook useTheme con verificación de contexto
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};