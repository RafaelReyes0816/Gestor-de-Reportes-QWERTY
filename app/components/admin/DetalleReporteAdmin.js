import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAdmin } from "../../../lib/context/AdminContext";
import {
  obtenerReportePorId,
  obtenerArchivosPorReporte,
  actualizarEstadoReporte,
  agregarNotasAdmin,
} from "../../../lib/supabase-helpers";
import { COLORS } from "../../../lib/theme/colors";

const ESTADOS = ["Pendiente", "En Proceso", "Resuelto", "Cancelado"];

function formatFecha(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toISOString();
  }
}

export default function DetalleReporteAdmin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { adminName } = useAdmin();
  const [reporte, setReporte] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalEstado, setModalEstado] = useState(false);
  const [modalNotas, setModalNotas] = useState(false);
  const [notasTexto, setNotasTexto] = useState("");

  const cargarDatos = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [reporteData, archivosData] = await Promise.all([
        obtenerReportePorId(id),
        obtenerArchivosPorReporte(id),
      ]);
      setReporte(reporteData);
      setArchivos(Array.isArray(archivosData) ? archivosData : []);
      setNotasTexto(reporteData?.notas_admin || "");
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el reporte");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Recargar datos cuando la pantalla recibe foco (por si se actualizó desde otra pantalla)
  useFocusEffect(
    useCallback(() => {
      if (id) {
        cargarDatos();
      }
    }, [id, cargarDatos])
  );

  const handleCambiarEstado = async (nuevoEstado) => {
    setModalEstado(false);
    if (reporte?.estado === nuevoEstado) return;
    setSaving(true);
    try {
      const resultado = await actualizarEstadoReporte(id, nuevoEstado, adminName);
      console.log("[DetalleReporteAdmin] Estado actualizado:", resultado);
      await cargarDatos();
      Alert.alert("Éxito", "Estado actualizado correctamente");
    } catch (error) {
      console.error("[DetalleReporteAdmin] Error al cambiar estado:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo actualizar el estado. Verifica las políticas RLS en Supabase."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarNotas = async () => {
    setSaving(true);
    try {
      const resultado = await agregarNotasAdmin(id, notasTexto, adminName);
      console.log("[DetalleReporteAdmin] Notas guardadas:", resultado);
      
      // Recargar datos del reporte para obtener la versión actualizada
      await cargarDatos();
      
      setModalNotas(false);
      Alert.alert("Éxito", "Notas guardadas correctamente");
    } catch (error) {
      console.error("[DetalleReporteAdmin] Error al guardar notas:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudieron guardar las notas. Verifica las políticas RLS en Supabase."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.azulClaro} />
        <Text style={styles.loadingText}>Cargando reporte...</Text>
      </SafeAreaView>
    );
  }

  if (!reporte) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Reporte no encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.body}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tipo de Incidente</Text>
              <View
                style={[
                  styles.badge,
                  reporte.estado === "Pendiente"
                    ? styles.badgePendiente
                    : reporte.estado === "En Proceso"
                    ? styles.badgeProceso
                    : reporte.estado === "Resuelto"
                    ? styles.badgeResuelto
                    : styles.badgeCancelado,
                ]}
              >
                <Text style={styles.badgeText}>{reporte.estado}</Text>
              </View>
            </View>
            <Text style={styles.value}>{reporte.tipo_incidente}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            {reporte.latitud && reporte.longitud ? (
              <Text style={styles.value}>
                {reporte.latitud.toFixed(6)}, {reporte.longitud.toFixed(6)}
              </Text>
            ) : null}
            {reporte.direccion ? (
              <Text style={styles.value}>{reporte.direccion}</Text>
            ) : null}
            {reporte.ciudad ? <Text style={styles.value}>Ciudad: {reporte.ciudad}</Text> : null}
          </View>

          {reporte.descripcion ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.value}>{reporte.descripcion}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información</Text>
            <Text style={styles.meta}>Creado: {formatFecha(reporte.timestamp_creado)}</Text>
            {reporte.timestamp_actualizado ? (
              <Text style={styles.meta}>
                Actualizado: {formatFecha(reporte.timestamp_actualizado)}
              </Text>
            ) : null}
            {reporte.admin_asignado ? (
              <Text style={styles.meta}>Asignado a: {reporte.admin_asignado}</Text>
            ) : null}
          </View>

          {archivos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Archivos Adjuntos ({archivos.length})</Text>
              <View style={styles.archivosGrid}>
                {archivos.map((archivo) => (
                  <View key={archivo.id} style={styles.archivoCard}>
                    {archivo.tipo_archivo === "imagen" ? (
                      <Image source={{ uri: archivo.url_archivo }} style={styles.archivoImage} />
                    ) : (
                      <View style={styles.archivoVideo}>
                        <Text style={styles.archivoVideoText}>VIDEO</Text>
                      </View>
                    )}
                    <Text style={styles.archivoNombre} numberOfLines={1}>
                      {archivo.nombre_original || "Archivo"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {reporte.notas_admin ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notas del Administrador</Text>
              <Text style={styles.value}>{reporte.notas_admin}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setModalEstado(true)}
              disabled={saving}
            >
              <Text style={styles.actionButtonText}>Cambiar Estado</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => setModalNotas(true)}
              disabled={saving}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                {reporte.notas_admin ? "Editar Notas" : "Agregar Notas"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal Cambiar Estado */}
      <Modal
        visible={modalEstado}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEstado(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalEstado(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cambiar Estado</Text>
            <Text style={styles.modalSubtitle}>Estado actual: {reporte.estado}</Text>
            {ESTADOS.map((estado) => (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.modalItem,
                  reporte.estado === estado && styles.modalItemActive,
                ]}
                onPress={() => handleCambiarEstado(estado)}
                disabled={saving || reporte.estado === estado}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    reporte.estado === estado && styles.modalItemTextActive,
                  ]}
                >
                  {estado}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalEstado(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Notas */}
      <Modal
        visible={modalNotas}
        transparent
        animationType="fade"
        onRequestClose={() => setModalNotas(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalNotas(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Notas del Administrador</Text>
            <TextInput
              style={styles.notasInput}
              value={notasTexto}
              onChangeText={setNotasTexto}
              placeholder="Escribe tus notas aquí..."
              placeholderTextColor={COLORS.gris}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalNotas(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleGuardarNotas}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.blanco} />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.azulOscuro },
  header: {
    backgroundColor: COLORS.azulClaro,
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
  backText: {
    color: COLORS.negro,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  headerTitle: {
    color: COLORS.negro,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  loadingText: {
    color: COLORS.blanco,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: COLORS.rojo,
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.azulClaro,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.negro,
    fontWeight: "700",
  },
  scrollContent: { padding: 20, paddingBottom: 32 },
  body: { flex: 1 },
  section: {
    backgroundColor: "#0F3A55",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "rgba(102,178,255,0.15)",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.azulClaro,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  value: {
    color: COLORS.blanco,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "500",
  },
  meta: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    marginTop: 6,
    fontWeight: "500",
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: COLORS.negro,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  badgePendiente: { backgroundColor: COLORS.naranja },
  badgeProceso: { backgroundColor: COLORS.azulClaro },
  badgeResuelto: { backgroundColor: COLORS.verde },
  badgeCancelado: { backgroundColor: COLORS.gris },
  badgeText: {
    color: COLORS.blanco,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  archivosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
  },
  archivoCard: {
    width: "48%",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  archivoImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  archivoVideo: {
    width: "100%",
    height: 120,
    backgroundColor: "#0F3A55",
    justifyContent: "center",
    alignItems: "center",
  },
  archivoVideoText: {
    color: COLORS.blanco,
    fontWeight: "900",
    fontSize: 18,
  },
  archivoNombre: {
    color: COLORS.blanco,
    fontSize: 12,
    padding: 8,
    textAlign: "center",
  },
  actions: {
    gap: 16,
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: COLORS.naranja,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.azulMedio,
    borderWidth: 2.5,
    borderColor: COLORS.azulClaro,
  },
  actionButtonText: {
    color: COLORS.blanco,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  actionButtonTextSecondary: {
    color: COLORS.azulClaro,
    fontWeight: "800",
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
    shadowColor: COLORS.negro,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.negro,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  modalSubtitle: {
    fontSize: 15,
    color: COLORS.negro,
    marginBottom: 20,
    opacity: 0.75,
    fontWeight: "500",
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 8,
  },
  modalItemActive: {
    backgroundColor: "rgba(102,178,255,0.2)",
    borderWidth: 2,
    borderColor: COLORS.azulClaro,
  },
  modalItemText: {
    color: COLORS.negro,
    fontSize: 17,
    fontWeight: "600",
  },
  modalItemTextActive: {
    color: COLORS.azulOscuro,
    fontWeight: "800",
  },
  modalCloseButton: {
    backgroundColor: COLORS.gris,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: COLORS.negro,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  modalCloseButtonText: {
    color: COLORS.negro,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.3,
  },
  notasInput: {
    backgroundColor: COLORS.grisClaro || "#f5f5f5",
    borderRadius: 18,
    padding: 16,
    minHeight: 140,
    fontSize: 16,
    color: COLORS.negro,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.grisMedio || "#e0e0e0",
  },
  modalActions: {
    flexDirection: "row",
    gap: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  modalButtonCancel: {
    backgroundColor: COLORS.gris,
  },
  modalButtonSave: {
    backgroundColor: COLORS.azulClaro,
  },
  modalButtonTextCancel: {
    color: COLORS.negro,
    fontWeight: "800",
    fontSize: 16,
  },
  modalButtonTextSave: {
    color: COLORS.blanco,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
