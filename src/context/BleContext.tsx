import React, { createContext, useContext, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, Characteristic, BleError } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import * as ExpoDevice from "expo-device";
import { SERVICE_UUID, CHAR_UUID } from '../config/bluetooth';

interface BleContextType {
    manager: BleManager;
    devices: Device[];
    connectedDevice: Device | null;
    weight: number | null;
    scanDevices: () => void;
    connectDevice: (device: Device) => Promise<void>;
    disconnectDevice: () => void;
    requestPermissions: () => Promise<boolean>;
}

const BleContext = createContext<BleContextType | undefined>(undefined);

export const BleProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [manager] = useState(() => new BleManager());
    const [devices, setDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [weight, setWeight] = useState<number | null>(null);

    type BLERationale = {
        title: string;
        message: string;
        buttonPositive: string;
        buttonNegative?: string;
        buttonNeutral?: string;
    };
    
    const rationale: BLERationale = {
        title: "Permiso de Ubicación",
        message: "Bluetooth Low Energy necesita permiso de ubicación para escanear dispositivos",
        buttonPositive: "Aceptar",
        buttonNegative: "Cancelar",
        buttonNeutral: "Preguntar luego",
    };

    async function requestAndroidLegacy() {
        const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        rationale
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    async function requestAndroid31Permissions() {
        const scan = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        rationale
        );
        const connect = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        rationale
        );
        const fineLoc = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        rationale
        );
        return (
        scan === PermissionsAndroid.RESULTS.GRANTED &&
        connect === PermissionsAndroid.RESULTS.GRANTED &&
        fineLoc === PermissionsAndroid.RESULTS.GRANTED
        );
    }

    async function requestPermissions() {
        if (Platform.OS === "android") {
        if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
            return await requestAndroidLegacy();
        } else {
            return await requestAndroid31Permissions();
        }
        }
        return true;
    }
    
    const scanDevices = () => {
        setDevices([]);
        manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
            console.warn(error);
            return;
        }
        if (device) {
            setDevices(prev => 
            prev.some(d => d.id === device.id) ? prev : [...prev, device]
            );
        }
        });
    };

    const connectDevice = async (device: Device) => {
        try {
        const connected = await manager.connectToDevice(device.id);
        setConnectedDevice(connected);
        await connected.discoverAllServicesAndCharacteristics();
        manager.stopDeviceScan();
        
        connected.monitorCharacteristicForService(
            SERVICE_UUID, 
            CHAR_UUID, 
            (error, characteristic) => {
            if (error || !characteristic?.value) return;
            const raw = base64.decode(characteristic.value);
            const weightValue = parseInt(raw, 10);
            if (!isNaN(weightValue)) setWeight(weightValue);
            }
        );
        } catch (error) {
        console.error('Connection error:', error);
        }
    };

    const disconnectDevice = () => {
        if (connectedDevice) {
        manager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
        setWeight(null);
        }
    };

    // Implementa requestPermissions como en tu hook actual

    useEffect(() => {
        return () => {
        manager.stopDeviceScan();
        if (connectedDevice) {
            manager.cancelDeviceConnection(connectedDevice.id);
        }
        };
    }, [manager, connectedDevice]);

    return (
        <BleContext.Provider value={{
        manager,
        devices,
        connectedDevice,
        weight,
        scanDevices,
        connectDevice,
        disconnectDevice,
        requestPermissions
        }}>
        {children}
        </BleContext.Provider>
    );
};

export const useBle = () => {
    const context = useContext(BleContext);
    if (!context) {
        throw new Error('useBle must be used within a BleProvider');
    }
    return context;
};