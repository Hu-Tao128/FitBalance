# Plan de Implementación: Internacionalización (Español/Inglés)

Este documento detalla la estrategia para incorporar soporte bilingüe en el proyecto **FitBalance** (React Native/Expo).

## 1. Librerías Seleccionadas
A diferencia de Flutter (`l10n`), en el ecosistema React Native utilizaremos el stack más robusto y escalable:
- **`i18next`**: El núcleo para la gestión de traducciones.
- **`react-i18next`**: Hooks y componentes para integrar i18next con React.
- **`expo-localization`**: Para acceder a la configuración regional del dispositivo.
- **`@react-native-async-storage/async-storage`**: Para persistir la preferencia de idioma del usuario (ya presente en el proyecto).

## 2. Estructura de Archivos Propuesta
Se creará un directorio centralizado para las traducciones dentro de `src/`:

```text
src/
└── i18n/
    ├── locales/
    │   ├── en.json       # Traducciones al Inglés
    │   └── es.json       # Traducciones al Español
    └── index.ts          # Configuración de i18next
```

## 3. Fases del Plan

### Fase 1: Configuración Inicial
1. Instalación de dependencias: `i18next`, `react-i18next` y `expo-localization`.
2. Creación de archivos JSON base (`es.json`, `en.json`) con las primeras claves de prueba.
3. Configuración del archivo `index.ts` para inicializar el motor con detección automática del sistema.

### Fase 2: Integración en la App
1. Envolver la aplicación en el `I18nextProvider` o importar la configuración directamente en `App.tsx` / `index.ts`.
2. Implementar la persistencia: Al cambiar de idioma, se guardará en `AsyncStorage` para que la App lo recuerde en el próximo inicio.

### Fase 3: Refactorización de Componentes (Extracción de Texto)
Este es el paso más laborioso. Se debe reemplazar cada string estático en la UI por el hook `useTranslation`:

**Ejemplo de cambio:**
- Antes: `<Text>Bienvenido</Text>`
- Después: `<Text>{t('welcome')}</Text>`

Se priorizarán las siguientes áreas:
1. **Navegación**: Nombres de pestañas y headers en `src/navigation/`.
2. **Auth**: Pantallas de Login/Registro en `src/features/auth/`.
3. **Dashboard**: Widgets y estadísticas.
4. **Settings**: Crear un selector de idioma para el usuario.

### Fase 4: Tipado y Validaciones
1. Configurar TypeScript para que las claves de traducción tengan autocompletado, evitando errores de dedo (typos).
2. Asegurar que las fechas y números (usando `luxon` que ya está en el proyecto) se formateen según el idioma seleccionado.

## 4. Consideraciones Técnicas
- **Pluralización**: i18next maneja nativamente reglas de plurales (ej: "1 notificación" vs "5 notificaciones").
- **Interpolación**: Soporte para variables dentro de las traducciones (ej: "Hola, {{name}}").
- **RTL (Derecha a Izquierda)**: Aunque el plan actual es ES/EN, esta estructura permite añadir idiomas como el Árabe en el futuro con mínimo esfuerzo.

## 5. Próximos Pasos (Directivas)
Una vez aprobado este plan, los comandos necesarios serán:
1. `npx expo install i18next react-i18next expo-localization`
2. Creación de la estructura de carpetas `src/i18n/`.
