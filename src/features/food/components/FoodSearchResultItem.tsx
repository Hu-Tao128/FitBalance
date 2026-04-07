import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Food } from '../services/food.service';

interface Props {
    item: Food;
    onPress: () => void;
    colors: any;
}

export default function FoodSearchResultItem({ item, onPress, colors }: Props) {
    return (
        <TouchableOpacity style={[styles.resultItem, { backgroundColor: colors.surfaceContainerLow }]} onPress={onPress}>
            {item.photo?.thumb ? (
                <Image source={{ uri: item.photo.thumb }} style={styles.resultImage} />
            ) : (
                <View style={[styles.resultImagePlaceholder, { backgroundColor: colors.surfaceContainerHighest }]}>
                    <MaterialCommunityIcons name="food-apple" size={24} color={colors.outline} />
                </View>
            )}
            <View style={styles.resultInfo}>
                <Text style={[styles.resultName, { color: colors.onSurface }]}>{item.food_name}</Text>
                <Text style={[styles.resultMeta, { color: colors.outline }]}>
                    {item.serving_qty} {item.serving_unit} • {item.nf_calories || 0} kcal
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.outline} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    resultItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 14, 
        borderRadius: 14, 
        marginBottom: 10 
    },
    resultImage: { width: 50, height: 50, borderRadius: 10, marginRight: 12 },
    resultImagePlaceholder: { 
        width: 50, 
        height: 50, 
        borderRadius: 10, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12 
    },
    resultInfo: { flex: 1 },
    resultName: { fontSize: 15, fontWeight: '600' },
    resultMeta: { fontSize: 12 },
});
