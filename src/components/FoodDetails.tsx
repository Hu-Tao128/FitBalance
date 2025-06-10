// src/components/FoodDetails.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

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
                    <Text>Calorías: {food.nf_calories ?? '?'} kcal</Text>
                    <Text>Grasa total: {food.nf_total_fat ?? '?'} g</Text>
                    <Text>Grasa saturada: {food.nf_saturated_fat ?? '?'} g</Text>
                    <Text>Colesterol: {food.nf_cholesterol ?? '?'} mg</Text>
                    <Text>Sodio: {food.nf_sodium ?? '?'} mg</Text>
                    <Text>Carbohidratos: {food.nf_total_carbohydrate ?? '?'} g</Text>
                    <Text>Fibra: {food.nf_dietary_fiber ?? '?'} g</Text>
                    <Text>Azúcares: {food.nf_sugars ?? '?'} g</Text>
                    <Text>Proteínas: {food.nf_protein ?? '?'} g</Text>
                    <Text>Potasio: {food.nf_potassium ?? '?'} mg</Text>
                </View>
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
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
});
