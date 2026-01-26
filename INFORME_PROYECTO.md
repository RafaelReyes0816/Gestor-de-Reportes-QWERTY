# INFORME TÉCNICO DEL PROYECTO
## Sistema de Gestión de Reportes de Disturbios - Tarija

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### Título del Proyecto
**Sistema de Gestión de Reportes de Disturbios para Tarija**

### Problema Identificado
En la ciudad de Tarija, la gestión de reportes de disturbios e incidentes presenta las siguientes dificultades:

- Falta de un sistema centralizado y accesible para que los ciudadanos reporten incidentes de manera eficiente
- Dificultad para geolocalizar con precisión los eventos reportados
- Ausencia de un mecanismo que permita a los ciudadanos reportar incidentes de forma rápida y sencilla desde dispositivos móviles
- Limitaciones en el seguimiento y gestión de reportes por parte de las autoridades
- Falta de un historial organizado de reportes que permita análisis temporal y geográfico
- Dificultad para adjuntar evidencia multimedia (fotos y videos) a los reportes
- No existe un sistema que permita a los administradores gestionar y dar seguimiento a múltiples reportes de manera eficiente

### Solución Propuesta
Aplicación móvil multiplataforma desarrollada con React Native y Expo que permite:

- Registro rápido de incidentes con geolocalización automática mediante GPS del dispositivo
- Sistema de roles diferenciados: Usuario (acceso directo) y Administrador (acceso con código)
- Gestión completa de reportes con estados: Pendiente, En Proceso, Resuelto, Cancelado
- Historial de reportes organizado por mes para usuarios
- Panel administrativo completo para visualización, filtrado y gestión de todos los reportes
- Adjuntar archivos multimedia (fotos y videos) como evidencia de los incidentes
- Interfaz moderna e intuitiva optimizada para dispositivos móviles usando React Native StyleSheet
- Actualización automática de datos cuando se realizan cambios en el estado de los reportes

---

## 2. OBJETIVOS

### Objetivo General
Desarrollar una aplicación móvil multiplataforma que permita a los ciudadanos de Tarija reportar disturbios e incidentes de manera eficiente desde sus dispositivos móviles, y a los administradores gestionar y dar seguimiento a estos reportes, mejorando la comunicación entre la ciudadanía y las autoridades mediante un sistema digital moderno.

### Objetivos Específicos
1. Implementar un sistema de autenticación con roles diferenciados (Usuario y Administrador) con acceso diferenciado
2. Desarrollar un formulario completo de reportes con geolocalización automática y selección manual de ubicación mediante mapa interactivo
3. Crear un módulo de gestión administrativa para visualizar, filtrar y actualizar el estado de los reportes
4. Implementar un sistema de almacenamiento de archivos multimedia (fotos y videos) asociados a los reportes
5. Desarrollar un historial de reportes organizado por mes para que los usuarios puedan consultar sus reportes anteriores
6. Integrar un dashboard administrativo con estadísticas en tiempo real y filtros avanzados por estado y tipo de incidente
7. Diseñar una interfaz de usuario moderna y responsiva utilizando exclusivamente React Native StyleSheet, sin librerías externas de estilos
8. Implementar actualización automática de datos para mejorar la experiencia del usuario

---

## 3. ALCANCE DEL PROYECTO

### Funcionalidades Incluidas

#### Para Usuarios:
- **Pantalla de Login Principal**: Selección de modo de acceso (Usuario o Administrador)
- **Autenticación de Usuario**: Acceso directo sin código (usuario: Samuel)
- **Pantalla de Inicio**: 
  - Visualización de información del usuario
  - Botón de "Reporte Rápido" para crear reportes urgentes con geolocalización automática
  - Acceso a formulario completo de reportes
  - Acceso a historial de reportes
  - Botón de cerrar sesión
- **Formulario de Reportes Completo**: 
  - Paso 1: Selección de tipo de incidente (Urgente, Importante, Informativo)
  - Paso 2: Confirmación de ubicación mediante mapa interactivo con geolocalización automática o selección manual
  - Paso 3: Descripción detallada del incidente (opcional)
  - Paso 4: Adjuntar múltiples archivos multimedia (fotos y videos) con previsualización
  - Confirmación y envío del reporte
- **Historial de Reportes**: 
  - Selector de mes (últimos 12 meses)
  - Visualización de reportes del mes seleccionado
  - Información de cada reporte: tipo, estado, fecha, dirección
  - Badges visuales para identificar el estado del reporte
- **Cerrar Sesión**: Función de logout con confirmación mediante Alert

#### Para Administradores:
- **Autenticación de Administrador**: Acceso mediante código único (ADMIN2024) - Usuario: Rafael Reyes
- **Dashboard Administrativo**: 
  - Estadísticas generales en tiempo real:
    - Total de reportes
    - Reportes Pendientes
    - Reportes En Proceso
    - Reportes Resueltos
  - Lista completa de todos los reportes del sistema
  - Filtros avanzados:
    - Por estado (Pendiente, En Proceso, Resuelto, Cancelado)
    - Por tipo de incidente (Urgente, Importante, Informativo)
    - Botón para limpiar filtros
  - Búsqueda y visualización de reportes
  - Actualización automática al volver a la pantalla
- **Gestión Detallada de Reportes**: 
  - Visualización completa de cada reporte individual
  - Información detallada: tipo, estado, fecha, ubicación (coordenadas y dirección), descripción
  - Cambio de estado del reporte mediante selector
  - Agregar notas administrativas
  - Visualización de archivos adjuntos (fotos y videos) en grid
  - Información del administrador asignado
  - Actualización automática después de cambios
