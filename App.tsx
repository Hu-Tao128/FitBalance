import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RecipeSearch from './views/recipeSearch';

export type RootStackParamList = {
  RecipeSearch: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="RecipeSearch"
          component={RecipeSearch}
          options={{ title: 'Busca Recetas V4' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
