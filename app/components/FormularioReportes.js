import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import ReportService from "../../lib/patrones/ReportService";
import ModalMensaje from "./ModalMensaje";
import { useAdmin } from "../../lib/context/AdminContext";
import { COLORS } from "../../lib/theme/colors";

// react-native-maps no está disponible en web
// Se carga dinámicamente solo en plataformas nativas
let MapView = null;
let Marker = null;

export default function FormularioReportes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { usuarioName, logout } = useAdmin();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ]
    );
  };

  const [tipoIncidente, setTipoIncidente] = useState("urgente");
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ubicacion, setUbicacion] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState("exito");
  const [modalTitulo, setModalTitulo] = useState("");
  const [modalMensaje, setModalMensaje] = useState("");
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const [subiendoArchivos, setSubiendoArchivos] = useState(false);

  useEffect(() => {
    obtenerUbicacionActual();
    
    // Cargar react-native-maps solo en plataformas nativas
    if (Platform.OS !== "web" && !MapView && !Marker) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Maps = require("react-native-maps");
        MapView = Maps.MapView;
        Marker = Maps.Marker;
      } catch (error) {
        console.warn("react-native-maps no disponible:", error);
      }
    }
  }, []);

  const tiposIncidente = useMemo(
    () => [
      { id: "urgente", label: "Urgente" },
      { id: "importante", label: "Importante" },
      { id: "informativo", label: "Informativo" },
    ],
    []
  );

  const obtenerUbicacionActual = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUbicacion({ lat: latitude, lng: longitude });
        return;
      }
    } catch {
      // ignore
    }
    // fallback Tarija
    setUbicacion({ lat: -21.5329, lng: -64.7294 });
  };

  const handleConfirmarUbicacion = async () => {
    if (!ubicacion.lat || !ubicacion.lng) {
      Alert.alert("📍 Ubicación Requerida", "Por favor, selecciona tu ubicación.", [
        { text: "Entendido" },
      ]);
      return;
    }

    setUbicacionConfirmada(true);
    Alert.alert(
      "✅ Ubicación Confirmada",
      `Tu ubicación ha sido registrada correctamente.\n\nCoordenadas: ${ubicacion.lat.toFixed(
        4
      )}, ${ubicacion.lng.toFixed(4)}`,
      [{ text: "Continuar" }]
    );
  };

  const handleSubirArchivos = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permisos",
          "Necesitamos acceso a tu galería para seleccionar imágenes."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        quality: 0.8,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets) {
        const imagenesActuales = archivosSeleccionados.filter(
          (a) => a.type === "image"
        ).length;
        const videosActuales = archivosSeleccionados.filter(
          (a) => a.type === "video"
        ).length;

        const nuevasImagenes = result.assets.filter((a) => a.type === "image")
          .length;
        const nuevosVideos = result.assets.filter((a) => a.type === "video")
          .length;

        if (imagenesActuales + nuevasImagenes > 3) {
          Alert.alert("Límite excedido", "Solo puedes subir máximo 3 imágenes");
          return;
        }

        if (videosActuales + nuevosVideos > 1) {
          Alert.alert("Límite excedido", "Solo puedes subir máximo 1 video");
          return;
        }

        const archivos = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type === "video" ? "video" : "image",
          fileName:
            asset.fileName ||
            `file-${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
          size: asset.fileSize,
        }));

        setArchivosSeleccionados([...archivosSeleccionados, ...archivos]);
      }
    } catch (error) {
      console.error("Error al seleccionar archivos:", error);
      Alert.alert("Error", "No se pudieron seleccionar los archivos");
    }
  };

  const handleEnviar = () => {
    if (!ubicacionConfirmada) {
      Alert.alert(
        "📍 Ubicación Requerida",
        "Para enviar el reporte, por favor confirma tu ubicación primero.",
        [{ text: "Entendido" }]
      );
      return;
    }

    setLoading(true);
    setSubiendoArchivos(true);

    const data = {
      tipo_incidente:
        tipoIncidente.charAt(0).toUpperCase() + tipoIncidente.slice(1),
      latitud: ubicacion.lat,
      longitud: ubicacion.lng,
      ubicacion_confirmada: true,
    };

    const archivos =
      archivosSeleccionados.length > 0
        ? archivosSeleccionados.map((a) => ({
            uri: a.uri,
            type: a.type,
            fileName: a.fileName || `archivo.${a.type === "image" ? "jpg" : "mp4"}`,
          }))
        : [];

    ReportService.crearReporteCompleto(data, archivos)
      .then(() => {
        setModalTipo("exito");
        setModalTitulo("Reporte Registrado");
        setModalMensaje(
          "Tu reporte ha sido enviado exitosamente. Las autoridades tomarán acción lo más pronto posible.\n\nGracias por contribuir a la seguridad de Tarija."
        );
        setModalVisible(true);
      })
      .catch((error) => {
        console.error("Error al enviar reporte:", error);
        setModalTipo("error");
        setModalTitulo("Error al Enviar");
        setModalMensaje(
          "No se pudo enviar tu reporte. Por favor, verifica tu conexión a internet e inténtalo de nuevo."
        );
        setModalVisible(true);
      })
      .finally(() => {
        setLoading(false);
        setSubiendoArchivos(false);
      });
  };

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          paddingTop: Math.max(insets.top, 40),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Gestor de Reportes</Text>
            <Text style={styles.headerSubtitle}>Tarija</Text>
            {usuarioName ? (
              <Text style={styles.headerUser}>Usuario: {usuarioName}</Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "android" ? 40 : 20 },
        ]}
      >
        <View style={styles.body}>
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Paso 1: ¿Qué tipo de incidente es?</Text>
            <View style={styles.gap12}>
              {tiposIncidente.map((tipo) => (
                <TouchableOpacity
                  key={tipo.id}
                  style={styles.radioRow}
                  onPress={() => setTipoIncidente(tipo.id)}
                >
                  <View style={styles.radioOuter}>
                    <View
                      style={[
                        styles.radioDot,
                        tipoIncidente === tipo.id
                          ? styles.radioDotOn
                          : styles.radioDotOff,
                      ]}
                    />
                  </View>
                  <Text style={styles.radioLabel}>{tipo.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepTitle}>Paso 2: Confirma tu ubicación</Text>

            <View style={styles.mapFrame}>
              {ubicacion.lat && ubicacion.lng && MapView && Marker ? (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: ubicacion.lat,
                    longitude: ubicacion.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  region={{
                    latitude: ubicacion.lat,
                    longitude: ubicacion.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled
                  zoomEnabled
                >
                  <Marker
                    draggable
                    coordinate={{
                      latitude: ubicacion.lat,
                      longitude: ubicacion.lng,
                    }}
                    onDragEnd={(e) => {
                      const coordinate = e.nativeEvent.coordinate;
                      setUbicacion({ lat: coordinate.latitude, lng: coordinate.longitude });
                    }}
                    title="Ubicación del reporte"
                    description="Arrastra el marcador para ajustar"
                  />
                </MapView>
              ) : (
                <View style={styles.mapFallback}>
                  {ubicacion.lat && ubicacion.lng ? (
                    <View>
                      <Text style={styles.mapFallbackText}>Ubicación seleccionada:</Text>
                      <Text style={styles.mapFallbackText}>
                        Lat: {ubicacion.lat.toFixed(4)}
                      </Text>
                      <Text style={styles.mapFallbackText}>
                        Lng: {ubicacion.lng.toFixed(4)}
                      </Text>
                      <TouchableOpacity
                        style={styles.updateLocationButton}
                        onPress={obtenerUbicacionActual}
                      >
                        <Text style={styles.updateLocationButtonText}>
                          Actualizar ubicación
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <ActivityIndicator size="large" color={COLORS.azulClaro} />
                      <Text style={styles.mapFallbackText}>Cargando ubicación...</Text>
                    </>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: ubicacionConfirmada ? COLORS.verde : COLORS.azulClaro },
              ]}
              onPress={handleConfirmarUbicacion}
            >
              <Text style={styles.confirmButtonText}>
                {ubicacionConfirmada ? "Ubicación Confirmada" : "Confirmar Ubicación"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepTitle}>Paso 3: Subir archivos adjuntos</Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleSubirArchivos}
            >
              <Text style={styles.uploadButtonText}>
                {subiendoArchivos ? "SUBIR ARCHIVOS..." : "SUBIR ARCHIVOS"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.helpText}>
              Máx. 3 imágenes (5 MB c/u){"\n"}1 video de hasta 30 s (20 MB)
            </Text>

            {archivosSeleccionados.length > 0 && (
              <View style={styles.filesBlock}>
                <Text style={styles.filesTitle}>
                  Archivos seleccionados ({archivosSeleccionados.length}):
                </Text>
                {archivosSeleccionados.map((archivo, index) => (
                  <View key={index} style={styles.fileRow}>
                    <View style={styles.fileLeft}>
                      {archivo.type === "image" ? (
                        <Image source={{ uri: archivo.uri }} style={styles.preview} />
                      ) : (
                        <View style={styles.videoPreview}>
                          <Text style={styles.videoPreviewText}>VID</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        setArchivosSeleccionados(
                          archivosSeleccionados.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.sendRow}>
            <TouchableOpacity
              style={[styles.sendButton, loading && styles.buttonDisabled]}
              onPress={handleEnviar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.blanco} />
              ) : (
                <Text style={styles.sendButtonText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ModalMensaje
        visible={modalVisible}
        tipo={modalTipo}
        titulo={modalTitulo}
        mensaje={modalMensaje}
        onClose={() => {
          setModalVisible(false);
          if (modalTipo === "exito") router.replace("/usuario");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.azulOscuro },
  header: {
    backgroundColor: COLORS.azulClaro,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.negro,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.negro,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    color: COLORS.negro,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
    opacity: 0.85,
  },
  headerUser: {
    color: COLORS.negro,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    opacity: 0.85,
  },
  logoutButton: {
    backgroundColor: COLORS.rojo,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginLeft: 12,
    shadowColor: COLORS.negro,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  logoutButtonText: {
    color: COLORS.blanco,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  scrollContent: { flexGrow: 1, paddingTop: 24 },
  body: { flex: 1, backgroundColor: COLORS.azulOscuro, padding: 24 },
  step: { marginBottom: 32 },
  stepTitle: {
    color: COLORS.blanco,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  gap12: { gap: 16 },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioOuter: { marginRight: 16 },
  radioDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
  },
  radioDotOn: {
    backgroundColor: COLORS.azulClaro,
    borderColor: COLORS.azulClaro,
    shadowColor: COLORS.azulClaro,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  radioDotOff: {
    backgroundColor: "transparent",
    borderColor: COLORS.azulClaro,
  },
  radioLabel: {
    color: COLORS.blanco,
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  mapFrame: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2.5,
    borderColor: COLORS.azulClaro,
    marginBottom: 18,
    shadowColor: COLORS.negro,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  map: { height: 300, width: "100%" },
  mapFallback: {
    height: 300,
    backgroundColor: COLORS.azulMedio,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  mapFallbackText: {
    color: COLORS.blanco,
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },
  updateLocationButton: {
    backgroundColor: COLORS.azulClaro,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
    shadowColor: COLORS.negro,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  updateLocationButtonText: {
    color: COLORS.blanco,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  confirmButton: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  confirmButtonText: {
    color: COLORS.blanco,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  uploadButton: {
    backgroundColor: COLORS.blanco,
    borderWidth: 3,
    borderColor: COLORS.azulClaro,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: COLORS.negro,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  uploadButtonText: {
    color: COLORS.negro,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  helpText: {
    color: COLORS.blanco,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.9,
  },
  filesBlock: { marginTop: 18 },
  filesTitle: {
    color: COLORS.blanco,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.azulMedio,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(102,178,255,0.2)",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fileLeft: { flexDirection: "row", alignItems: "center" },
  preview: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  videoPreview: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#0F3A55",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  videoPreviewText: {
    color: COLORS.blanco,
    fontSize: 20,
    fontWeight: "900",
  },
  removeButton: {
    backgroundColor: COLORS.rojo,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  removeButtonText: {
    color: COLORS.blanco,
    fontSize: 22,
    fontWeight: "900",
  },
  sendRow: { marginTop: 16, marginBottom: 16, alignItems: "center" },
  sendButton: {
    backgroundColor: COLORS.naranja,
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 56,
    minWidth: 220,
    alignItems: "center",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  sendButtonText: {
    color: COLORS.blanco,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  buttonDisabled: { opacity: 0.6 },
});

