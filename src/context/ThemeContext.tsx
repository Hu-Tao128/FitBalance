// src/context/ThemeContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    background: '#ffffff',
    text: '#121212',
    card: '#f8f9fa',
    border: '#e9ecef',
    primary: '#34C759',
};

const darkColors = {
    background: '#0d0d0d',
    text: '#ffffff',
    card: '#1c1c1e',
    border: '#2c2c2e',
    primary: '#34C759',
};

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('darkMode');
                if (savedTheme !== null) {
                    setDarkMode(JSON.parse(savedTheme));
                } else {
                    setDarkMode(Appearance.getColorScheme() === 'dark');
                }
            } catch (error) {
                console.error('Error loading theme', error);
            }
        };

        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
    };

    return (
        <ThemeContext.Provider value={{
            darkMode,
            toggleTheme,
            colors: darkMode ? darkColors : lightColors
        }}>
            {children}
        </ThemeContext.Provider>
    );
};