# Generar APK – Gestor de Reportes

Guía para preparar y generar el APK de Android con **EAS Build** (Expo Application Services).

---

## 1. Requisitos previos

- **Cuenta de Expo**: [expo.dev](https://expo.dev) (gratuita).
- **Node.js** y **npm** instalados.
- **Variables de Supabase** ya usadas en desarrollo (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).

---

## 2. Configuración ya preparada en el proyecto

- **`app.json`**: `android.package` = `com.gestordereportes.app`.
- **`eas.json`**: perfiles de build:
  - **`preview`**: genera un **APK** para pruebas e instalación directa.
  - **`production`**: genera un **AAB** (Android App Bundle) para Google Play.

---

## 3. Pasos para generar el APK

### 3.1 Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 3.2 Iniciar sesión en Expo

```bash
eas login
```

(Usa la misma cuenta que en expo.dev.)

### 3.3 Configurar el proyecto en EAS (solo la primera vez)

```bash
eas build:configure
```

Acepta las opciones por defecto si te las propone.

### 3.4 Definir variables de Supabase para el build

El APK necesita la URL y la clave anónima de Supabase. En EAS se configuran como **secrets**:

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://TU_PROYECTO.supabase.co" --type string
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "tu_clave_anon_aqui" --type string
```

Sustituye `TU_PROYECTO` y `tu_clave_anon_aqui` por los valores de tu proyecto en [Supabase](https://supabase.com/dashboard).

### 3.5 Lanzar el build del APK

```bash
eas build --platform android --profile preview
```

- Se sube el código a los servidores de EAS.
- Se construye el APK.
- Al terminar, en la consola y en [expo.dev](https://expo.dev) se muestra un enlace para **descargar el APK**.

---

## 4. Resumen de comandos

| Paso              | Comando                                              |
|-------------------|------------------------------------------------------|
| Instalar EAS CLI  | `npm install -g eas-cli`                             |
| Login             | `eas login`                                          |
| Configurar EAS    | `eas build:configure`                                |
| Crear secret URL  | `eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..." --type string` |
| Crear secret Key  | `eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..." --type string` |
| Generar APK       | `eas build --platform android --profile preview`     |

---

## 5. Instalar el APK en un dispositivo

1. Descarga el APK desde el enlace que te da EAS (o desde tu cuenta en expo.dev → proyecto → builds).
2. En el móvil, permite **“Instalar desde fuentes desconocidas”** (o “Instalar apps desconocidas”) para el navegador o la app desde la que descargaste el archivo.
3. Abre el archivo `.apk` y acepta la instalación.

---

## 6. Cambiar el nombre del paquete Android

Si quieres otro identificador (por ejemplo, `com.tuempresa.gestordereportes`):

1. Edita **`app.json`** y cambia `android.package`:

   ```json
   "android": {
     "package": "com.tuempresa.gestordereportes",
     ...
   }
   ```

2. Vuelve a ejecutar:

   ```bash
   eas build --platform android --profile preview
   ```

---

## 7. Build local (opcional)

Si prefieres compilar en tu máquina en vez de en la nube:

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

El APK quedará en `android/app/build/outputs/apk/release/`. Para esta ruta necesitas Android Studio y el SDK de Android instalados.

---

## 8. Límites de EAS Build (plan gratuito)

- Builds en la nube limitados al mes.
- Colas de build pueden tardar unos minutos.
- Para más builds o prioridad, existe plan de pago en [expo.dev/pricing](https://expo.dev/pricing).

Si algo falla, revisa los logs en la web de EAS o ejecutando de nuevo el comando de build y leyendo el error que indique.
