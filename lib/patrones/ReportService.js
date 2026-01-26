import { subirArchivo, crearReporte } from "../supabase-helpers";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

class ReportService {
  static instance;

  static getInstance() {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  crearReporteRapido(data) {
    console.log("[Singleton] Creando reporte rápido...");
    return crearReporte(data);
  }

  crearReporteCompleto(data, archivos) {
    console.log("[Singleton] Creando reporte completo con archivos...");

    return crearReporte(data).then((reporte) => {
      if (archivos && archivos.length > 0) {
        const subidas = archivos.map((archivo) =>
          subirArchivo(
            archivo.uri,
            reporte.id,
            archivo.type === "image" ? "imagen" : "video",
            archivo.fileName
          )
            .then((resultado) => {
              console.log("[Singleton] Archivo subido exitosamente:", resultado);
              return resultado;
            })
            .catch((error) => {
              console.error("[Singleton] Error al subir archivo:", error);
              return null;
            })
        );
        return Promise.all(subidas).then(() => reporte);
      }
      return reporte;
    });
  }

  obtenerReportes() {
    return fetch(`${supabaseUrl}/rest/v1/reportes?order=timestamp_creado.desc`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.message || "Error al obtener reportes");
          });
        }
        return response.json();
      })
      .catch((error) => {
        console.error("[Singleton] Error al obtener reportes:", error);
        throw error;
      });
  }
}

export default ReportService.getInstance();