- **Cerrar Sesión**: Función de logout con confirmación mediante Alert

### Funcionalidades NO Incluidas (Fuera de Alcance)
- Sistema de notificaciones push en tiempo real
- Chat o comunicación directa entre usuarios y administradores
- Sistema de calificaciones o feedback sobre la resolución de reportes
- Múltiples administradores con permisos diferenciados (solo un código de administrador)
- Exportación de reportes a formatos externos (PDF, Excel)
- Integración con sistemas externos o APIs de terceros
- Modo offline completo (funciona principalmente con conexión a internet)
- Sistema de registro de nuevos usuarios (usuarios predefinidos)
- Recuperación de contraseña o cambio de credenciales
- Sistema de comentarios o seguimiento de conversaciones sobre reportes

---

## 4. TECNOLOGÍAS UTILIZADAS

### Stack Tecnológico

#### Frontend Móvil:
- **React Native 0.81.5**: Framework para desarrollo móvil multiplataforma
- **Expo SDK 54.0.32**: Plataforma para desarrollo y despliegue de aplicaciones React Native
- **Expo Router 6.0.21**: Sistema de navegación basado en archivos (file-based routing)
- **React 19.1.0**: Biblioteca principal para construcción de interfaces de usuario

#### Backend y Base de Datos:
- **Supabase**: Backend-as-a-Service (BaaS) completo
  - **PostgreSQL**: Base de datos relacional
  - **Row Level Security (RLS)**: Políticas de seguridad a nivel de fila para control de acceso
  - **Supabase Storage**: Almacenamiento de archivos multimedia (fotos y videos)
  - **REST API**: API RESTful para operaciones CRUD sobre reportes y archivos

#### Librerías Principales:
- `expo-router`: Navegación basada en archivos
- `react-native-maps`: Mapas interactivos (solo nativo)
- `expo-location`: Geolocalización GPS
- `expo-image-picker`: Selección de archivos multimedia
- `@react-native-async-storage/async-storage`: Almacenamiento local persistente
- `@supabase/supabase-js`: Cliente Supabase
- `react-native-safe-area-context`: Manejo de áreas seguras
- `react-native-reanimated`: Animaciones fluidas
- `@expo/vector-icons`: Iconos

#### Estilos:
- **React Native StyleSheet**: Sistema de estilos nativo (sin librerías externas como NativeWind, TailwindCSS o Styled Components)
- **Paleta de Colores Centralizada**: Archivo `lib/theme/colors.js` con constantes de colores

---

## 5. ARQUITECTURA DE LA APLICACIÓN

### Estructura de Carpetas
```
/app
  /admin                    # Rutas administrativas
    /dashboard.js           # Panel principal de administración
    /reporte/[id].js        # Detalle de reporte individual (ruta dinámica)
    /_layout.js             # Layout de navegación stack para admin
  /usuario                  # Rutas de usuario
    /index.js               # Pantalla de inicio del usuario
    /formulario.js          # Formulario completo de reportes
    /historial.js           # Historial de reportes por mes
    /_layout.js             # Layout de navegación tabs para usuario
  /components               # Componentes reutilizables
    /admin                  # Componentes administrativos
      /DashboardAdmin.js    # Componente del dashboard
      /DetalleReporteAdmin.js # Componente de detalle de reporte
    /LoginPrincipal.js      # Pantalla de login principal
    /Inicio.js              # Pantalla de inicio usuario
    /FormularioReportes.js  # Formulario de reportes
    /HistorialReportes.js   # Historial de reportes
    /ModalMensaje.js        # Modal de mensajes (éxito/error)
  /_layout.js               # Layout principal con AdminProvider

/lib
  /context
    /AdminContext.js        # Context API para gestión de autenticación y sesión
  /patrones                 # Patrones de diseño implementados
    /ReportService.js       # Singleton para operaciones de reportes
    /FormState.js           # State pattern para formularios
    /Implementación.md      # Documentación de patrones
  /supabase.js              # Cliente Supabase configurado
  /supabase-helpers.js      # Funciones helper para operaciones con Supabase
  /theme
    /colors.js              # Paleta de colores centralizada
```

### Flujo de Usuarios

#### Flujo Usuario (Samuel):
1. **Login Principal**: Selección de modo "Usuario" → Acceso directo (sin código)
2. **Pantalla de Inicio**: 
   - Visualización de opciones principales
   - Botón "Reporte Rápido" para reportes urgentes
   - Botón "Formulario" para reportes completos
   - Botón "Historial" para ver reportes anteriores
3. **Crear Reporte Completo**:
   - Paso 1: Selección de tipo de incidente
   - Paso 2: Confirmación de ubicación (automática o manual en mapa)
   - Paso 3: Descripción del incidente (opcional)
   - Paso 4: Adjuntar archivos multimedia
   - Envío del reporte → Redirección a inicio
4. **Historial**: Selección de mes → Visualización de reportes del mes seleccionado

#### Flujo Administrador (Rafael Reyes):
1. **Login Principal**: Selección de modo "Admin" → Ingreso de código "ADMIN2024" → Validación
2. **Dashboard Administrativo**: 
   - Visualización de estadísticas en tiempo real
   - Lista de todos los reportes
   - Aplicación de filtros por estado y tipo
3. **Detalle de Reporte**:
   - Visualización completa del reporte
   - Cambio de estado mediante selector
   - Agregar notas administrativas
   - Visualización de archivos adjuntos
   - Actualización automática después de cambios

---

**Desarrollado por: JRRB**
**Fecha: 2024**
**Proyecto Académico - Aplicaciones Móviles I**
