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

export function subirArchivo(uri, reporteId, tipoArchivo, nombreArchivo) {
  const fileExt =
    nombreArchivo.split(".").pop() || (tipoArchivo === "video" ? "mp4" : "jpg");
  const timestamp = Date.now();
  const fileName = `${reporteId}/${timestamp}-${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;

  return fetch(uri)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      const fileSize = arrayBuffer.byteLength;
      const contentType = tipoArchivo === "video" ? "video/mp4" : "image/jpeg";

      return fetch(
        `${supabaseUrl}/storage/v1/object/archivos-reportes/${fileName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": contentType,
            apikey: supabaseAnonKey,
            "Content-Length": fileSize.toString(),
          },
          body: arrayBuffer,
        }
      ).then((uploadResponse) => {
        if (!uploadResponse.ok) {
          return uploadResponse.json().then((error) => {
            console.error("Error al subir archivo:", error);
            throw new Error(error.message || "Error al subir archivo");
          });
        }
        return { fileSize, fileName };
      });
    })
    .then(({ fileSize, fileName }) => {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/archivos-reportes/${fileName}`;

      return fetch(`${supabaseUrl}/rest/v1/archivos_adjuntos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          reporte_id: reporteId,
          tipo_archivo: tipoArchivo,
          url_archivo: publicUrl,
          tamano_bytes: fileSize,
          nombre_original: nombreArchivo,
        }),
      })
        .then((insertResponse) => {
          if (!insertResponse.ok) {
            return insertResponse.json().then((error) => {
              console.error("Error al guardar referencia:", error);
              throw new Error(error.message || "Error al guardar referencia");
            });
          }
          return insertResponse.json();
        })
        .then((archivoAdjunto) => ({
          publicUrl,
          archivoAdjunto: Array.isArray(archivoAdjunto)
            ? archivoAdjunto[0]
            : archivoAdjunto,
        }));
    })
    .catch((error) => {
      console.error("Error en subirArchivo:", error);
      throw error;
    });
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
