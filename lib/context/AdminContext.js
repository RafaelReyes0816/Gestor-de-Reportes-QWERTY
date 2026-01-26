import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminContext = createContext();

const ADMIN_CODE_KEY = "@admin_code";
const ADMIN_NAME_KEY = "@admin_name";
const USUARIO_NAME_KEY = "@usuario_name";
const MODO_KEY = "@modo"; // 'admin' | 'usuario'
const ADMIN_CODE = "ADMIN2024"; // Cambiar este código en producción

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUsuario, setIsUsuario] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [usuarioName, setUsuarioName] = useState("");
  const [modo, setModo] = useState(null); // 'admin' | 'usuario' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const storedModo = await AsyncStorage.getItem(MODO_KEY);
      const storedCode = await AsyncStorage.getItem(ADMIN_CODE_KEY);
      const storedAdminName = await AsyncStorage.getItem(ADMIN_NAME_KEY);
      const storedUsuarioName = await AsyncStorage.getItem(USUARIO_NAME_KEY);

      if (storedModo === "admin" && storedCode === ADMIN_CODE && storedAdminName) {
        setIsAdmin(true);
        setAdminName(storedAdminName);
        setModo("admin");
      } else if (storedModo === "usuario" && storedUsuarioName) {
        setIsUsuario(true);
        setUsuarioName(storedUsuarioName);
        setModo("usuario");
      }
    } catch (error) {
      console.error("Error al verificar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (code, name) => {
    if (code === ADMIN_CODE) {
      try {
        await AsyncStorage.setItem(ADMIN_CODE_KEY, code);
        await AsyncStorage.setItem(ADMIN_NAME_KEY, name || "Admin");
        await AsyncStorage.setItem(MODO_KEY, "admin");
        setIsAdmin(true);
        setAdminName(name || "Admin");
        setModo("admin");
        return { success: true };
      } catch (error) {
        console.error("Error al guardar sesión:", error);
        return { success: false, error: "Error al guardar sesión" };
      }
    }
    return { success: false, error: "Código incorrecto" };
  };

  const loginUsuario = async (name) => {
    try {
      await AsyncStorage.setItem(USUARIO_NAME_KEY, name || "Usuario");
      await AsyncStorage.setItem(MODO_KEY, "usuario");
      setIsUsuario(true);
      setUsuarioName(name || "Usuario");
      setModo("usuario");
      return { success: true };
    } catch (error) {
      console.error("Error al guardar sesión:", error);
      return { success: false, error: "Error al guardar sesión" };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(ADMIN_CODE_KEY);
      await AsyncStorage.removeItem(ADMIN_NAME_KEY);
      await AsyncStorage.removeItem(USUARIO_NAME_KEY);
      await AsyncStorage.removeItem(MODO_KEY);
      setIsAdmin(false);
      setIsUsuario(false);
      setAdminName("");
      setUsuarioName("");
      setModo(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isUsuario,
        adminName,
        usuarioName,
        modo,
        loading,
        login,
        loginUsuario,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin debe usarse dentro de AdminProvider");
  }
  return context;
}
