import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useFoodSearch } from '../hooks/useFoodSearch';
import { useAddFood } from '../hooks/useAddFood';
import { Food } from '../services/food.service';
import FoodSearchResultItem from '../components/FoodSearchResultItem';
import FoodItemCard from '../components/FoodItemCard';
import FoodDetails from '../components/FoodDetails';

const categories = [
    { id: 'breakfast', name: 'Breakfast', icon: 'food-croissant', bgColor: 'primaryContainer', iconColor: 'primary' },
    { id: 'lunch', name: 'Lunch', icon: 'food', bgColor: 'secondaryContainer', iconColor: 'secondary' },
    { id: 'snacks', name: 'Snacks', icon: 'cookie', bgColor: 'tertiaryContainer', iconColor: 'tertiary' },
    { id: 'keto', name: 'Keto', icon: 'egg', bgColor: 'surfaceContainerHigh', iconColor: 'onSurfaceVariant' },
];

export default function FoodSearchScreen({ navigation }: any) {
    const { colors, darkMode } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = createStyles(colors, darkMode, insets);

    const {
        query, setQuery, results, loading: searchLoading, showResults, setShowResults,
        recentSearches, searchByQuery, clearSearch, clearRecentSearches
    } = useFoodSearch();

    const {
        foodToAdd, modalVisible, setModalVisible,
        loading: addLoading,
        initiateAddFood, handleConfirm
    } = useAddFood(() => {
        // Handle success
    });

    const [viewing, setViewing] = useState<Food | null>(null);

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={22} color={colors.outline} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search foods..."
                    placeholderTextColor={colors.outline}
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={() => searchByQuery()}
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color={colors.outline} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderResults = () => (
        <FlatList
            data={results || []}
            keyExtractor={(item, idx) => `${item.food_name}-${idx}`}
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
            renderItem={({ item }) => (
                <FoodSearchResultItem 
                    item={item} 
                    onPress={() => setViewing(item)} 
                    colors={colors} 
                />
            )}
        />
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Find Nutrition</Text>
            </View>

            {renderSearchBar()}

            {showResults ? (
                <View style={styles.resultsContainer}>
                    {searchLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        renderResults()
                    )}
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.mainScrollContent}>
                    <Text style={styles.sectionTitle}>Quick Categories</Text>
                    <View style={styles.categoriesGrid}>
                        {categories.map((cat) => (
                            <Pressable key={cat.id} style={[styles.categoryCard, { backgroundColor: colors[cat.bgColor as keyof typeof colors] || colors.surfaceContainer }]} onPress={() => searchByQuery(cat.name)}>
                                <MaterialCommunityIcons name={cat.icon as any} size={28} color={colors[cat.iconColor as keyof typeof colors] || colors.primary} />
                                <Text style={styles.categoryText}>{cat.name}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Searches</Text>
                        {recentSearches.length > 0 && (
                            <TouchableOpacity onPress={clearRecentSearches}>
                                <Text style={{ color: colors.primary }}>Clear all</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {recentSearches.map((s, i) => (
                        <Pressable key={i} style={styles.recentItem} onPress={() => searchByQuery(s)}>
                            <Ionicons name="time-outline" size={20} color={colors.secondary} />
                            <Text style={styles.recentText}>{s}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}

            {/* Food Detail Modal using FoodItemCard */}
            {viewing && (
                <Modal visible transparent animationType="slide">
                    <TouchableWithoutFeedback onPress={() => setViewing(null)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={[styles.foodDetailsModal, { backgroundColor: colors.card }]}>
                                    <View style={styles.modalHandle} />
                                    <ScrollView>
                                        <FoodItemCard 
                                            food={viewing} 
                                            onAddFood={async (food, grams) => {
                                                setViewing(null);
                                                initiateAddFood(food, grams);
                                            }}
                                        />
                                    </ScrollView>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}

            {/* Confirmation Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                        <Text style={styles.modalTitle}>Confirm Add {foodToAdd?.food_name}</Text>
                        <Text style={{ textAlign: 'center', marginBottom: 20, color: colors.outline }}>
                            {foodToAdd?.serving_weight_grams}g - {foodToAdd?.nf_calories?.toFixed(0)} kcal
                        </Text>
                        <TouchableOpacity style={styles.addButton} onPress={handleConfirm} disabled={addLoading}>
                            {addLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.addButtonText}>Confirm</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 15 }}>
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
        </KeyboardAvoidingView>
    );
}

const createStyles = (colors: any, darkMode: boolean, insets: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 12 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: colors.onSurface },
    searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerHighest, borderRadius: 14, paddingHorizontal: 14, height: 52 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: colors.onSurface },
    clearButton: { padding: 4 },
    mainScrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface, marginVertical: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    categoryCard: { width: '47%', padding: 20, borderRadius: 16, minHeight: 100, justifyContent: 'space-between' },
    categoryText: { fontSize: 15, fontWeight: '700', marginTop: 8 },
    recentItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
    recentText: { fontSize: 15, fontWeight: '600', color: colors.onSurface },
    resultsContainer: { flex: 1 },
    resultsList: { flex: 1 },
    resultsContent: { paddingHorizontal: 20, paddingBottom: 100 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalHandle: { width: 40, height: 4, backgroundColor: colors.outline, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    foodDetailsModal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '90%' },
    addButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 28, alignItems: 'center' },
    addButtonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
    modalContainer: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
    closeText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.primary },
});
