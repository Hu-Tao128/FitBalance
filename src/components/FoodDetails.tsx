import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Food {
    food_name: string;
    serving_qty: number;
    serving_unit: string;
    nf_calories?: number;
    nf_total_fat?: number;
    nf_saturated_fat?: number;
    nf_cholesterol?: number;
    nf_sodium?: number;
    nf_total_carbohydrate?: number;
    nf_dietary_fiber?: number;
    nf_sugars?: number;
    nf_protein?: number;
    nf_potassium?: number;
    photo?: {
        thumb?: string;
    };
}

interface Props {
    foods: Food[];
}

export default function FoodDetails({ foods }: Props) {

    const { colors } = useTheme();

    const styles = StyleSheet.create({
        card: {
            backgroundColor: colors.background,
            borderRadius: 10,
            padding: 15,
            marginVertical: 10,
            shadowColor: colors.primary,
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 3,
        },
        title: {
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 5,
            textTransform: 'capitalize',
        },
        serving: {
            fontSize: 14,
            color: '#666',
            marginBottom: 10,
        },
        image: {
            width: 80,
            height: 80,
            borderRadius: 10,
            alignSelf: 'center',
            marginBottom: 10,
        },
        ingredients: {
            color: colors.text,
        },
    });

    return (
        <>
            {foods.map((food, index) => (
                <View key={index} style={styles.card}>
                    <Text style={styles.title}>{food.food_name}</Text>
                    <Text style={styles.serving}>
                        {food.serving_qty} {food.serving_unit}
                    </Text>
                    {food.photo?.thumb && (
                        <Image source={{ uri: food.photo.thumb }} style={styles.image} />
                    )}
                    <Text style={styles.ingredients}>Calorías: {food.nf_calories ?? '0'} kcal</Text>
                    <Text style={styles.ingredients}>Grasa total: {food.nf_total_fat ?? '0'} g</Text>
                    <Text style={styles.ingredients}>Grasa saturada: {food.nf_saturated_fat ?? '0'} g</Text>
                    <Text style={styles.ingredients}>Colesterol: {food.nf_cholesterol ?? '0'} mg</Text>
                    <Text style={styles.ingredients}>Sodio: {food.nf_sodium ?? '0'} mg</Text>
                    <Text style={styles.ingredients}>Carbohidratos: {food.nf_total_carbohydrate ?? '0'} g</Text>
                    <Text style={styles.ingredients}>Fibra: {food.nf_dietary_fiber ?? '0'} g</Text>
                    <Text style={styles.ingredients}>Azúcares: {food.nf_sugars ?? '0'} g</Text>
                    <Text style={styles.ingredients}>Proteínas: {food.nf_protein ?? '0'} g</Text>
                    <Text style={styles.ingredients}>Potasio: {food.nf_potassium ?? '0'} mg</Text>
                </View>
            ))}
        </>
    );
}
