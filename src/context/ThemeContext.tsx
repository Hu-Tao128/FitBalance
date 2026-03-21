import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ActivityIndicator, View } from 'react-native';

type ThemeContextType = {
    darkMode: boolean;
    toggleTheme: () => void;
    isLoading: boolean;
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
        textSecondary?: string;
        error: string;
        onSurface: string;
        onSurfaceVariant: string;
        primaryContainer: string;
        onPrimaryContainer: string;
        secondaryContainer: string;
        onSecondaryContainer: string;
        [key: string]: string | undefined;
    };
};

export const lightColors = {
    background: '#F5FBEF',
    card: '#FFFFFF',
    surfaceContainer: '#EAF0E4',
    surfaceContainerHigh: '#E4EADE',
    surfaceContainerHighest: '#DEE4D9',
    surfaceContainerLow: '#F0F6EA',
    surfaceContainerLowest: '#F5FBEF',
    border: '#DEE4D9',
    primary: '#006E1C',
    primaryContainer: '#4CAF50',
    accent: '#67AE6E',
    text: '#171D16',
    textSecondary: '#3F4A3C',
    icon: '#328E6E',
    divider: '#DAE8B8',
    headerBg: '#F5FBEF',
    navBg: '#FFFFFF',
    progressProtein: '#67AE6E',
    progressCarbs: '#6EC1E4',
    progressFat: '#FFC107',
    progressBg: '#E1EEBC',
    success: '#67AE6E',
    warning: '#7d795f',
    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#003C0B',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#526772',
    onSurface: '#171D16',
    onSurfaceVariant: '#3F4A3C',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#003C0A',
    surface: '#F5FBEF',
    surfaceVariant: '#DEE4D9',
    surfaceBright: '#F5FBEF',
    surfaceDim: '#D6DCD0',
    surfaceTint: '#006E1C',
    inverseSurface: '#2C322A',
    inverseOnSurface: '#EDF3E7',
    inversePrimary: '#78DC77',
    tertiary: '#1B6D24',
    tertiaryContainer: '#5DAC5B',
    tertiaryFixed: '#A3F69C',
    tertiaryFixedDim: '#88D982',
    onTertiaryFixed: '#002204',
    onTertiaryFixedVariant: '#005312',
    secondary: '#4C616C',
    secondaryContainer: '#CFE6F2',
    secondaryFixed: '#CFE6F2',
    secondaryFixedDim: '#B4CAD6',
    onSecondaryFixed: '#071E27',
    onSecondaryFixedVariant: '#354A53',
    outline: '#6F7A6B',
    outlineVariant: '#BECAB9',
};

export const darkColors = {
    background: '#121411',
    card: '#1A1F18',
    surfaceContainer: '#21261F',
    surfaceContainerHigh: '#2B3128',
    surfaceContainerHighest: '#333930',
    surfaceContainerLow: '#1A1F18',
    surfaceContainerLowest: '#0C0F0A',
    border: '#43493F',
    primary: '#78DC77',
    primaryContainer: '#005313',
    accent: '#67AE6E',
    text: '#E1E3DE',
    textSecondary: '#C2C9BD',
    icon: '#78DC77',
    divider: '#333930',
    headerBg: '#121411',
    navBg: '#0C0F0A',
    progressProtein: '#67AE6E',
    progressCarbs: '#5AB8D1',
    progressFat: '#F6DE65',
    progressBg: '#23331C',
    success: '#67AE6E',
    warning: '#F6DE65',
    error: '#FFB4AB',
    errorContainer: '#93000A',
    onPrimary: '#002204',
    onPrimaryContainer: '#94F990',
    onSecondary: '#1E333C',
    onSecondaryContainer: '#B4CAD6',
    onSurface: '#E1E3DE',
    onSurfaceVariant: '#C2C9BD',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#003C0A',
    surface: '#121411',
    surfaceVariant: '#43493F',
    surfaceBright: '#383E35',
    surfaceDim: '#121411',
    surfaceTint: '#78DC77',
    inverseSurface: '#2C322A',
    inverseOnSurface: '#121411',
    inversePrimary: '#006E1C',
    tertiary: '#1B6D24',
    tertiaryContainer: '#005313',
    tertiaryFixed: '#A3F69C',
    tertiaryFixedDim: '#88D982',
    onTertiaryFixed: '#002204',
    onTertiaryFixedVariant: '#005312',
    secondary: '#B4CAD6',
    secondaryContainer: '#354A53',
    secondaryFixed: '#CFE6F2',
    secondaryFixedDim: '#B4CAD6',
    onSecondaryFixed: '#071E27',
    onSecondaryFixedVariant: '#CFE6F2',
    outline: '#8D9388',
    outlineVariant: '#43493F',
    danger: '#EA6B6B',
    info: '#A1C8D8',
};

const ThemeContext = createContext<ThemeContextType>({
    darkMode: false,
    toggleTheme: () => { },
    isLoading: true,
    colors: lightColors
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

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
            } catch {
                setDarkMode(false);
            } finally {
                setIsLoading(false);
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
        isLoading,
        colors: darkMode ? darkColors : lightColors
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: darkColors.background }}>
                <ActivityIndicator size="large" color={darkColors.primary} style={{ flex: 1, justifyContent: 'center' }} />
            </View>
        );
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used a ThemeProvider');
    }
    return context;
};
