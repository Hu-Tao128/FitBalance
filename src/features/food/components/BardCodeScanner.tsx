import { MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';

interface BarCodeScannerProps {
    onBarCodeScanned?: (scanningResult: BarcodeScanningResult) => void;
}

export default function BarCodeScanner({ onBarCodeScanned }: BarCodeScannerProps) {
    const { t } = useTranslation();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#000',
        },
        camera: {
            flex: 1,
        },
        guideBox: {
            position: 'absolute',
            top: '30%',
            left: '10%',
            right: '10%',
            height: 120,
            borderRadius: 22,
            borderWidth: 3,
            borderColor: colors.primary,
            backgroundColor: 'rgba(255,255,255,0.05)',
            zIndex: 2,
        },
        scanMsg: {
            position: 'absolute',
            top: 70,
            width: '100%',
            textAlign: 'center',
            color: '#fff',
            fontSize: 17,
            fontWeight: '600',
            letterSpacing: 0.3,
            textShadowColor: '#000a',
            textShadowRadius: 7,
            textShadowOffset: { width: 0, height: 1 },
            zIndex: 5,
        },
        fabFlip: {
            position: 'absolute',
            bottom: 48,
            alignSelf: 'center',
            backgroundColor: colors.primary,
            borderRadius: 32,
            width: 64,
            height: 64,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOpacity: 0.21,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
            elevation: 7,
            zIndex: 12,
        },
        fabIcon: {
            color: '#fff',
        },
        message: {
            textAlign: 'center',
            padding: 22,
            color: colors.text,
            fontSize: 17,
            fontWeight: '500',
        },
        permissionBtn: {
            alignSelf: 'center',
            marginTop: 30,
            backgroundColor: colors.primary,
            borderRadius: 24,
            paddingHorizontal: 30,
            paddingVertical: 15,
        },
        permissionBtnText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: 0.2,
        },
    });

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    {t('food.permissionCameraMsg')}
                </Text>
                <TouchableOpacity
                    style={styles.permissionBtn}
                    onPress={async () => {
                        const current = await Camera.getCameraPermissionsAsync();
                        if (current.granted) {
                            return;
                        }
                        if (current.canAskAgain) {
                            await requestPermission();
                            return;
                        }
                        Alert.alert(
                            t('food.error'),
                            t('food.permissionBlockedMsg'),
                            [
                                { text: t('common.cancel'), style: 'cancel' },
                                { text: t('food.openSettings'), onPress: () => Linking.openSettings() }
                            ]
                        );
                    }}
                >
                    <Text style={styles.permissionBtnText}>{t('food.permissionGrant')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
                }}
                onBarcodeScanned={onBarCodeScanned}
            >
                {/* Botón girar cámara */}
                <TouchableOpacity
                    style={styles.fabFlip}
                    onPress={toggleCameraFacing}
                    activeOpacity={0.83}
                >
                    <MaterialIcons name="flip-camera-android" size={32} style={styles.fabIcon} />
                </TouchableOpacity>
            </CameraView>
        </View>
    );
}
