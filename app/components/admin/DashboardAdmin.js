import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAdmin } from "../../../lib/context/AdminContext";
import { obtenerTodosReportes } from "../../../lib/supabase-helpers";
import { COLORS } from "../../../lib/theme/colors";

const ESTADOS = ["Pendiente", "En Proceso", "Resuelto", "Cancelado"];
const TIPOS = ["Urgente", "Importante", "Informativo"];

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

export default function DashboardAdmin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { adminName, logout } = useAdmin();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState(null);
  const [modalFiltros, setModalFiltros] = useState(false);

  const cargarReportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filtros = {};
      if (filtroEstado) filtros.estado = filtroEstado;
      if (filtroTipo) filtros.tipo_incidente = filtroTipo;

      const data = await obtenerTodosReportes(filtros);
      setReportes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Error al cargar reportes");
      setReportes([]);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroTipo]);

  // Cargar al montar y cada vez que cambian los filtros (selección o limpiar)
  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);
    const filtros = {};
    if (filtroEstado) filtros.estado = filtroEstado;
    if (filtroTipo) filtros.tipo_incidente = filtroTipo;
    obtenerTodosReportes(filtros)
      .then((data) => {
        if (!cancelado) setReportes(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelado) {
          setError(e?.message || "Error al cargar reportes");
          setReportes([]);
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => { cancelado = true; };
  }, [filtroEstado, filtroTipo]);

  // Recargar cuando la pantalla recibe foco (al volver del detalle)
  useFocusEffect(
    useCallback(() => {
      cargarReportes();
    }, [cargarReportes])
  );

  const estadisticas = useMemo(() => {
    const total = reportes.length;
    const porEstado = reportes.reduce((acc, r) => {
      acc[r.estado] = (acc[r.estado] || 0) + 1;
      return acc;
    }, {});
    return { total, porEstado };
  }, [reportes]);

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/admin/reporte/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTipo}>{item.tipo_incidente}</Text>
        <View
          style={[
            styles.badge,
            item.estado === "Pendiente"
              ? styles.badgePendiente
              : item.estado === "En Proceso"
              ? styles.badgeProceso
              : item.estado === "Resuelto"
              ? styles.badgeResuelto
              : styles.badgeCancelado,
          ]}
        >
          <Text style={styles.badgeText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.cardFecha}>{formatFecha(item.timestamp_creado)}</Text>
      {item.direccion ? (
        <Text style={styles.cardDireccion} numberOfLines={1}>
          📍 {item.direccion}
        </Text>
      ) : null}
      {item.admin_asignado ? (
        <Text style={styles.cardAdmin}>👤 {item.admin_asignado}</Text>
      ) : null}
    </TouchableOpacity>
  );

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
        <View>
          <Text style={styles.headerTitle}>Admin</Text>
          <Text style={styles.headerSubtitle}>{adminName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.statNumberTotal]}>
            {estadisticas.total}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.statNumberWarning]}>
            {estadisticas.porEstado?.Pendiente || 0}
          </Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.statNumberWarning]}>
            {estadisticas.porEstado?.["En Proceso"] || 0}
          </Text>
          <Text style={styles.statLabel}>En Proceso</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.statNumberSuccess]}>
            {estadisticas.porEstado?.Resuelto || 0}
          </Text>
          <Text style={styles.statLabel}>Resueltos</Text>
        </View>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalFiltros(true)}
        >
          <Text style={styles.filterButtonText}>
            {filtroEstado || filtroTipo ? "Filtros activos" : "Filtros"}
          </Text>
        </TouchableOpacity>
        {(filtroEstado || filtroTipo) && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setFiltroEstado(null);
              setFiltroTipo(null);
            }}
          >
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.reportePrincipal} />
          <Text style={styles.centerText}>Cargando reportes...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarReportes}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : reportes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay reportes</Text>
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={cargarReportes}
        />
      )}

      <Modal
        visible={modalFiltros}
        transparent
        animationType="fade"
        onRequestClose={() => setModalFiltros(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalFiltros(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Filtros</Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Estado</Text>
              {ESTADOS.map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={[
                    styles.modalItem,
                    filtroEstado === estado && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setFiltroEstado(filtroEstado === estado ? null : estado);
                    setModalFiltros(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      filtroEstado === estado && styles.modalItemTextActive,
                    ]}
                  >
                    {estado}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Tipo de Incidente</Text>
              {TIPOS.map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.modalItem,
                    filtroTipo === tipo && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setFiltroTipo(filtroTipo === tipo ? null : tipo);
                    setModalFiltros(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      filtroTipo === tipo && styles.modalItemTextActive,
                    ]}
                  >
                    {tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalFiltros(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.fondoGrisOscuro },
  header: {
    backgroundColor: COLORS.reportePrincipalOscuro,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.negro,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerTitle: {
    color: COLORS.blanco,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    opacity: 0.85,
  },
  logoutButton: {
    backgroundColor: COLORS.rojo,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  logoutText: {
    color: COLORS.blanco,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  stats: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.reportePrincipal, // Verde medio
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(102,178,255,0.2)",
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  statNumber: {
    color: COLORS.blanco,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  statNumberTotal: {
    color: COLORS.blanco,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statNumberWarning: {
    color: COLORS.naranja,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statNumberSuccess: {
    color: COLORS.verde,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statLabel: {
    color: COLORS.blanco,
    fontSize: 13,
    marginTop: 8,
    opacity: 0.9,
    fontWeight: "600",
    textAlign: "center",
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  filterButton: {
    backgroundColor: COLORS.reportePrincipal, // Verde medio
    borderWidth: 2.5,
    borderColor: COLORS.naranja, // Naranja que combina
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  filterButtonText: {
    color: COLORS.blanco,
    fontWeight: "800",
    textAlign: "center",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  clearButton: {
    backgroundColor: COLORS.gris,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  clearButtonText: {
    color: COLORS.reportePrincipal, // Verde en lugar de negro
    fontWeight: "800",
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centerText: {
    color: COLORS.blanco,
    marginTop: 12,
    textAlign: "center",
  },
  errorText: {
    color: COLORS.rojo,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.naranja, // Naranja que combina
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.reportePrincipal, // Verde en lugar de negro
    fontWeight: "700",
  },
  emptyText: {
    color: COLORS.blanco,
    fontSize: 18,
    textAlign: "center",
  },
  list: { padding: 20, paddingBottom: 32 },
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTipo: {
    color: COLORS.blanco,
    fontSize: 20,
    fontWeight: "900",
    flex: 1,
    letterSpacing: 0.3,
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
  badgeProceso: { backgroundColor: COLORS.naranja }, // Naranja que combina
  badgeResuelto: { backgroundColor: COLORS.verde },
  badgeCancelado: { backgroundColor: COLORS.gris },
  badgeText: {
    color: COLORS.blanco,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  cardFecha: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  cardDireccion: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  },
  cardAdmin: {
    color: COLORS.naranja, // Naranja que combina
    fontSize: 13,
    marginTop: 8,
    fontWeight: "700",
  },
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
    maxHeight: "80%",
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
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.reportePrincipal, // Verde en lugar de negro
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: "600",
  },
  modalItemTextActive: {
    color: COLORS.reportePrincipalOscuro, // Verde oscuro
    fontWeight: "800",
  },
  modalCloseButton: {
    backgroundColor: COLORS.naranja, // Naranja que combina
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  modalCloseButtonText: {
    color: COLORS.reportePrincipal, // Verde en lugar de negro
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.3,
  },
});
