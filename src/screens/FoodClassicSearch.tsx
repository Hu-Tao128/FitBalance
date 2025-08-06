import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
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
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { AddFoodModal } from '../components/AddFoodModal';
import FoodDetails from '../components/FoodDetails';
import { useBle } from '../context/BleContext';
import { Device } from 'react-native-ble-plx';

interface Food {
    food_name: string;
    serving_qty:   number;
    serving_unit:  string; 
    serving_weight_grams?: number;
    nf_calories?: number;
    nf_protein?: number;
    nf_total_carbohydrate?: number;
    nf_total_fat?: number;
    nf_sugars?: number;
    nf_dietary_fiber?: number;
    photo?: { thumb?: string };
}

export default function FoodClassicSearch({ navigation }: any) {
    const { colors } = useTheme();
    const { user } = useUser();
    const styles = createStyles(colors);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Food[] | null>(null);
    const [viewing, setViewing] = useState<Food | null>(null);
    const [foodToAdd, setFoodToAdd] = useState<Food | null>(null);
    const [manualModal, setManualModal] = useState(false);
    const [scaleModal, setScaleModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // BLE scale hook
    const { 
        devices: scaleDevices,
        connectedDevice: scaleConnected,
        weight: scaleWeight,
        scanDevices: scanScaleDevices,
        connectDevice: connectScale,
        disconnectDevice: disconnectScale,
        requestPermissions: reqScalePerms
    } = useBle();

    // 1) Buscar alimentos
    const searchByQuery = async () => {
        if (!query.trim()) {
        Alert.alert('Error', 'Ingresa nombre del alimento.');
        return;
        }
        setLoading(true);
        try {
        const res = await axios.post(`${API_CONFIG.BASE_URL}/search-food`, { query });
        setResults(res.data.results || []);
        } catch {
        Alert.alert('Error', 'No se pudo buscar.');
        } finally {
        setLoading(false);
        }
    };

    // 2) Al seleccionar en resultados
    const onSelectFood = (food: Food) => {
        setViewing(food);
        setResults(null);
    };

    // 3) Al ajustar gramos manualmente
    const handleAddFoodPress = (orig: Food, grams: number) => {
        const base = orig.serving_weight_grams || 100;
        const ratio = grams / base;
        const adjusted = {
        ...orig,
        serving_weight_grams: grams,
        nf_calories:          (orig.nf_calories || 0) * ratio,
        nf_protein:           (orig.nf_protein  || 0) * ratio,
        nf_total_carbohydrate:(orig.nf_total_carbohydrate||0)*ratio,
        nf_total_fat:         (orig.nf_total_fat || 0) * ratio,
        nf_sugars:            (orig.nf_sugars    || 0) * ratio,
        nf_dietary_fiber:(orig.nf_dietary_fiber||0)*ratio,
        };
        setFoodToAdd(adjusted);
        setManualModal(true);
    };

    // 4) Loguear por porción recomendada
    const handleConfirmManual = async () => {
        if (!foodToAdd || !user?.id) return;
        setManualModal(false);
        setLoading(true);
        try {
        const todayWeekday = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            timeZone: 'America/Tijuana'
        }).format(new Date()).toLowerCase();

        const meal = {
            day: todayWeekday,
            type: 'snack',
            time:  new Date().toTimeString().slice(0,5),
            foods: [{ food_id: foodToAdd.food_name /* o _id si lo mandas */, grams: foodToAdd.serving_weight_grams! }]
        };

        await axios.post(`${API_CONFIG.BASE_URL}/daily-meal-logs/add-meal`, {
            patient_id: user.id,
            meal
        });

        Alert.alert('¡Éxito!', `${foodToAdd.food_name} añadido.`);
        navigation.goBack();
        } catch {
        Alert.alert('Error', 'No se pudo añadir.');
        } finally {
        setLoading(false);
        }
    };

    // 5) Abrir flujo de báscula
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

        const meal = {
            day: todayWeekday,
            type: 'snack',
            time:  new Date().toTimeString().slice(0,5),
            foods: [{ food_id: foodToAdd.food_name, grams: foodToAdd.serving_weight_grams! }]
        };

        await axios.post(`${API_CONFIG.BASE_URL}/daily-meal-logs/add-meal`, {
            patient_id: user.id,
            meal,
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

    if (loading) return (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
    );

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Input y botón búsqueda */}
        <TextInput
            style={styles.input}
            placeholder="Ej: Apple"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchByQuery}
        />
        <TouchableOpacity style={styles.button} onPress={searchByQuery}>
            <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>

        {/* Resultados o detalle */}
        {results && (
            <View>
            {results.map((f,i) => (
                <TouchableOpacity key={i} onPress={() => onSelectFood(f)} style={styles.resultItem}>
                {f.photo?.thumb && <Image source={{uri:f.photo.thumb}} style={styles.resultImage}/>}
                <Text style={styles.resultText}>{f.food_name}</Text>
                </TouchableOpacity>
            ))}
            </View>
        )}
        {viewing && (
            <FoodDetails foods={[viewing]} onAddFood={handleAddFoodPress} />
        )}

        {/* Modal porción manual */}
        <Modal visible={manualModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setManualModal(false)}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                <View style={[styles.modalContainer, {backgroundColor: colors.card}]}>
                    <Text style={[styles.modalTitle, {color: colors.text}]}>
                    Añadir {foodToAdd?.food_name}
                    </Text>
                    <TouchableOpacity style={styles.optionButton} onPress={handleConfirmManual}>
                    <Ionicons name="checkmark" size={22} color="#34C759" />
                    <Text style={[styles.optionText, {color:colors.text}]}>
                        Porción recomendada
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionButton} onPress={handleUseScale}>
                    <MaterialCommunityIcons name="scale" size={22} color={colors.text} />
                    <Text style={[styles.optionText, {color:colors.text}]}>
                        Usar báscula
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setManualModal(false)}>
                    <Text style={[styles.closeText,{color:colors.primary}]}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
                </TouchableWithoutFeedback>
            </View>
            </TouchableWithoutFeedback>
        </Modal>

        {/* Modal báscula */}
         {/* Scale modal */}
            <Modal transparent visible={scaleModal} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {scaleConnected ? 'Current weight' : 'Select your scale'}
                        </Text>

                        {scaleConnected && (
                            <>
                                <Text style={styles.scaleWeightText}>
                                    {scaleWeight != null ? `${scaleWeight} g` : 'Waiting for data...'}
                                </Text>
                                
                                <TouchableOpacity 
                                    style={styles.addWeightButton}
                                    onPress={handleUseScale}
                                    disabled={scaleWeight === null}
                                >
                                    <Text style={styles.addWeightButtonText}>
                                        Add {scaleWeight !== null ? `${scaleWeight}g` : 'weight'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Dentro de tu Modal de selección de báscula */}
                        {!scaleConnected && (
                        <ScrollView 
                            style={{ maxHeight: 300, marginBottom: 10 }}
                            contentContainerStyle={{ paddingVertical: 8 }}
                        >
                            {scaleDevices.length === 0 ? (
                            <ActivityIndicator />
                            ) : (
                            scaleDevices.map(dev => (
                                <TouchableOpacity
                                key={dev.id}
                                style={styles.optionButton}
                                onPress={() => onSelectScaleDevice(dev)}
                                >
                                <Text style={styles.optionText}>
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
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

// estilos
const createStyles = (colors: any) => StyleSheet.create({
    container: { flex:1, backgroundColor:colors.background, padding:20 },
    center: { flex:1, justifyContent:'center', alignItems:'center' },
    input:    { borderWidth:1, borderColor:colors.border, borderRadius:10, padding:12, marginBottom:10, backgroundColor:colors.card, color:colors.text },
    button:   { backgroundColor:colors.primary, padding:12, borderRadius:10, marginBottom:20 },
    buttonText:{ color:'#fff', textAlign:'center', fontWeight:'bold' },
    resultItem:{ flexDirection:'row', padding:12, backgroundColor:colors.card, borderRadius:10, marginBottom:10, borderWidth:1, borderColor:colors.border },
    resultImage:{ width:40, height:40, borderRadius:6, marginRight:12 },
    resultText:{ flex:1, color:colors.text },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        backgroundColor: colors.card,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 20,
        textAlign: 'center'
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 10,
    },
    optionText: {
        color: colors.text,
        fontSize: 16,
    },
    closeText: {
        color: colors.primary,
        marginTop: 20,
        textAlign: 'center',
    },
    scaleWeightText: {
        fontSize: 24,
        color: colors.primary,
        textAlign: 'center',
        marginVertical: 20,
        fontWeight: 'bold'
    },
    addWeightButton: {
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 12,
        marginTop: 10
    },
    addWeightButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
    }
});
