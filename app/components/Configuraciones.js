import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "../../lib/theme/colors";

export default function Configuraciones() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alarmasSonoras, setAlarmasSonoras] = useState(true);
  const [notificacionesPush, setNotificacionesPush] = useState(true);

  const handleVolver = () => {
    router.back();
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
        <Text style={styles.headerTitle}>Gestor de Reportes</Text>
        <Text style={styles.headerSubtitle}>Tarija</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "android" ? 20 : 0 },
        ]}
      >
        <View style={styles.body}>
          <Text style={styles.title}>Configuraciones</Text>

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionHeader}>Notificaciones</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.itemText}>Alarmas sonoras</Text>
              <Switch
                trackColor={{ false: "#767577", true: COLORS.azulClaro }}
                thumbColor={alarmasSonoras ? COLORS.blanco : "#f4f3f4"}
                ios_backgroundColor="#767577"
                onValueChange={setAlarmasSonoras}
                value={alarmasSonoras}
              />
            </View>

            <View style={styles.item}>
              <Text style={styles.itemText}>Notificaciones Push</Text>
              <Switch
                trackColor={{ false: "#767577", true: COLORS.azulClaro }}
                thumbColor={notificacionesPush ? COLORS.blanco : "#f4f3f4"}
                ios_backgroundColor="#767577"
                onValueChange={setNotificacionesPush}
                value={notificacionesPush}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.backButton} onPress={handleVolver}>
              <Text style={styles.backButtonText}>Atrás</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.azulOscuro,
  },
  header: {
    backgroundColor: COLORS.azulClaro,
    paddingVertical: 16,
    paddingHorizontal: 20,
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
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
  },
  body: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.azulOscuro,
  },
  title: {
    color: COLORS.blanco,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 28,
  },
  section: {
    marginBottom: 20,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionHeader: {
    color: COLORS.blanco,
    fontSize: 26,
    fontWeight: "900",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.azulMedio,
    padding: 18,
    borderRadius: 14,
    marginLeft: 10,
    marginBottom: 10,
  },
  itemText: {
    color: COLORS.blanco,
    fontSize: 18,
    fontWeight: "600",
  },
  actions: {
    alignItems: "center",
    marginTop: 26,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: COLORS.gris,
    paddingVertical: 14,
    paddingHorizontal: 64,
    borderRadius: 25,
  },
  backButtonText: {
    color: COLORS.negro,
    fontSize: 18,
    fontWeight: "700",
  },
});

