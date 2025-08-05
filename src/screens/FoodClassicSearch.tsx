import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert, Image, Modal,
    ScrollView, StyleSheet, Text, TextInput,
    TouchableOpacity, View, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_CONFIG } from '../config/config';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import FoodDetails from '../components/FoodDetails';
import { SERVICE_UUID, CHAR_UUID } from '../config/bluetooth';
import { useBLEDevice } from '../components/UseBL';
import { Device } from 'react-native-ble-plx';

interface Food {
    food_name: string;
    serving_qty:      number;
    serving_unit:     string;
    serving_weight_grams?: number;
    nf_calories?:     number;
    nf_protein?:      number;
    nf_total_carbohydrate?: number;
    nf_total_fat?:    number;
    nf_sugars?:       number;
    nf_dietary_fiber?:number;
    photo?: { thumb?: string };
}

export default function FoodClassicSearch({ navigation }: any) {
    const { colors } = useTheme();
    const { user }   = useUser();
    const styles     = createStyles(colors);

    const [query, setQuery]           = useState('');
    const [results, setResults]       = useState<Food[] | null>(null);
    const [viewing, setViewing]       = useState<Food  | null>(null);
    const [foodToAdd, setFoodToAdd]   = useState<Food  | null>(null);
    const [manualModal, setManualModal] = useState(false);
    const [scaleModal,  setScaleModal]  = useState(false);
    const [loading,    setLoading]    = useState(false);

    const {
        requestPermissions: reqPerms,
        scan, connect, disconnect,
        devices, connected, dataValue: scaleWeight
    } = useBLEDevice(SERVICE_UUID, CHAR_UUID);

    // 1) Buscar
    const searchByQuery = async () => {
        if (!query.trim()) return Alert.alert('Error','Ingresa un nombre');
        setLoading(true);
        try {
        const res = await axios.post(`${API_CONFIG.BASE_URL}/search-food`, { query });
        setResults(res.data.results || []);
        } catch {
        Alert.alert('Error', 'No se pudo buscar');
        } finally {
        setLoading(false);
        }
    };

    // 2) Selección en lista
    const onSelectFood = (food: Food) => {
        setViewing(food);
        setResults(null);
    };

    // 3) Ajuste manual
    const handleAddFoodPress = (orig: Food, grams: number) => {
        const base  = orig.serving_weight_grams || 100;
        const ratio = grams / base;
        setFoodToAdd({
        ...orig,
        serving_weight_grams: grams,
        nf_calories:           (orig.nf_calories           || 0) * ratio,
        nf_protein:            (orig.nf_protein            || 0) * ratio,
        nf_total_carbohydrate: (orig.nf_total_carbohydrate || 0) * ratio,
        nf_total_fat:          (orig.nf_total_fat          || 0) * ratio,
        nf_sugars:             (orig.nf_sugars             || 0) * ratio,
        nf_dietary_fiber:      (orig.nf_dietary_fiber      || 0) * ratio,
        });
        setManualModal(true);
    };

    // 4) Confirmar porción manual
    const handleConfirmManual = async () => {
        if (!foodToAdd || !user?.id) return;
        setManualModal(false);
        setLoading(true);
        try {
        const todayWeekday = new Intl.DateTimeFormat('en-US', {
            weekday:'long', timeZone:'America/Tijuana'
        }).format(new Date()).toLowerCase();

        const meal = {
            day: todayWeekday,
            type:'snack',
            time:new Date().toTimeString().slice(0,5),
            foods:[{
            food_id: foodToAdd.food_name,
            grams:   foodToAdd.serving_weight_grams!
            }]
        };

        await axios.post(`${API_CONFIG.BASE_URL}/daily-meal-logs/add-meal`, {
            patient_id: user.id,
            meal
        });

        Alert.alert('¡Éxito!', `${foodToAdd.food_name} añadido.`);
        navigation.goBack();
        } catch {
        Alert.alert('Error','No se pudo añadir.');
        } finally {
        setLoading(false);
        }
    };

    // 5) Flujo báscula
    const handleUseScale = async () => {
        if (!(await reqPerms())) return Alert.alert('Error','Permisos BLE');
        scan();
        setScaleModal(true);
    };
    const onSelectScaleDevice = async (dev: Device) => await connect(dev);
    const handleConfirmScale = async () => {
        if (!foodToAdd || scaleWeight == null || !user?.id) return;
        setScaleModal(false);
        setLoading(true);
        try {
        const todayWeekday = new Intl.DateTimeFormat('en-US', {
            weekday:'long', timeZone:'America/Tijuana'
        }).format(new Date()).toLowerCase();

        const meal = {
            day: todayWeekday,
            type:'snack',
            time:new Date().toTimeString().slice(0,5),
            foods:[{
            food_id: foodToAdd.food_name,
            grams:   scaleWeight
            }]
        };

        await axios.post(`${API_CONFIG.BASE_URL}/daily-meal-logs/add-meal`, {
            patient_id: user.id,
            meal,
            weight: scaleWeight
        });

        Alert.alert('¡Éxito!', `${scaleWeight}g añadidos.`);
        navigation.goBack();
        } catch {
        Alert.alert('Error','No se pudo añadir peso.');
        } finally {
        setLoading(false);
        // —> Liberar BLE
        disconnect();
        }
    };

    if (loading) return (
        <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary}/>
        </View>
    );

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Input + botón */}
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

        {/* Lista o detalle */}
        {results && results.map((f,i)=>(
            <TouchableOpacity key={i} style={styles.resultItem} onPress={()=>onSelectFood(f)}>
            {f.photo?.thumb && <Image source={{uri:f.photo.thumb}} style={styles.resultImage}/>}
            <Text style={styles.resultText}>{f.food_name}</Text>
            </TouchableOpacity>
        ))}
        {viewing && <FoodDetails foods={[viewing]} onAddFood={handleAddFoodPress}/>}

        {/* Modal manual */}
        <Modal visible={manualModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={()=>setManualModal(false)}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                <View style={[styles.modalContainer,{backgroundColor:colors.card}]}>
                    <Text style={[styles.modalTitle,{color:colors.text}]}>
                    Añadir {foodToAdd?.food_name}
                    </Text>
                    <TouchableOpacity style={styles.optionButton} onPress={handleConfirmManual}>
                    <Ionicons name="checkmark" size={22} color="#34C759"/>
                    <Text style={[styles.optionText,{color:colors.text}]}>
                        Usar porción recomendada
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionButton} onPress={handleUseScale}>
                    <MaterialCommunityIcons name="scale" size={22} color={colors.text}/>
                    <Text style={[styles.optionText,{color:colors.text}]}>
                        Usar báscula
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>setManualModal(false)}>
                    <Text style={[styles.closeText,{color:colors.primary}]}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
                </TouchableWithoutFeedback>
            </View>
            </TouchableWithoutFeedback>
        </Modal>

        {/* Modal báscula */}
        <Modal visible={scaleModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer,{backgroundColor:colors.card}]}>
                <Text style={[styles.modalTitle,{color:colors.text}]}>
                {connected ? 'Peso actual' : 'Seleccione la báscula'}
                </Text>
                {connected
                ? <>
                    <Text style={[styles.scaleWeightText,{color:colors.primary}]}>
                        {scaleWeight!=null?`${scaleWeight} g`:'Esperando…'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.addWeightButton,{backgroundColor:colors.primary}]}
                        onPress={handleConfirmScale}
                        disabled={scaleWeight==null}
                    >
                        <Text style={styles.addWeightButtonText}>
                        Añadir {scaleWeight}g
                        </Text>
                    </TouchableOpacity>
                    </>
                : devices.length===0
                    ? <ActivityIndicator/>
                    : devices.map(dev => (
                        <TouchableOpacity
                        key={dev.id}
                        style={styles.optionButton}
                        onPress={()=>onSelectScaleDevice(dev)}
                        >
                        <Text style={[styles.optionText,{color:colors.text}]}>
                            {dev.name||dev.id}
                        </Text>
                        </TouchableOpacity>
                    ))
                }
                <TouchableOpacity onPress={()=>{
                setScaleModal(false);
                disconnect();
                }}>
                <Text style={[styles.closeText,{color:colors.primary}]}>Cancelar</Text>
                </TouchableOpacity>
            </View>
            </View>
        </Modal>
        </ScrollView>
    );
}

