import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Home from '../screens/Home';
import Login from '../screens/login';
import RecipeSearch from '../screens/recipeSearch';

export type RootStackParamList = {
    RecipeSearch: undefined;
    Login: undefined;
    Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="RecipeSearch"
                    component={RecipeSearch}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Home"
                    component={Home}
                    options={{ headerShown: false }}
                />



            </Stack.Navigator>
        </NavigationContainer>
    );
}

// initialRouteName = Primera pantalla que se muestra al iniciar la app 