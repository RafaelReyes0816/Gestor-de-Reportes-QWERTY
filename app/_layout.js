import { Stack } from "expo-router";
import { AdminProvider } from "../lib/context/AdminContext";

export default function RootLayout() {
  return (
    <AdminProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AdminProvider>
  );
}

