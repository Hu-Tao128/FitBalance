import { useMemo, useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleError, BleManager, Characteristic, Device } from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";
import base64 from "react-native-base64";

export function useBLEDevice(serviceUUID: string, charUUID: string) {
    const manager = useMemo(() => new BleManager(), []);
    const [devices, setDevices] = useState<Device[]>([]);
    const [connected, setConnected] = useState<Device | null>(null);
    const [dataValue, setDataValue] = useState<number | null>(null); // en gramos

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

    function scan() {
        setDevices([]);
        manager.startDeviceScan([serviceUUID], null, (error, device) => {
        if (error) {
            console.warn(error);
            return;
        }
        if (device) {
            setDevices((prev) =>
            prev.some((d) => d.id === device.id) ? prev : [...prev, device]
            );
        }
        });
    }

    async function connect(deviceOrId: Device | string) {
        try {
        const id = typeof deviceOrId === "string" ? deviceOrId : deviceOrId.id;
        const conn = await manager.connectToDevice(id);
        setConnected(conn);
        await conn.discoverAllServicesAndCharacteristics();
        manager.stopDeviceScan();
        conn.monitorCharacteristicForService(serviceUUID, charUUID, onUpdate);
        } catch (e) {
        console.error("Error conectando:", e);
        }
    }

    function disconnect() {
        if (!connected) return;
        manager.cancelDeviceConnection(connected.id);
        setConnected(null);
        setDataValue(null);
    }

    function onUpdate(error: BleError | null, ch: Characteristic | null) {
        if (error || !ch?.value) return console.warn(error || "No data");
        const raw = base64.decode(ch.value);
        const weight = parseInt(raw, 10);
        if (!isNaN(weight)) setDataValue(weight);
    }

    // === Limpieza automática al desmontar ===
    useEffect(() => {
        return () => {
        manager.stopDeviceScan();
        if (connected) manager.cancelDeviceConnection(connected.id);
        };
    }, [manager, connected]);

    return { requestPermissions, scan, connect, disconnect, devices, connected, dataValue };
    }