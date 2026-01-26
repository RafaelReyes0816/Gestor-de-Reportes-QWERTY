import { supabase } from "./supabase";
import * as FileSystem from "expo-file-system/legacy";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export function crearReporte(data) {
  return fetch(`${supabaseUrl}/rest/v1/reportes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      tipo_incidente: data.tipo_incidente,
      latitud: data.latitud,
      longitud: data.longitud,
      direccion: data.direccion,
      descripcion: data.descripcion,
      ubicacion_confirmada: data.ubicacion_confirmada,
      estado: "Pendiente",
      ciudad: "Tarija",
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          console.error("Error al crear reporte:", error);
          throw new Error(error.message || "Error al crear reporte");
        });
      }
      return response.json();
    })
    .then((reporte) => (Array.isArray(reporte) ? reporte[0] : reporte))
    .catch((error) => {
      console.error("Error en crearReporte:", error);
      throw error;
    });
}

export async function subirArchivo(uri, reporteId, tipoArchivo, nombreArchivo) {
  try {
    const fileExt =
      nombreArchivo.split(".").pop() || (tipoArchivo === "video" ? "mp4" : "jpg");
    const timestamp = Date.now();
    const fileName = `${reporteId}/${timestamp}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    // Leer el archivo usando expo-file-system (más confiable en React Native)
    // En versiones recientes de expo-file-system, usar 'base64' como string directamente
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Convertir base64 a ArrayBuffer
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const arrayBuffer = byteArray.buffer;
    const fileSize = arrayBuffer.byteLength;

    // Subir archivo usando el cliente de Supabase con ArrayBuffer
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("archivos-reportes")
      .upload(fileName, arrayBuffer, {
        contentType: tipoArchivo === "video" ? "video/mp4" : "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir archivo:", uploadError);
      throw new Error(uploadError.message || "Error al subir archivo");
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from("archivos-reportes")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Guardar referencia en la base de datos
    const { data: archivoAdjunto, error: insertError } = await supabase
      .from("archivos_adjuntos")
      .insert({
        reporte_id: reporteId,
        tipo_archivo: tipoArchivo,
        url_archivo: publicUrl,
        tamano_bytes: fileSize,
        nombre_original: nombreArchivo,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error al guardar referencia:", insertError);
      throw new Error(insertError.message || "Error al guardar referencia");
    }

    return {
      publicUrl,
      archivoAdjunto: archivoAdjunto,
    };
  } catch (error) {
    console.error("Error en subirArchivo:", error);
    throw error;
  }
}

export function obtenerReportes() {
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
          console.error("Error al obtener reportes:", error);
          throw new Error(error.message || "Error al obtener reportes");
        });
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error en obtenerReportes:", error);
      throw error;
    });
}

export function obtenerReportesPorRango(desdeISO, hastaISO) {
  const url =
    `${supabaseUrl}/rest/v1/reportes` +
    `?timestamp_creado=gte.${encodeURIComponent(desdeISO)}` +
    `&timestamp_creado=lt.${encodeURIComponent(hastaISO)}` +
    `&order=timestamp_creado.desc`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          console.error("Error al obtener reportes por rango:", error);
          throw new Error(error.message || "Error al obtener reportes");
        });
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error en obtenerReportesPorRango:", error);
      throw error;
    });
}

// ========== FUNCIONES ADMIN ==========

export function obtenerTodosReportes(filtros = {}) {
  let url = `${supabaseUrl}/rest/v1/reportes?order=timestamp_creado.desc`;

  // Aplicar filtros
  if (filtros.estado) {
    url += `&estado=eq.${encodeURIComponent(filtros.estado)}`;
  }
  if (filtros.tipo_incidente) {
    url += `&tipo_incidente=eq.${encodeURIComponent(filtros.tipo_incidente)}`;
  }
  if (filtros.desde) {
    url += `&timestamp_creado=gte.${encodeURIComponent(filtros.desde)}`;
  }
  if (filtros.hasta) {
    url += `&timestamp_creado=lt.${encodeURIComponent(filtros.hasta)}`;
  }
  if (filtros.limit) {
    url += `&limit=${filtros.limit}`;
  }

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          console.error("Error al obtener todos los reportes:", error);
          throw new Error(error.message || "Error al obtener reportes");
        });
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error en obtenerTodosReportes:", error);
      throw error;
    });
}

export function obtenerReportePorId(id) {
  return fetch(`${supabaseUrl}/rest/v1/reportes?id=eq.${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          console.error("Error al obtener reporte:", error);
          throw new Error(error.message || "Error al obtener reporte");
        });
      }
      return response.json();
    })
    .then((data) => (Array.isArray(data) && data.length > 0 ? data[0] : null))
    .catch((error) => {
      console.error("Error en obtenerReportePorId:", error);
      throw error;
    });
}

export function actualizarEstadoReporte(id, nuevoEstado, adminNombre) {
  const url = `${supabaseUrl}/rest/v1/reportes?id=eq.${id}`;
  const body = {
    estado: nuevoEstado,
    admin_asignado: adminNombre || null,
  };

  console.log("[actualizarEstadoReporte] URL:", url);
  console.log("[actualizarEstadoReporte] Body:", body);

  return fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  })
    .then(async (response) => {
      const responseText = await response.text();
      console.log("[actualizarEstadoReporte] Status:", response.status);
      console.log("[actualizarEstadoReporte] Response:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || "Error desconocido" };
        }
        console.error("Error al actualizar estado:", errorData);
        throw new Error(
          errorData.message ||
            errorData.hint ||
            `Error ${response.status}: No se pudo actualizar el estado. Verifica las políticas RLS en Supabase.`
        );
      }

      try {
        const data = JSON.parse(responseText);
        return Array.isArray(data) ? data[0] : data;
      } catch {
        return { id, estado: nuevoEstado, admin_asignado: adminNombre };
      }
    })
    .catch((error) => {
      console.error("Error en actualizarEstadoReporte:", error);
      throw error;
    });
}

export function agregarNotasAdmin(id, notas, adminNombre) {
  const url = `${supabaseUrl}/rest/v1/reportes?id=eq.${id}`;
  const body = {
    notas_admin: notas,
    admin_asignado: adminNombre || null,
  };

  console.log("[agregarNotasAdmin] URL:", url);
  console.log("[agregarNotasAdmin] Body:", body);

  return fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  })
    .then(async (response) => {
      const responseText = await response.text();
      console.log("[agregarNotasAdmin] Status:", response.status);
      console.log("[agregarNotasAdmin] Response:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || "Error desconocido" };
        }
        console.error("Error al agregar notas:", errorData);
        throw new Error(
          errorData.message ||
            errorData.hint ||
            `Error ${response.status}: No se pudieron guardar las notas. Verifica las políticas RLS en Supabase.`
        );
      }

      try {
        const data = JSON.parse(responseText);
        return Array.isArray(data) ? data[0] : data;
      } catch {
        return { id, notas_admin: notas, admin_asignado: adminNombre };
      }
    })
    .catch((error) => {
      console.error("Error en agregarNotasAdmin:", error);
      throw error;
    });
}

export function obtenerArchivosPorReporte(reporteId) {
  return fetch(`${supabaseUrl}/rest/v1/archivos_adjuntos?reporte_id=eq.${reporteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          console.error("Error al obtener archivos:", error);
          throw new Error(error.message || "Error al obtener archivos");
        });
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error en obtenerArchivosPorReporte:", error);
      throw error;
    });
}
