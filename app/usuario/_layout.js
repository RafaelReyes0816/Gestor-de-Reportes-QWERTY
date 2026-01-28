import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../lib/theme/colors";

export default function UsuarioLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.reportePrincipal, // Verde
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        tabBarStyle: {
          backgroundColor: COLORS.fondoGrisOscuro,
          borderTopWidth: 0,
          borderTopColor: "rgba(255,255,255,0.1)",
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
          shadowOpacity: 0.2,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "700",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="formulario"
        options={{
          title: "Reportar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: "Historial",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
