import { IncomingMessage, ServerResponse } from "http";
import { crearHistorial,listarHistorial,buscarHistorialPorId,buscarHistorialPorMatricula,buscarHistorialPorUsuario,actualizarHistorial,eliminarHistorial
} from "../services/historialService";

function responderJson(
  res: ServerResponse,
  estado: number,
  contenido: unknown
): void {
  res.writeHead(estado, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify(contenido));
}

function leerBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        if (!body.trim()) {
          reject(new Error("El cuerpo de la petición está vacío."));
          return;
        }

        resolve(JSON.parse(body));
      } catch {
        reject(new Error("El cuerpo debe contener un JSON válido."));
      }
    });

    req.on("error", () => {
      reject(new Error("No se pudo leer el cuerpo de la petición."));
    });
  });
}

function obtenerIdDesdeUrl(url: string): number | null {
  const partes = url.split("/");
  const id = Number(partes[2]);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function historialesRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const metodo = req.method ?? "";
  const urlCompleta = req.url ?? "";
  const url = urlCompleta.split("?")[0];

  // GET /historiales
  if (metodo === "GET" && url === "/historiales") {
    try {
      const historiales = await listarHistorial();

      responderJson(res, 200, historiales);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo listar el historial."
      });
    }

    return true;
  }

  // GET /historiales/matricula/:id
  if (
    metodo === "GET" &&
    url.startsWith("/historiales/matricula/")
  ) {
    const partes = url.split("/");
    const idMatricula = Number(partes[3]);

    if (!Number.isInteger(idMatricula) || idMatricula <= 0) {
      responderJson(res, 400, {
        mensaje: "El ID de la matrícula no es válido."
      });

      return true;
    }

    try {
      const historiales =
        await buscarHistorialPorMatricula(idMatricula);

      responderJson(res, 200, historiales);
    } catch {
      responderJson(res, 500, {
        mensaje:
          "No se pudo buscar el historial de la matrícula."
      });
    }

    return true;
  }

  // GET /historiales/usuario/:id
  if (
    metodo === "GET" &&
    url.startsWith("/historiales/usuario/")
  ) {
    const partes = url.split("/");
    const idUsuario = Number(partes[3]);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      responderJson(res, 400, {
        mensaje: "El ID del usuario no es válido."
      });

      return true;
    }

    try {
      const historiales =
        await buscarHistorialPorUsuario(idUsuario);

      responderJson(res, 200, historiales);
    } catch {
      responderJson(res, 500, {
        mensaje:
          "No se pudo buscar el historial del usuario."
      });
    }

    return true;
  }

  // GET /historiales/:id
  if (
    metodo === "GET" &&
    url.startsWith("/historiales/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del historial no es válido."
      });

      return true;
    }

    try {
      const historial = await buscarHistorialPorId(id);

      if (!historial) {
        responderJson(res, 404, {
          mensaje: "Registro de historial no encontrado."
        });

        return true;
      }

      responderJson(res, 200, historial);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo buscar el registro del historial."
      });
    }

    return true;
  }

  // POST /historiales
  if (metodo === "POST" && url === "/historiales") {
    try {
      const datos = await leerBody(req);

      const nuevoHistorial = await crearHistorial(
        datos as {
          id_matricula: number;
          id_usuario: number;
          accion: string;
          descripcion: string;
          fecha: string;
          valores_old?: string | null;
          valores_new?: string | null;
        }
      );

      responderJson(res, 201, nuevoHistorial);
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 400, {
          mensaje:
            "La matrícula o el usuario indicados no existen."
        });

        return true;
      }

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo crear el historial.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // PUT /historiales/:id
  if (
    metodo === "PUT" &&
    url.startsWith("/historiales/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del historial no es válido."
      });

      return true;
    }

    try {
      const datos = await leerBody(req);

      const historialActualizado =
        await actualizarHistorial(
          id,
          datos as {
            id_matricula?: number;
            id_usuario?: number;
            accion?: string;
            descripcion?: string;
            fecha?: string;
            valores_old?: string | null;
            valores_new?: string | null;
          }
        );

      if (!historialActualizado) {
        responderJson(res, 404, {
          mensaje: "Registro de historial no encontrado."
        });

        return true;
      }

      responderJson(res, 200, historialActualizado);
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 400, {
          mensaje:
            "La matrícula o el usuario indicados no existen."
        });

        return true;
      }

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el historial.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // DELETE /historiales/:id
  if (
    metodo === "DELETE" &&
    url.startsWith("/historiales/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del historial no es válido."
      });

      return true;
    }

    try {
      const eliminado = await eliminarHistorial(id);

      if (!eliminado) {
        responderJson(res, 404, {
          mensaje: "Registro de historial no encontrado."
        });

        return true;
      }

      responderJson(res, 200, {
        mensaje: "Registro de historial eliminado correctamente."
      });
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo eliminar el historial."
      });
    }

    return true;
  }

  return false;
}