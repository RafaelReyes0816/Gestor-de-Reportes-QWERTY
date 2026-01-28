import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAdmin } from "../../lib/context/AdminContext";
import { COLORS } from "../../lib/theme/colors";

const ADMIN_CODE = "ADMIN2024";
const ADMIN_NAME = "Rafael Reyes";
const USUARIO_NAME = "Samuel";

export default function LoginPrincipal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginUsuario } = useAdmin();
  const [modo, setModo] = useState(null); // 'admin' | 'usuario' | null
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false);

  const handleSeleccionarModo = (tipo) => {
    setModo(tipo);
    setCode("");
  };

  const handleLoginAdmin = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Por favor ingresa el código de acceso");
      return;
    }

    setLoading(true);
    const result = await login(code.trim(), ADMIN_NAME);
    setLoading(false);

    if (result.success) {
      router.replace("/admin/dashboard");
    } else {
      Alert.alert("Error", result.error || "Código incorrecto");
    }
  };

  const handleLoginUsuario = async () => {
    setLoading(true);
    const result = await loginUsuario(USUARIO_NAME);
    setLoading(false);

    if (result.success) {
      router.replace("/usuario");
    } else {
      Alert.alert("Error", result.error || "Error al iniciar sesión");
    }
  };

  const handleVolver = () => {
    setModo(null);
    setCode("");
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gestor de Reportes</Text>
          <Text style={styles.headerSubtitle}>Tarija</Text>
        </View>

        <View style={[styles.body, modo && styles.bodyForm]}>
          {!modo ? (
            <>
              <Text style={styles.welcomeText}>Bienvenido</Text>
              <Text style={styles.subtitleText}>Elige tipo de acceso</Text>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={() => handleSeleccionarModo("admin")}
                >
                  <Text style={styles.optionIcon}>👤</Text>
                  <Text style={styles.optionTitle}>Administrador</Text>
                  <Text style={styles.optionSubtitle}>Reportes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={() => handleSeleccionarModo("usuario")}
                >
                  <Text style={styles.optionIcon}>📱</Text>
                  <Text style={styles.optionTitle}>Usuario</Text>
                  <Text style={styles.optionSubtitle}>Reportar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : modo === "admin" ? (
            <KeyboardAvoidingView
              style={styles.keyboardWrap}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={styles.formScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.loginHeader}>
                  <TouchableOpacity onPress={handleVolver} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Volver</Text>
                  </TouchableOpacity>
                  <Text style={styles.loginTitle}>Admin</Text>
                  <View style={{ width: 60 }} />
                </View>

                <View style={styles.loginForm}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userInfoLabel}>Administrador:</Text>
                    <Text style={styles.userInfoName}>{ADMIN_NAME}</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Código de Acceso</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={styles.inputConClave}
                        value={code}
                        onChangeText={setCode}
                        placeholder="Ingresa el código"
                        placeholderTextColor={COLORS.gris}
                        secureTextEntry={!mostrarClave}
                        autoCapitalize="none"
                        editable={!loading}
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setMostrarClave((v) => !v)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      >
                        <Ionicons
                          name={mostrarClave ? "eye-off-outline" : "eye-outline"}
                          size={24}
                          color={COLORS.gris}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLoginAdmin}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.blanco} />
                    ) : (
                      <Text style={styles.buttonText}>Ingresar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          ) : (
            <>
              <View style={styles.loginHeader}>
                <TouchableOpacity onPress={handleVolver} style={styles.backButton}>
                  <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.loginTitle}>Acceso Usuario</Text>
                <View style={{ width: 60 }} />
              </View>

              <View style={styles.loginForm}>
                <View style={styles.userInfo}>
                  <Text style={styles.userInfoLabel}>Usuario:</Text>
                  <Text style={styles.userInfoName}>{USUARIO_NAME}</Text>
                </View>

                <Text style={styles.infoText}>
                  Presiona el botón para acceder como usuario
                </Text>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLoginUsuario}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.blanco} />
                  ) : (
                    <Text style={styles.buttonText}>Ingresar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.fondoGrisOscuro,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.reportePrincipalOscuro,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
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
  body: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  bodyForm: {
    justifyContent: "flex-start",
    paddingTop: 16,
  },
  keyboardWrap: {
    flex: 1,
    width: "100%",
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  welcomeText: {
    color: COLORS.blanco,
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subtitleText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 17,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 24,
  },
  optionCard: {
    backgroundColor: COLORS.reportePrincipal, // Verde medio
    borderWidth: 2,
    borderColor: COLORS.naranja, // Naranja que combina
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  optionIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  optionTitle: {
    color: COLORS.blanco,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  optionSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 20,
  },
  loginHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: COLORS.naranja, // Naranja que combina
    fontSize: 16,
    fontWeight: "700",
  },
  loginTitle: {
    color: COLORS.blanco,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    flex: 1,
  },
  loginForm: {
    width: "100%",
  },
  userInfo: {
    backgroundColor: COLORS.reportePrincipal, // Verde medio
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(102,178,255,0.3)",
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  userInfoLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
  },
  userInfoName: {
    color: COLORS.blanco,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    color: COLORS.blanco,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.azulMedio,
    borderWidth: 2,
    borderColor: COLORS.azulClaro,
    borderRadius: 16,
    shadowColor: COLORS.negro,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputConClave: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 12,
    color: COLORS.blanco,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    backgroundColor: COLORS.reportePrincipal, // Verde medio
    borderWidth: 2,
    borderColor: COLORS.naranja, // Naranja que combina
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: COLORS.blanco,
    fontSize: 16,
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.naranja,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.blanco,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
