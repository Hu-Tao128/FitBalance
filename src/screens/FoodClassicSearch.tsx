import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
    Modal
} from 'react-native';
import { AddFoodModal } from '../components/AddFoodModal';
import FoodDetails from '../components/FoodDetails';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SERVICE_UUID, CHAR_UUID } from '../config/bluetooth';
import { useBLEDevice } from '../components/UseBL';
import { Device } from 'react-native-ble-plx';

// Interface for API food object
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

// Search results list
const SearchResultsList = ({ foods, onSelect }: { foods: Food[]; onSelect: (food: Food) => void }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Resultados de la Búsqueda</Text>
        {foods.slice(0, 5).map((food, i) => (
            <TouchableOpacity key={i} style={styles.resultItem} onPress={() => onSelect(food)}>
            {food.photo?.thumb && <Image source={{ uri: food.photo.thumb }} style={styles.resultImage} />}
            <Text style={styles.resultText} numberOfLines={2}>{food.food_name}</Text>
            </TouchableOpacity>
        ))}
        </View>
    );
};

export default function FoodClassicSearch({ navigation }: any) {
    const { colors } = useTheme();
    const { user } = useUser();
    const styles = createStyles(colors);

    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Food[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewingFood, setViewingFood] = useState<Food | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [foodToAdd, setFoodToAdd] = useState<Food | null>(null);

    // BLE scale hook
    const {
        requestPermissions: reqScalePerms,
        scan: scanScaleDevices,
        connect: connectScale,
        disconnect: disconnectScale,
        devices: scaleDevices,
        connected: scaleConnected,
        dataValue: scaleWeight,
    } = useBLEDevice(SERVICE_UUID, CHAR_UUID);

    // Search API
    const searchByQuery = async () => {
        if (!query.trim()) { setError('Please enter the name of a meal.'); return; }
        setLoading(true); setError(''); setSearchResults(null); setViewingFood(null);
        try {
        const res = await axios.post<{ results: Food[] }>(
            `${API_CONFIG.BASE_URL}/search-food`, { query }
        );
        if (res.data.results?.length) setSearchResults(res.data.results);
        else setError('No results found.');
        } catch (err: any) {
        console.error(err);
        setError('Error connecting to server.');
        } finally {
        setLoading(false);
        }
    };

    // Add manual grams
    const handleAddFoodPress = (orig: Food, adjustedGrams: number) => {
        const baseGrams = orig.serving_weight_grams || 100;
        if (!baseGrams) return;
        const ratio = adjustedGrams / baseGrams;
        const adjusted: Food = {
        ...orig,
        serving_weight_grams: adjustedGrams,
        serving_qty: 1,
        serving_unit: `${adjustedGrams}g`,
        nf_calories: (orig.nf_calories || 0) * ratio,
        nf_protein:  (orig.nf_protein   || 0) * ratio,
        nf_total_carbohydrate: (orig.nf_total_carbohydrate||0)*ratio,
        nf_total_fat:    (orig.nf_total_fat    || 0) * ratio,
        nf_sugars:       (orig.nf_sugars       || 0) * ratio,
        nf_dietary_fiber:(orig.nf_dietary_fiber|| 0) * ratio,
        };
        setFoodToAdd(adjusted);
        setModalVisible(true);
    };

    // Add to log handler
    const handleSelectMeal = async (mealType: string, time: string) => {
        if (!foodToAdd || !user?.id) { Alert.alert('Error','No hay alimento o sesión.'); return; }
        setModalVisible(false); setLoading(true);
        try {
        await axios.post(`${API_CONFIG.BASE_URL}/dailymeallogs/add-food`, {
            patient_id: user.id, type: mealType, time, food_data: foodToAdd
        });
        Alert.alert('¡Éxito!', `${foodToAdd.food_name} añadido.`,[
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        } catch (err: any) { console.error(err); Alert.alert('Error','No se pudo añadir.'); }
        finally { setLoading(false); }
    };

    // Handler to start BLE scan & open scale modal
    const handleUseScale = async () => {
        const ok = await reqScalePerms();
        if (!ok) { Alert.alert('Permisos denegados','No BLE'); return; }
        scanScaleDevices();
        setScaleModal(true);
    };

    const onSelectScaleDevice = async (dev: Device) => await connectScale(dev);

    const handleAddScaleWeight = async () => {
        if (!foodToAdd || scaleWeight==null) return;
        // reuse handleSelectMeal: set foodToAdd already has grams? override
        const adjusted = { ...foodToAdd, serving_weight_grams: scaleWeight, serving_unit: `${scaleWeight}g` };
        setFoodToAdd(adjusted);
        setScaleModal(false);
        await handleSelectMeal('Snack', new Date().toTimeString().slice(0,5));
    };

    const [scaleModal, setScaleModal] = useState(false);

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
        {/* Search input */}
        <TextInput
            style={styles.input}
            placeholder='Ej: Apple, Pozole, Rice'
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchByQuery}
        />
        <TouchableOpacity style={styles.button} onPress={searchByQuery} disabled={loading}>
            <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size='large' color={colors.primary} />}
        {error && !loading && <Text style={styles.error}>{error}</Text>}

        {/* Results or details */}
        {searchResults && (
            viewingFood ? (
            <>
                <TouchableOpacity style={styles.backButton} onPress={() => setViewingFood(null)}>
                <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <FoodDetails foods={[viewingFood]} onAddFood={handleAddFoodPress} />
            </>
            ) : (
            <SearchResultsList foods={searchResults} onSelect={setViewingFood} />
            )
        )}

        {/* Modal: choose manual vs scale */}
        <Modal visible={isModalVisible} transparent animationType='slide'>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}> 
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Add {foodToAdd?.food_name}</Text>
                    <TouchableOpacity style={styles.optionButton} onPress={() => { handleSelectMeal('Snack','12:00'); }}>
                    <Ionicons name='checkmark-circle' size={22} color='#34C759'/>
                    <Text style={[styles.optionText,{color:colors.text}]}>Selected Portion</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionButton} onPress={handleUseScale}>
                    <MaterialCommunityIcons name='scale' size={22} color={colors.text}/>
                    <Text style={[styles.optionText,{color:colors.text}]}>Use a scale</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={[styles.closeText,{color:colors.primary}]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                </TouchableWithoutFeedback>
            </View>
            </TouchableWithoutFeedback>
        </Modal>

        {/* Modal: scale devices */}
        <Modal visible={scaleModal} transparent animationType='slide'>
            <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer,{ backgroundColor: colors.card }]}> 
                <Text style={[styles.modalTitle,{color:colors.text}]}>
                {scaleConnected ? 'Current weight' : 'Select Scale'}
                </Text>
                {scaleConnected ? (
                <>  
                    <Text style={[styles.scaleWeightText,{color:colors.primary}]}>
                    {scaleWeight!=null?`${scaleWeight} g`:'Waiting...'}
                    </Text>
                    <TouchableOpacity style={[styles.addWeightButton,{backgroundColor:colors.primary}]} onPress={handleAddScaleWeight} disabled={scaleWeight==null}>
                    <Text style={styles.addWeightButtonText}>Add {scaleWeight}g</Text>
                    </TouchableOpacity>
                </>
                ) : (
                scaleDevices.length===0 ? <ActivityIndicator/> :
                scaleDevices.map(dev=> (
                    <TouchableOpacity key={dev.id} style={styles.optionButton} onPress={()=>onSelectScaleDevice(dev)}>
                    <Text style={[styles.optionText,{color:colors.text}]}>{dev.name||dev.id}</Text>
                    </TouchableOpacity>
                ))
                )}
                <TouchableOpacity onPress={()=>{setScaleModal(false);disconnectScale();}}>
                <Text style={[styles.closeText,{color:colors.primary}]}>Cancel</Text>
                </TouchableOpacity>
            </View>
            </View>
        </Modal>
        </ScrollView>
    );
}

