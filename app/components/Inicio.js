import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import ReportService from "../../lib/patrones/ReportService";
import ModalMensaje from "./ModalMensaje";
import { useAdmin } from "../../lib/context/AdminContext";
import { COLORS } from "../../lib/theme/colors";

export default function Inicio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { usuarioName, logout } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState("exito");
  const [modalTitulo, setModalTitulo] = useState("");
  const [modalMensaje, setModalMensaje] = useState("");

  const handleReportar = () => {
    router.push("/usuario/formulario");
  };

  const handleHistorial = () => {
    router.push("/usuario/historial");
  };

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

  const handleAccionRapida = () => {
    setLoading(true);

    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") {
          Alert.alert(
            "Permisos",
            "Se necesitan permisos de ubicación para enviar el reporte"
          );
          setLoading(false);
          return null;
        }
        return Location.getCurrentPositionAsync({});
      })
      .then((location) => {
        if (!location) return;

        const { latitude, longitude } = location.coords;

        const data = {
          tipo_incidente: "Urgente",
          latitud: latitude,
          longitud: longitude,
          ubicacion_confirmada: true,
        };

        return ReportService.crearReporteRapido(data).then(() => {
          setModalTipo("exito");
          setModalTitulo("Reporte Enviado");
          setModalMensaje(
            `Tu reporte urgente ha sido registrado exitosamente.\n\nUbicación: ${latitude.toFixed(
              4
            )}, ${longitude.toFixed(
              4
            )}\n\nGracias por reportar.`
          );
          setModalVisible(true);
        });
      })
      .catch((error) => {
        setModalTipo("error");
        setModalTitulo("Error al Enviar");
        setModalMensaje(
          "No se pudo enviar el reporte urgente. Por favor, verifica tu conexión e inténtalo de nuevo."
        );
        setModalVisible(true);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <Text style={styles.title}>Reporte Rápido</Text>

          <TouchableOpacity
            style={[styles.primaryBigButton, loading && styles.buttonDisabled]}
            onPress={handleAccionRapida}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.blanco} size="large" />
            ) : (
              <Text style={styles.primaryBigButtonText}>Reporte Rápido</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Gestionar mis reportes</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleReportar}>
              <Text style={styles.secondaryButtonText}>Reportar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleHistorial}
            >
              <Text style={styles.outlineButtonText}>Historial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ModalMensaje
        visible={modalVisible}
        tipo={modalTipo}
        titulo={modalTitulo}
        mensaje={modalMensaje}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.fondoGrisOscuro,
  },
  header: {
    backgroundColor: COLORS.reportePrincipalOscuro,
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
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.blanco,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
    opacity: 0.85,
  },
  headerUser: {
    color: COLORS.blanco, // Texto blanco para contraste con verde oscuro
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
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
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
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 24,
  },
  body: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.fondoGrisOscuro,
  },
  title: {
    color: COLORS.blanco,
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  primaryBigButton: {
    backgroundColor: COLORS.naranja,
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 24,
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryBigButtonText: {
    color: COLORS.blanco,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: COLORS.blanco,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.naranja, // Naranja que combina con verde
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  secondaryButtonText: {
    color: COLORS.blanco,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  outlineButton: {
    flex: 1,
    backgroundColor: COLORS.reportePrincipal, // Verde medio
    borderWidth: 2.5,
    borderColor: COLORS.naranja, // Naranja que combina
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  outlineButtonText: {
    color: COLORS.blanco,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  adminButton: {
    marginTop: 16,
    backgroundColor: "rgba(102,178,255,0.2)",
    borderWidth: 1,
    borderColor: COLORS.naranja, // Naranja que combina
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  adminButtonText: {
    color: COLORS.naranja,
    fontSize: 14,
    fontWeight: "600",
  },
});