const createStyles = (colors:any)=>StyleSheet.create({
    container:     { flex:1, backgroundColor:colors.background, padding:20 },
    center:        { flex:1, justifyContent:'center', alignItems:'center' },
    input:         { borderWidth:1, borderColor:colors.border, borderRadius:10, padding:12, marginBottom:10, backgroundColor:colors.card, color:colors.text },
    button:        { backgroundColor:colors.primary, padding:12, borderRadius:10, marginBottom:20 },
    buttonText:    { color:'#fff', textAlign:'center', fontWeight:'bold' },
    resultItem:    { flexDirection:'row', padding:12, backgroundColor:colors.card, borderRadius:10, marginBottom:10, borderWidth:1, borderColor:colors.border },
    resultImage:   { width:40, height:40, borderRadius:6, marginRight:12 },
    resultText:    { flex:1, color:colors.text },
    modalOverlay:  { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.5)' },
    modalContainer:{ padding:20, borderTopLeftRadius:20, borderTopRightRadius:20 },
    modalTitle:    { fontSize:18, fontWeight:'bold', marginBottom:20 },
    optionButton:  { flexDirection:'row', alignItems:'center', paddingVertical:12, gap:10 },
    optionText:    { fontSize:16 },
    closeText:     { textAlign:'center', marginTop:20 },
    scaleWeightText:{ fontSize:24, textAlign:'center', fontWeight:'bold', marginVertical:20 },
    addWeightButton:{ padding:12, borderRadius:8, justifyContent:'center', marginTop:10 },
    addWeightButtonText:{ color:'#fff', textAlign:'center', fontWeight:'bold' },
});