// Styles factory
const createStyles = (colors: any) => StyleSheet.create({
    container: { flex:1, backgroundColor:colors.background, padding:20 },
    input: { borderWidth:1, borderColor:colors.border, padding:12, borderRadius:10, marginBottom:10, color:colors.text, backgroundColor:colors.card },
    button: { backgroundColor:colors.primary, padding:12, borderRadius:10, marginBottom:20 },
    buttonText: { color:'#fff', textAlign:'center', fontWeight:'bold' },
    error: { color:'red', textAlign:'center', marginVertical:10 },
    resultsContainer: { marginTop:10 },
    resultsTitle: { fontSize:18, fontWeight:'bold', color:colors.text, marginBottom:10 },
    resultItem: { flexDirection:'row', alignItems:'center', backgroundColor:colors.card, padding:12, borderRadius:10, marginBottom:10, borderWidth:1, borderColor:colors.border },
    resultImage: { width:40, height:40, borderRadius:8, marginRight:12 },
    resultText: { flex:1, color:colors.text },
    backButton: { marginBottom:15 },
    backButtonText: { color:colors.primary, fontSize:16, fontWeight:'500' },
    // modal
    modalOverlay: { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.5)' },
    modalContainer: { padding:20, borderTopLeftRadius:20, borderTopRightRadius:20 },
    modalTitle: { fontSize:18, fontWeight:'bold', marginBottom:20 },
    optionButton: { flexDirection:'row', alignItems:'center', paddingVertical:12, gap:10 },
    optionText: { fontSize:16 },
    closeText: { textAlign:'center', marginTop:20 },
    scaleWeightText: { fontSize:24, textAlign:'center', fontWeight:'bold', marginVertical:20 },
    addWeightButton: { padding:12, borderRadius:8, justifyContent:'center', marginTop:10 },
    addWeightButtonText: { color:'#fff', textAlign:'center', fontWeight:'bold' }
});
