import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAdmin } from "../../lib/context/AdminContext";
import { COLORS } from "../../lib/theme/colors";
import { obtenerReportesPorRango } from "../../lib/supabase-helpers";

const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function buildMesesRecientes(cantidad = 12) {
  const añoFijo = 2026; // Año fijo para los meses - todos los meses serán de 2026
  const meses = [];
  
  // Empezar desde diciembre 2026 (mes 11) y retroceder
  // Esto asegura que todos los meses sean de 2026
  for (let i = 0; i < cantidad; i += 1) {
    let mesIndex = 11 - i; // Empezar desde diciembre (11) y retroceder
    
    // Si el mes es negativo, significa que ya pasamos todos los meses de 2026
    // En ese caso, continuamos desde diciembre hacia atrás
    if (mesIndex < 0) {
      mesIndex = 12 + mesIndex; // Ajustar al mes correspondiente
    }
    
    const year = añoFijo; // Todos los meses serán de 2026

    const desde = new Date(year, mesIndex, 1, 0, 0, 0, 0);
    const hasta = new Date(year, mesIndex + 1, 1, 0, 0, 0, 0);

    meses.push({
      key: `${year}-${String(mesIndex + 1).padStart(2, "0")}`,
      label: `${MESES_ES[mesIndex]} ${year}`,
      desdeISO: desde.toISOString(),
      hastaISO: hasta.toISOString(),
    });
  }
  return meses;
}

function formatFecha(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toISOString();
  }
}

export default function HistorialReportes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { usuarioName, logout } = useAdmin();
  const meses = useMemo(() => buildMesesRecientes(12), []);
  const [mesSeleccionado, setMesSeleccionado] = useState(meses[0]);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (!mesSeleccionado) return;
    setLoading(true);
    setError(null);

    obtenerReportesPorRango(mesSeleccionado.desdeISO, mesSeleccionado.hastaISO)
      .then((data) => setReportes(Array.isArray(data) ? data : []))
      .catch((e) => {
        setReportes([]);
        setError(e?.message || "No se pudieron cargar los reportes");
      })
      .finally(() => setLoading(false));
  }, [mesSeleccionado]);

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
            <Text style={styles.headerTitle}>Historial</Text>
            <Text style={styles.headerSubtitle}>Por mes</Text>
            {usuarioName ? (
              <Text style={styles.headerUser}>Usuario: {usuarioName}</Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <TouchableOpacity
          style={styles.monthPicker}
          onPress={() => setSelectorVisible(true)}
        >
          <Text style={styles.monthPickerLabel}>Mes seleccionado</Text>
          <Text style={styles.monthPickerValue}>{mesSeleccionado?.label}</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.reportePrincipal} />
            <Text style={styles.centerText}>Cargando reportes…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>Ocurrió un error</Text>
            <Text style={styles.centerText}>{error}</Text>
          </View>
        ) : reportes.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Sin reportes</Text>
            <Text style={styles.centerText}>
              No hay reportes registrados para {mesSeleccionado?.label}.
            </Text>
          </View>
        ) : (
          <FlatList
            data={reportes}
            keyExtractor={(item, index) => String(item.id ?? index)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle}>
                    {item.tipo_incidente || "Incidente"}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      item.estado === "Pendiente"
                        ? styles.badgePendiente
                        : styles.badgeOtro,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {item.estado || "Estado"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardMeta}>
                  {formatFecha(item.timestamp_creado)}
                </Text>
                {item.direccion ? (
                  <Text style={styles.cardMeta}>{item.direccion}</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>

      <Modal
        visible={selectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectorVisible(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecciona un mes</Text>
            {meses.map((m) => {
              const active = m.key === mesSeleccionado?.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => {
                    setSelectorVisible(false);
                    setMesSeleccionado(m);
                  }}
                >
                  <Text style={[styles.modalItemText, active && styles.modalItemTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.fondoGrisOscuro },
  header: {
<<<<<<< HEAD
    backgroundColor: COLORS.reportePrincipalOscuro, // Verde oscuro
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
=======
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
>>>>>>> 559dc50bff7f967582ca5b15048fb98bd2dd5778
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
<<<<<<< HEAD
    color: COLORS.blanco, // Texto blanco para contraste con verde oscuro
    fontSize: 26,
    fontWeight: "900",
=======
    color: COLORS.negro,
    fontSize: 20,
    fontWeight: "800",
>>>>>>> 559dc50bff7f967582ca5b15048fb98bd2dd5778
    textAlign: "center",
    letterSpacing: 0.4,
  },
  headerSubtitle: {
<<<<<<< HEAD
    color: COLORS.blanco, // Texto blanco para contraste con verde oscuro
    fontSize: 17,
=======
    color: COLORS.negro,
    fontSize: 13,
>>>>>>> 559dc50bff7f967582ca5b15048fb98bd2dd5778
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
  body: { flex: 1, padding: 20, backgroundColor: COLORS.fondoGrisOscuro },
  monthPicker: {
    backgroundColor: COLORS.reportePrincipal, // Verde medio
    borderWidth: 2.5,
    borderColor: COLORS.naranja, // Naranja que combina
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 18,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  monthPickerLabel: {
    color: COLORS.blanco,
    fontSize: 14,
    opacity: 0.9,
    fontWeight: "600",
  },
  monthPickerValue: {
    color: COLORS.blanco,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: 0.3,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  centerText: { color: COLORS.blanco, textAlign: "center", marginTop: 10 },
  emptyTitle: { color: COLORS.blanco, fontSize: 20, fontWeight: "900" },
  errorTitle: { color: COLORS.rojo, fontSize: 20, fontWeight: "900" },
  listContent: { paddingBottom: 16 },
  card: {
    backgroundColor: "#0F3A55",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(102,178,255,0.15)",
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  cardTitle: {
    color: COLORS.blanco,
    fontSize: 20,
    fontWeight: "900",
    flex: 1,
    letterSpacing: 0.3,
  },
  cardMeta: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  badgePendiente: { backgroundColor: COLORS.naranja },
  badgeOtro: { backgroundColor: COLORS.naranja }, // Naranja que combina
  badgeText: {
    color: COLORS.blanco,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.3,
  },
<<<<<<< HEAD
  footer: {
    backgroundColor: COLORS.grisOscuro, // Neutralidad
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  footerTitle: {
    color: COLORS.blanco, // Texto blanco para contraste con gris oscuro
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  footerText: {
    color: COLORS.blanco, // Texto blanco para contraste con gris oscuro
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.85,
  },
=======
>>>>>>> 559dc50bff7f967582ca5b15048fb98bd2dd5778
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: COLORS.blanco,
    borderRadius: 28,
    padding: 24,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.reportePrincipal, // Verde en lugar de negro
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 6,
  },
  modalItemActive: {
    backgroundColor: "rgba(102,178,255,0.2)",
    borderWidth: 2,
    borderColor: COLORS.naranja, // Naranja que combina
  },
  modalItemText: {
    color: COLORS.reportePrincipal, // Verde en lugar de negro
    fontSize: 17,
    fontWeight: "600",
  },
  modalItemTextActive: {
    color: COLORS.reportePrincipalOscuro, // Verde oscuro
    fontWeight: "800",
  },
});

