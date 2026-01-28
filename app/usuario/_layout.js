import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../lib/theme/colors";

export default function UsuarioLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 4);
  const tabBarHeight = 48 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.reportePrincipal, // Verde
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        tabBarStyle: {
          backgroundColor: COLORS.fondoGrisOscuro,
          borderTopWidth: 0,
<<<<<<< HEAD
          borderTopColor: "rgba(255,255,255,0.1)",
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: COLORS.reportePrincipal, // Verde en lugar de negro
          shadowOpacity: 0.2,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 10,
=======
          borderLeftWidth: 0,
          borderRightWidth: 0,
          height: tabBarHeight,
          minHeight: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
          shadowRadius: 0,
          overflow: "hidden",
>>>>>>> 559dc50bff7f967582ca5b15048fb98bd2dd5778
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
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
