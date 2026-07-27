import { IncomingMessage, ServerResponse } from "http";
import { crearNotificacion, listarNotificaciones, buscarNotificacionPorId,buscarNotificacionesPorUsuario,buscarNotificacionesPorMatricula,actualizarNotificacion,eliminarNotificacion} from "../services/notificacionService";

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

export async function notificacionesRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const metodo = req.method ?? "";
  const urlCompleta = req.url ?? "";
  const url = urlCompleta.split("?")[0];

  // GET /notificaciones
  if (metodo === "GET" && url === "/notificaciones") {
    try {
      const notificaciones = await listarNotificaciones();

      responderJson(res, 200, notificaciones);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudieron listar las notificaciones."
      });
    }

    return true;
  }

  // GET /notificaciones/usuario/:id
  if (
    metodo === "GET" &&
    url.startsWith("/notificaciones/usuario/")
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
      const notificaciones =
        await buscarNotificacionesPorUsuario(idUsuario);

      responderJson(res, 200, notificaciones);
    } catch {
      responderJson(res, 500, {
        mensaje:
          "No se pudieron buscar las notificaciones del usuario."
      });
    }

    return true;
  }

  // GET /notificaciones/matricula/:id
  if (
    metodo === "GET" &&
    url.startsWith("/notificaciones/matricula/")
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
      const notificaciones =
        await buscarNotificacionesPorMatricula(idMatricula);

      responderJson(res, 200, notificaciones);
    } catch {
      responderJson(res, 500, {
        mensaje:
          "No se pudieron buscar las notificaciones de la matrícula."
      });
    }

    return true;
  }

  // GET /notificaciones/:id
  if (
    metodo === "GET" &&
    url.startsWith("/notificaciones/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID de la notificación no es válido."
      });

      return true;
    }

    try {
      const notificacion = await buscarNotificacionPorId(id);

      if (!notificacion) {
        responderJson(res, 404, {
          mensaje: "Notificación no encontrada."
        });

        return true;
      }

      responderJson(res, 200, notificacion);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo buscar la notificación."
      });
    }

    return true;
  }

  // POST /notificaciones
  if (metodo === "POST" && url === "/notificaciones") {
    try {
      const datos = await leerBody(req);

      const nuevaNotificacion = await crearNotificacion(
        datos as {
          id_usuario: number;
          id_matricula: number;
          mensaje: string;
          tipo: string;
          fecha: string;
          estado: string;
        }
      );

      responderJson(res, 201, nuevaNotificacion);
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 400, {
          mensaje:
            "El usuario o la matrícula indicados no existen."
        });

        return true;
      }

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo crear la notificación.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // PUT /notificaciones/:id
  if (
    metodo === "PUT" &&
    url.startsWith("/notificaciones/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID de la notificación no es válido."
      });

      return true;
    }

    try {
      const datos = await leerBody(req);

      const notificacionActualizada =
        await actualizarNotificacion(
          id,
          datos as {
            id_usuario?: number;
            id_matricula?: number;
            mensaje?: string;
            tipo?: string;
            fecha?: string;
            estado?: string;
          }
        );

      if (!notificacionActualizada) {
        responderJson(res, 404, {
          mensaje: "Notificación no encontrada."
        });

        return true;
      }

      responderJson(res, 200, notificacionActualizada);
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 400, {
          mensaje:
            "El usuario o la matrícula indicados no existen."
        });

        return true;
      }

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la notificación.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // DELETE /notificaciones/:id
  if (
    metodo === "DELETE" &&
    url.startsWith("/notificaciones/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID de la notificación no es válido."
      });

      return true;
    }

    try {
      const eliminada = await eliminarNotificacion(id);

      if (!eliminada) {
        responderJson(res, 404, {
          mensaje: "Notificación no encontrada."
        });

        return true;
      }

      responderJson(res, 200, {
        mensaje: "Notificación eliminada correctamente."
      });
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo eliminar la notificación."
      });
    }

    return true;
  }

  return false;
}