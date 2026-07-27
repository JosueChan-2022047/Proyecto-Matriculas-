import { IncomingMessage, ServerResponse } from "http";
import {crearMatricula,listarMatriculas,buscarMatriculaPorId,buscarMatriculasPorVehiculo,actualizarMatricula,eliminarMatricula} from "../services/matriculaService";

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

export async function matriculasRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const metodo = req.method ?? "";
  const urlCompleta = req.url ?? "";
  const url = urlCompleta.split("?")[0];

  // GET /matriculas
  if (metodo === "GET" && url === "/matriculas") {
    try {
      const matriculas = await listarMatriculas();

      responderJson(res, 200, matriculas);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudieron listar las matrículas."
      });
    }

    return true;
  }

  // GET /matriculas/vehiculo/:id
  if (
    metodo === "GET" &&
    url.startsWith("/matriculas/vehiculo/")
  ) {
    const partes = url.split("/");
    const idVehiculo = Number(partes[3]);

    if (!Number.isInteger(idVehiculo) || idVehiculo <= 0) {
      responderJson(res, 400, {
        mensaje: "El ID del vehículo no es válido."
      });

      return true;
    }

    try {
      const matriculas =
        await buscarMatriculasPorVehiculo(idVehiculo);

      responderJson(res, 200, matriculas);
    } catch {
      responderJson(res, 500, {
        mensaje:
          "No se pudieron buscar las matrículas del vehículo."
      });
    }

    return true;
  }

  // GET /matriculas/:id
  if (
    metodo === "GET" &&
    url.startsWith("/matriculas/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID de la matrícula no es válido."
      });

      return true;
    }

    try {
      const matricula = await buscarMatriculaPorId(id);

      if (!matricula) {
        responderJson(res, 404, {
          mensaje: "Matrícula no encontrada."
        });

        return true;
      }

      responderJson(res, 200, matricula);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo buscar la matrícula."
      });
    }

    return true;
  }

  // POST /matriculas
  if (metodo === "POST" && url === "/matriculas") {
    try {
      const datos = await leerBody(req);

      const nuevaMatricula = await crearMatricula(
        datos as {
          id_vehiculo: number;
          id_estado: number;
          fecha_inicio: string;
          fecha_vencimiento: string;
          monto: number;
          fecha_pago?: string | null;
          comprobante?: string | null;
          notas?: string | null;
        }
      );

      responderJson(res, 201, nuevaMatricula);
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 400, {
          mensaje:
            "El vehículo o el estado de matrícula no existen."
        });

        return true;
      }

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo crear la matrícula.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // PUT /matriculas/:id
  if (
    metodo === "PUT" &&
    url.startsWith("/matriculas/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID de la matrícula no es válido."
      });

      return true;
    }

    try {
      const datos = await leerBody(req);

      const matriculaActualizada =
        await actualizarMatricula(
          id,
          datos as {
            id_vehiculo?: number;
            id_estado?: number;
            fecha_inicio?: string;
            fecha_vencimiento?: string;
            monto?: number;
            fecha_pago?: string | null;
            comprobante?: string | null;
            notas?: string | null;
          }
        );

      if (!matriculaActualizada) {
        responderJson(res, 404, {
          mensaje: "Matrícula no encontrada."
        });

        return true;
      }

      responderJson(res, 200, matriculaActualizada);
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 400, {
          mensaje:
            "El vehículo o el estado de matrícula no existen."
        });

        return true;
      }

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la matrícula.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // DELETE /matriculas/:id
  if (
    metodo === "DELETE" &&
    url.startsWith("/matriculas/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID de la matrícula no es válido."
      });

      return true;
    }

    try {
      const eliminada = await eliminarMatricula(id);

      if (!eliminada) {
        responderJson(res, 404, {
          mensaje: "Matrícula no encontrada."
        });

        return true;
      }

      responderJson(res, 200, {
        mensaje: "Matrícula eliminada correctamente."
      });
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 409, {
          mensaje:
            "No se puede eliminar la matrícula porque tiene datos relacionados."
        });

        return true;
      }

      responderJson(res, 500, {
        mensaje: "No se pudo eliminar la matrícula."
      });
    }

    return true;
  }

  return false;
}