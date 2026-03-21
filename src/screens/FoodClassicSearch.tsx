import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
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
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useBle } from '../context/BleContext';
import { Device } from 'react-native-ble-plx';

interface Food {
    food_name: string;
    serving_qty: number;
    serving_unit: string;
    serving_weight_grams?: number;
    nf_calories?: number;
    nf_protein?: number;
    nf_total_carbohydrate?: number;
    nf_total_fat?: number;
    nf_sugars?: number;
    nf_dietary_fiber?: number;
    photo?: { thumb?: string };
}

interface Category {
    id: string;
    name: string;
    icon: string;
    bgColor: string;
    iconColor: string;
}

const categories: Category[] = [
    { id: 'breakfast', name: 'Breakfast', icon: 'food croissant', bgColor: 'primaryContainer', iconColor: 'primary' },
    { id: 'lunch', name: 'Lunch', icon: 'food', bgColor: 'secondaryContainer', iconColor: 'secondary' },
    { id: 'snacks', name: 'Snacks', icon: 'cookie', bgColor: 'tertiaryContainer', iconColor: 'tertiary' },
    { id: 'keto', name: 'Keto', icon: 'egg', bgColor: 'surfaceContainerHigh', iconColor: 'onSurfaceVariant' },
];

export default function FoodClassicSearch({ navigation }: any) {
    const { colors, darkMode } = useTheme();
    const { user } = useUser();
    const insets = useSafeAreaInsets();
    const styles = createStyles(colors, darkMode, insets);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Food[] | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [viewing, setViewing] = useState<Food | null>(null);
    const [foodToAdd, setFoodToAdd] = useState<Food | null>(null);
    const [manualModal, setManualModal] = useState(false);
    const [scaleModal, setScaleModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const {
        devices: scaleDevices,
        connectedDevice: scaleConnected,
        weight: scaleWeight,
        scanDevices: scanScaleDevices,
        connectDevice: connectScale,
        disconnectDevice: disconnectScale,
        requestPermissions: reqScalePerms
    } = useBle();

    const searchByQuery = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setShowResults(true);
        try {
            const res = await axios.post(`${API_CONFIG.BASE_URL}/search-food`, { query });
            setResults(res.data.results || []);
            if (!recentSearches.includes(query.trim())) {
                setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
            }
        } catch {
            Alert.alert('Error', 'No se pudo buscar.');
        } finally {
            setLoading(false);
        }
    };

    const onSelectFood = (food: Food) => {
        setViewing(food);
        setShowResults(false);
    };

    const clearSearch = () => {
        setQuery('');
        setResults(null);
        setShowResults(false);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
    };

    const handleAddFoodPress = (orig: Food, grams: number) => {
        const base = orig.serving_weight_grams || 100;
        const ratio = grams / base;
        const adjusted = {
            ...orig,
            serving_weight_grams: grams,
            nf_calories: (orig.nf_calories || 0) * ratio,
            nf_protein: (orig.nf_protein || 0) * ratio,
            nf_total_carbohydrate: (orig.nf_total_carbohydrate || 0) * ratio,
            nf_total_fat: (orig.nf_total_fat || 0) * ratio,
            nf_sugars: (orig.nf_sugars || 0) * ratio,
            nf_dietary_fiber: (orig.nf_dietary_fiber || 0) * ratio,
        };
        setFoodToAdd(adjusted);
        setManualModal(true);
    };

    const handleConfirmManual = async () => {
        if (!foodToAdd || !user?.id) return;
        setManualModal(false);
        setLoading(true);
        try {
            const todayWeekday = new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                timeZone: 'America/Tijuana'
            }).format(new Date()).toLowerCase();

            await axios.post(`${API_CONFIG.BASE_URL}/daily-meal-logs/add-meal`, {
                patient_id: user.id,
                meal: {
                    day: todayWeekday,
                    type: 'snack',
                    time: new Date().toTimeString().slice(0, 5),
                    foods: [{ food_id: foodToAdd.food_name, grams: foodToAdd.serving_weight_grams }]
                }
            });

            Alert.alert('¡Éxito!', `${foodToAdd.food_name} añadido.`);
            navigation.goBack();
        } catch {
            Alert.alert('Error', 'No se pudo añadir.');
        } finally {
            setLoading(false);
        }
    };

    const handleUseScale = async () => {
        const ok = await reqScalePerms();
        if (!ok) { Alert.alert('Error', 'Permisos BLE denegados'); return; }
        scanScaleDevices();
        setScaleModal(true);
    };

    const onSelectScaleDevice = async (dev: Device) => {
        await connectScale(dev);
    };

    const handleConfirmScale = async () => {
        if (!foodToAdd || scaleWeight == null || !user?.id) return;
        setScaleModal(false);
        setLoading(true);
        try {
            const todayWeekday = new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                timeZone: 'America/Tijuana'
            }).format(new Date()).toLowerCase();

            await axios.post(`${API_CONFIG.BASE_URL}/daily-meal-logs/add-meal`, {
                patient_id: user.id,
                meal: {
                    day: todayWeekday,
                    type: 'snack',
                    time: new Date().toTimeString().slice(0, 5),
                    foods: [{ food_id: foodToAdd.food_name, grams: foodToAdd.serving_weight_grams }]
                },
                weight: scaleWeight
            });

            Alert.alert('¡Éxito!', `${scaleWeight}g añadidos.`);
            navigation.goBack();
        } catch {
            Alert.alert('Error', 'No se pudo añadir peso.');
        } finally {
            setLoading(false);
        }
    };

    const navigateToScanner = () => {
        navigation.navigate('FoodScanner');
    };

    const getBgColor = (colorName: string) => {
        const colorMap: Record<string, string> = {
            primaryContainer: colors.primaryContainer || '#e8f5e9',
            secondaryContainer: colors.secondaryContainer || '#e3f2fd',
            tertiaryContainer: colors.tertiaryContainer || '#e8f5e9',
            surfaceContainerHigh: colors.surfaceContainerHigh || '#e0e0e0',
        };
        return colorMap[colorName] || colors.surfaceContainer || '#f5f5f5';
    };

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={22} color={colors.outline} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search foods, recipes, or nutrients..."
                    placeholderTextColor={colors.outline}
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={searchByQuery}
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

    const renderCategories = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Categories</Text>
            <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                    <Pressable
                        key={cat.id}
                        style={[styles.categoryCard, { backgroundColor: getBgColor(cat.bgColor) }]}
                        onPress={() => {
                            setQuery(cat.name);
                            searchByQuery();
                        }}
                    >
                        <MaterialCommunityIcons
                            name={cat.icon as any}
                            size={28}
                            color={colors[cat.iconColor as keyof typeof colors] || colors.primary}
                        />
                        <Text style={[styles.categoryText, { color: colors.onSurfaceVariant }]}>
                            {cat.name}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );

    const renderRecentSearches = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearches.length > 0 && (
                    <TouchableOpacity onPress={clearRecentSearches}>
                        <Text style={[styles.clearAllText, { color: colors.primary }]}>Clear all</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.recentList}>
                {recentSearches.map((search, idx) => (
                    <Pressable
                        key={idx}
                        style={styles.recentItem}
                        onPress={() => {
                            setQuery(search);
                            searchByQuery();
                        }}
                    >
                        <View style={styles.recentIconBox}>
                            <Ionicons name="time-outline" size={20} color={colors.secondary} />
                        </View>
                        <Text style={styles.recentText}>{search}</Text>
                    </Pressable>
                ))}
                {recentSearches.length === 0 && (
                    <Text style={[styles.emptyText, { color: colors.outline }]}>
                        No recent searches
                    </Text>
                )}
            </View>
        </View>
    );

    const renderScannerCard = () => (
        <Pressable style={styles.scannerCard} onPress={navigateToScanner}>
            <View style={styles.scannerContent}>
                <View style={styles.scannerIconBox}>
                    <MaterialCommunityIcons name="flash" size={28} color={colors.onPrimary} />
                </View>
                <View style={styles.scannerTextBox}>
                    <Text style={styles.scannerTitle}>Can't find it?</Text>
                    <Text style={styles.scannerSubtitle}>Scan your barcode.</Text>
                </View>
            </View>
            <MaterialCommunityIcons name="qrcode-scan" size={60} color={colors.onPrimary} style={styles.scannerBgIcon} />
        </Pressable>
    );

    const renderResults = () => (
        <FlatList
            data={results || []}
            keyExtractor={(item, idx) => `${item.food_name}-${idx}`}
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
            ListEmptyComponent={
                showResults && !loading ? (
                    <View style={styles.noResultsBox}>
                        <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                            No foods found for "{query}"
                        </Text>
                    </View>
                ) : null
            }
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => onSelectFood(item)}>
                    {item.photo?.thumb ? (
                        <Image 
                            source={{ uri: item.photo.thumb }} 
                            style={styles.resultImage}
                            resizeMode="cover"
                            progressiveRenderingEnabled={true}
                        />
                    ) : (
                        <View style={styles.resultImagePlaceholder}>
                            <MaterialCommunityIcons name="food-apple" size={24} color={colors.outline} />
                        </View>
                    )}
                    <View style={styles.resultInfo}>
                        <Text style={styles.resultName} numberOfLines={2}>{item.food_name}</Text>
                        <Text style={styles.resultMeta}>
                            {item.serving_qty} {item.serving_unit} • {item.nf_calories || 0} kcal
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.outline} />
                </TouchableOpacity>
            )}
        />
    );

    if (loading && !showResults) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Find Nutrition</Text>
                </View>

                {renderSearchBar()}

                {showResults ? (
                    <View style={styles.resultsContainer}>
                        {loading ? (
                            <View style={styles.loadingResults}>
                                <ActivityIndicator size="large" color={colors.primary} />
                            </View>
                        ) : (
                            renderResults()
                        )}
                    </View>
                ) : (
                    <ScrollView
                        style={styles.mainContent}
                        contentContainerStyle={styles.mainScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {renderCategories()}
                        {renderRecentSearches()}
                        {renderScannerCard()}
                    </ScrollView>
                )}
            </View>

            {/* Food Details Modal */}
            {viewing && (
                <Modal visible transparent animationType="slide" onRequestClose={() => setViewing(null)}>
                    <TouchableWithoutFeedback onPress={() => setViewing(null)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={[styles.foodDetailsModal, { backgroundColor: colors.card }]}>
                                    <View style={styles.modalHandle} />
                                    {viewing.photo?.thumb && (
                                        <Image source={{ uri: viewing.photo.thumb }} style={styles.foodDetailImage} />
                                    )}
                                    <Text style={styles.foodDetailName}>{viewing.food_name}</Text>
                                    <Text style={styles.foodDetailServing}>
                                        {viewing.serving_qty} {viewing.serving_unit} ({viewing.serving_weight_grams}g)
                                    </Text>

                                    <View style={styles.macrosGrid}>
                                        <View style={styles.macroItem}>
                                            <Text style={styles.macroValue}>{viewing.nf_calories?.toFixed(0) || 0}</Text>
                                            <Text style={styles.macroLabel}>Calories</Text>
                                        </View>
                                        <View style={styles.macroItem}>
                                            <Text style={styles.macroValue}>{viewing.nf_protein?.toFixed(1) || 0}g</Text>
                                            <Text style={styles.macroLabel}>Protein</Text>
                                        </View>
                                        <View style={styles.macroItem}>
                                            <Text style={styles.macroValue}>{viewing.nf_total_carbohydrate?.toFixed(1) || 0}g</Text>
                                            <Text style={styles.macroLabel}>Carbs</Text>
                                        </View>
                                        <View style={styles.macroItem}>
                                            <Text style={styles.macroValue}>{viewing.nf_total_fat?.toFixed(1) || 0}g</Text>
                                            <Text style={styles.macroLabel}>Fat</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => handleAddFoodPress(viewing, viewing.serving_weight_grams ?? 100)}
                                    >
                                        <Text style={styles.addButtonText}>Add Food</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}

            {/* Add Food Modal */}
            <Modal visible={manualModal} transparent animationType="slide">
                <TouchableWithoutFeedback onPress={() => setManualModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    Add {foodToAdd?.food_name}
                                </Text>
                                <TouchableOpacity style={styles.optionButton} onPress={handleConfirmManual}>
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                    <Text style={[styles.optionText, { color: colors.text }]}>
                                        Recommended serving
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.optionButton} onPress={handleUseScale}>
                                    <MaterialCommunityIcons name="scale-bathroom" size={24} color={colors.text} />
                                    <Text style={[styles.optionText, { color: colors.text }]}>
                                        Use scale
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setManualModal(false)}>
                                    <Text style={[styles.closeText, { color: colors.primary }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Scale Modal */}
            <Modal visible={scaleModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {scaleConnected ? 'Current weight' : 'Select your scale'}
                        </Text>

                        {scaleConnected && (
                            <>
                                <Text style={styles.scaleWeightText}>
                                    {scaleWeight != null ? `${scaleWeight} g` : 'Waiting for data...'}
                                </Text>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={handleConfirmScale}
                                    disabled={scaleWeight === null}
                                >
                                    <Text style={styles.addButtonText}>
                                        Add {scaleWeight !== null ? `${scaleWeight}g` : 'weight'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {!scaleConnected && (
                            <ScrollView style={styles.scaleDeviceList}>
                                {scaleDevices.length === 0 ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    scaleDevices.map(dev => (
                                        <TouchableOpacity
                                            key={dev.id}
                                            style={styles.optionButton}
                                            onPress={() => onSelectScaleDevice(dev)}
                                        >
                                            <MaterialCommunityIcons name="bluetooth" size={24} color={colors.primary} />
                                            <Text style={[styles.optionText, { color: colors.text }]}>
                                                {dev.name || dev.id}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        )}

                        <TouchableOpacity onPress={() => {
                            setScaleModal(false);
                            disconnectScale();
                        }}>
                            <Text style={[styles.closeText, { color: colors.primary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const createStyles = (colors: any, darkMode: boolean, insets: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 12 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: colors.onSurface, letterSpacing: -0.5 },
    searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceContainerHighest,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 52,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: colors.onSurface },
    clearButton: { padding: 4 },
    mainContent: { flex: 1 },
    mainScrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    section: { marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface, marginBottom: 12 },
    clearAllText: { fontSize: 14, fontWeight: '600' },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    categoryCard: {
        width: '47%',
        padding: 20,
        borderRadius: 16,
        minHeight: 100,
        justifyContent: 'space-between',
    },
    categoryText: { fontSize: 15, fontWeight: '700', marginTop: 8 },
    recentList: { gap: 8 },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceContainerLow,
        padding: 14,
        borderRadius: 14,
    },
    recentIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceContainerHighest, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    recentText: { fontSize: 15, fontWeight: '600', color: colors.onSurface },
    emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
    scannerCard: {
        backgroundColor: colors.primary,
        borderRadius: 32,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 20,
    },
    scannerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    scannerIconBox: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    scannerTextBox: {},
    scannerTitle: { fontSize: 18, fontWeight: '800', color: colors.onPrimary },
    scannerSubtitle: { fontSize: 14, color: colors.onPrimary, opacity: 0.9 },
    scannerBgIcon: { position: 'absolute', right: -10, bottom: -15, opacity: 0.2 },
    resultsContainer: { flex: 1 },
    loadingResults: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    resultsList: { flex: 1 },
    resultsContent: { paddingHorizontal: 20, paddingBottom: 100 },
    noResultsBox: { paddingVertical: 40, alignItems: 'center' },
    noResultsText: { fontSize: 16 },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceContainerLow,
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    resultImage: { width: 50, height: 50, borderRadius: 10, marginRight: 12 },
    resultImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: colors.surfaceContainerHighest,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resultInfo: { flex: 1 },
    resultName: { fontSize: 15, fontWeight: '600', color: colors.onSurface, marginBottom: 2 },
    resultMeta: { fontSize: 12, color: colors.outline },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalHandle: { width: 40, height: 4, backgroundColor: colors.outline, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    foodDetailsModal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
    foodDetailImage: { width: '100%', height: 180, borderRadius: 16, marginBottom: 16 },
    foodDetailName: { fontSize: 22, fontWeight: '800', color: colors.onSurface, marginBottom: 4 },
    foodDetailServing: { fontSize: 14, color: colors.outline, marginBottom: 20 },
    macrosGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
    macroItem: { alignItems: 'center' },
    macroValue: { fontSize: 20, fontWeight: '700', color: colors.onSurface },
    macroLabel: { fontSize: 12, color: colors.outline, marginTop: 2 },
    addButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 28, alignItems: 'center' },
    addButtonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
    modalContainer: { backgroundColor: colors.card, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
    optionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
    optionText: { fontSize: 16, fontWeight: '500' },
    closeText: { marginTop: 16, textAlign: 'center', fontSize: 16, fontWeight: '600' },
    scaleWeightText: { fontSize: 36, fontWeight: '700', color: colors.primary, textAlign: 'center', marginVertical: 20 },
    scaleDeviceList: { maxHeight: 200 },
});
