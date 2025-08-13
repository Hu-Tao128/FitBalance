# FitBalance 🍏📊

**FitBalance** es una aplicación móvil que ayuda a registrar y analizar alimentos de manera práctica. Permite buscar productos por texto, escanear códigos de barras y crear comidas personalizadas que se almacenan localmente. Además, integra dispositivos IoT mediante Bluetooth para ofrecer una experiencia interactiva.

---

## 📸 Capturas de pantalla

Incluye imágenes representativas del flujo principal de la app:

| Flujo | Captura |
| --- | --- |
| Pantalla de inicio o dashboard | <a href="https://github.com/user-attachments/assets/27f719ff-f15d-41c1-bf61-3333e5ec2dad"><img width="280" alt="Dashboard" src="https://github.com/user-attachments/assets/27f719ff-f15d-41c1-bf61-3333e5ec2dad" /></a> |
| Búsqueda de alimentos por texto | <a href="https://github.com/user-attachments/assets/a1ef3b95-f54b-4e10-8ff7-56263527032d"><img width="280" alt="Búsqueda por texto" src="https://github.com/user-attachments/assets/a1ef3b95-f54b-4e10-8ff7-56263527032d" /></a> |
| Información de alimentos (texto) | <a href="https://github.com/user-attachments/assets/acc2853d-5459-4da3-82f6-b62ebd690718"><img width="280" alt="Resultados por texto" src="https://github.com/user-attachments/assets/acc2853d-5459-4da3-82f6-b62ebd690718" /></a> |
| Escáner de código de barras | <a href="https://github.com/user-attachments/assets/d0f82e2b-a141-47d5-aad2-4a32f569cead"><img width="280" alt="Escáner" src="https://github.com/user-attachments/assets/d0f82e2b-a141-47d5-aad2-4a32f569cead" /></a> |
| Información de escaneos | <a href="https://github.com/user-attachments/assets/f4e611e2-b420-46d0-9266-66e49abc33ae"><img width="280" alt="Detalle escaneo" src="https://github.com/user-attachments/assets/f4e611e2-b420-46d0-9266-66e49abc33ae" /></a> |
| Creación de comidas personalizadas | <a href="https://github.com/user-attachments/assets/d6de2108-c812-43d0-aa40-8f9cc851b848"><img width="280" alt="Comidas personalizadas" src="https://github.com/user-attachments/assets/d6de2108-c812-43d0-aa40-8f9cc851b848" /></a> |
| Conexión Bluetooth | <a href="https://github.com/user-attachments/assets/f5f4a53f-7505-499a-a46e-5aa90f176fe4"><img width="280" alt="Bluetooth" src="https://github.com/user-attachments/assets/f5f4a53f-7505-499a-a46e-5aa90f176fe4" /></a> |
| Historial semanal (con datos) | <a href="https://github.com/user-attachments/assets/1cdae628-d6b0-4fc8-88c7-af275d1d507b"><img width="280" alt="Historial semanal con datos" src="https://github.com/user-attachments/assets/1cdae628-d6b0-4fc8-88c7-af275d1d507b" /></a> |
| Historial semanal vacío | <a href="https://github.com/user-attachments/assets/130442af-4c0d-4bba-8d3f-665f3ff9b144"><img width="280" alt="Historial semanal vacío" src="https://github.com/user-attachments/assets/130442af-4c0d-4bba-8d3f-665f3ff9b144" /></a> |
| Historial diario | <a href="https://github.com/user-attachments/assets/052e8595-9261-4adc-82f5-d7b5f5364b11"><img width="280" alt="Historial diario" src="https://github.com/user-attachments/assets/052e8595-9261-4adc-82f5-d7b5f5364b11" /></a> |
| Notificaciones | <a href="https://github.com/user-attachments/assets/b34b6680-9503-4379-8660-1038afc2c1a9"><img width="280" alt="Notificaciones" src="https://github.com/user-attachments/assets/b34b6680-9503-4379-8660-1038afc2c1a9" /></a> |


---

## 🚀 Instalación

```bash
# 1️⃣ Clona el repositorio
git clone https://github.com/tu_usuario/FitBalance.git
cd FitBalance

# 2️⃣ Instala dependencias
yarn install

# 4️⃣ Corre la app en modo desarrollo
yarn start   # Abre Expo DevTools
```

### Generar APK de producción

```bash
cd android
./gradlew assembleRelease
```

El APK resultante se encontrará en `android/app/build/outputs/apk/release/`.

---

## 🛠️ Tecnologías utilizadas

| **Categoría**                 | **Stack / Librerías**                               |
| ----------------------------- | --------------------------------------------------- |
| Front‑end móvil               | React Native (Expo) · TypeScript                    |
| Estado y almacenamiento local | Context API · AsyncStorage                          |
| Comunicación con APIs         | Axios                                               |
| Integración IoT               | react-native-ble-plx (Bluetooth Low Energy)         |
| Funcionalidades extra         | Expo Camera · Expo Notifications · React Navigation |
| Backend (opcional)            | Node.js · Express (repo `fitbalance-backend`)       |

---

## ✨ Funcionalidades principales

* 🔍 **Búsqueda de alimentos por texto**: Consume una API externa (p. ej. Nutritionix) para obtener datos nutricionales.
* 📷 **Escaneo por código de barras**: Usa la cámara del dispositivo para leer códigos y buscar información nutricional.
* 🍱 **Base de datos local**: Crea y almacena comidas personalizadas mediante AsyncStorage.
* 📶 **Integración IoT**: Conexión Bluetooth con dispositivos externos (balanzas, medidores, etc.) para sincronizar información en tiempo real.
* 📈 **Estadísticas y gráficas** diarias/semanales para visualizar tu progreso.
* 🌙 **Modo oscuro** manual desde ajustes.

---

## 🤝 Contribuciones

1. Haz un *fork* del repositorio.
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`.
3. Realiza tus cambios y genera un *commit* descriptivo.
4. Abre un *Pull Request* y describe tu aporte.

¡Se agradecen reportes de bugs, mejoras de rendimiento y nuevas ideas! ✨

---

## 📄 Licencia

Distribuido bajo licencia **0BSD** (libre, sin restricciones). Consulta el archivo [LICENSE](LICENSE) para más información.

---
