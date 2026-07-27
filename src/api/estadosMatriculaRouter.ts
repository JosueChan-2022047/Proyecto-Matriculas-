import { IncomingMessage, ServerResponse } from "http";
import {
  crearEstadoMatricula,
  listarEstadosMatricula,
  buscarEstadoMatriculaPorId,
  actualizarEstadoMatricula,
  eliminarEstadoMatricula
} from "../services/estadoMatriculaService";

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

function obtenerIdDesdeUrl(url: string): number | null {
  const partes = url.split("/");
  const id = Number(partes[2]);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
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
      reject(new Error("No se pudo leer la petición."));
    });
  });
}

export async function estadosMatriculaRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const metodo = req.method ?? "";
  const urlCompleta = req.url ?? "";
  const url = urlCompleta.split("?")[0];

  // GET /estados-matricula
  if (metodo === "GET" && url === "/estados-matricula") {
    try {
      const estados = await listarEstadosMatricula();
      responderJson(res, 200, estados);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudieron listar los estados de matrícula."
      });
    }

    return true;
  }

  // GET /estados-matricula/:id
  if (
    metodo === "GET" &&
    url.startsWith("/estados-matricula/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del estado no es válido."
      });

      return true;
    }

    try {
      const estado = await buscarEstadoMatriculaPorId(id);

      if (!estado) {
        responderJson(res, 404, {
          mensaje: "Estado de matrícula no encontrado."
        });

        return true;
      }

      responderJson(res, 200, estado);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo buscar el estado de matrícula."
      });
    }

    return true;
  }

  // POST /estados-matricula
  if (
    metodo === "POST" &&
    url === "/estados-matricula"
  ) {
    try {
      const datos = await leerBody(req);

      const nuevoEstado = await crearEstadoMatricula(
        datos as {
          nombre: string;
          descripcion: string;
        }
      );

      responderJson(res, 201, nuevoEstado);
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo crear el estado de matrícula.";

      responderJson(res, 400, { mensaje });
    }

    return true;
  }

  // PUT /estados-matricula/:id
  if (
    metodo === "PUT" &&
    url.startsWith("/estados-matricula/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del estado no es válido."
      });

      return true;
    }

    try {
      const datos = await leerBody(req);

      const estadoActualizado =
        await actualizarEstadoMatricula(
          id,
          datos as {
            nombre?: string;
            descripcion?: string;
          }
        );

      if (!estadoActualizado) {
        responderJson(res, 404, {
          mensaje: "Estado de matrícula no encontrado."
        });

        return true;
      }

      responderJson(res, 200, estadoActualizado);
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado.";

      responderJson(res, 400, { mensaje });
    }

    return true;
  }

  // DELETE /estados-matricula/:id
  if (
    metodo === "DELETE" &&
    url.startsWith("/estados-matricula/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del estado no es válido."
      });

      return true;
    }

    try {
      const eliminado = await eliminarEstadoMatricula(id);

      if (!eliminado) {
        responderJson(res, 404, {
          mensaje: "Estado de matrícula no encontrado."
        });

        return true;
      }

      responderJson(res, 200, {
        mensaje: "Estado de matrícula eliminado correctamente."
      });
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 409, {
          mensaje:
            "No se puede eliminar porque está asociado a una matrícula."
        });

        return true;
      }

      responderJson(res, 500, {
        mensaje: "No se pudo eliminar el estado de matrícula."
      });
    }

    return true;
  }

  return false;
}