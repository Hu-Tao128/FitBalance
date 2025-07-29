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
        progressBg?: string;
        progressProtein?: string;
        progressCarbs?: string;
        progressFat?: string;
        success?: string;
        danger?: string;
        warning?: string;
        info?: string;
        textSecondary?: string; // Mantén esto opcional si no siempre lo usas,
        // o hazlo requerido si siempre estará en ambos temas
    };
};

export const lightColors = {
    background: '#E1EEBC',  // Fondo general: verde-amarillo suave, muy calmado y fresco
    card: '#F8FCE6',  // Cards: un poco más claro para contraste visual
    border: '#C7DFAB',  // Bordes: tono más oscuro del fondo
    primary: '#328E6E',  // Verde intenso, acento y botones principales
    accent: '#67AE6E',  // Verde intermedio, para detalles, iconos activos
    text: '#233F30',  // Verde-oliva súper oscuro (legible, no negro puro)
    textSecondary: '#4A6E5B',  // Secundario, verde suave
    icon: '#328E6E',  // Verde fuerte, consistente con primary
    divider: '#DAE8B8',  // Línea sutil para separadores

    // Para barras de progreso de las macros
    progressProtein: '#67AE6E', // Mantén el verde actual
    progressCarbs: '#6EC1E4', // Azul celeste suave (antes era #FFC107)
    progressFat: '#FFC107', // Mueve el amarillo acá (antes era rojo)

    //progressProtein: '#90C67C', // Proteínas: verde intenso
    //progressCarbs: '#FFC107', // Carbs: verde claro intermedio
    //progressFat: '#B22222', // Grasas: verde pastel suave
    progressBg: '#E1EEBC', // Fondo de barras de progreso (igual que fondo)

    success: '#67AE6E',     // Éxito: mismo verde intermedio
    warning: '#F6DE65',     // Warning: amarillo pastel visible sobre fondo
    error: '#EA6B6B',     // Error: rojo pastel moderno (por si acaso)
};

export const darkColors = {
    background: '#0d0d0d',
    text: '#ffffff',
    card: '#1c1c1e',
    border: '#2c2c2e',
    primary: '#34C759',

    // Nuevos colores para macros y barras de progreso
    progressProtein: '#67AE6E',
    progressCarbs: '#5AB8D1',
    progressFat: '#F6DE65', // Amarillo pastel bien visible en fondo oscuro
    //progressProtein: '#67AE6E',
    //progressCarbs: '#90C67C',
    //progressFat: '#E1EEBC',
    progressBg: '#23331C',

    // Opcionales, pero útiles para mensajes de estado
    success: '#67AE6E',
    danger: '#EA6B6B',
    warning: '#F6DE65',
    info: '#A1C8D8',
    textSecondary: '#999999', // <--- ¡Añade esta línea! Escoge el color que mejor te parezca para el texto secundario en modo oscuro.
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
        throw new Error('useTheme must be used a ThemeProvider');
    }
    return context;
};