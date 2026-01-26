import React from "react";
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { COLORS } from "../../lib/theme/colors";

export default function ModalMensaje({
  visible,
  tipo,
  titulo,
  mensaje,
  onClose,
  textoBoton = "Aceptar",
}) {
  const getHeaderColor = () => {
    switch (tipo) {
      case "exito":
        return { color: COLORS.verde, label: "EXITO" };
      case "error":
        return { color: COLORS.rojo, label: "ERROR" };
      default:
        return { color: COLORS.azulClaro, label: "INFO" };
    }
  };

  const header = getHeaderColor();

  return (
    <Modal
      visible={!!visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={[styles.header, { backgroundColor: header.color }]}>
            <Text style={styles.headerBadge}>{header.label}</Text>
            <Text style={styles.headerTitle}>{titulo}</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.bodyText}>{mensaje}</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: header.color }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>{textoBoton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "90%",
    maxWidth: 420,
    backgroundColor: COLORS.blanco,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  headerBadge: {
    fontSize: 13,
    marginBottom: 10,
    color: COLORS.blanco,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.blanco,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  body: {
    padding: 24,
    minHeight: 90,
    justifyContent: "center",
  },
  bodyText: {
    fontSize: 17,
    color: COLORS.textoOscuro,
    textAlign: "center",
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: COLORS.negro,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonText: {
    color: COLORS.blanco,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});

