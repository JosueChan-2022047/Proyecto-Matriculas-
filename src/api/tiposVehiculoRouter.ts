import { IncomingMessage, ServerResponse } from "http";
import { crearTipoVehiculo, listarTiposVehiculo, buscarTipoVehiculoPorId, actualizarTipoVehiculo, eliminarTipoVehiculo
} from "../services/tipoVehiculoService";

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
      reject(new Error("No se pudo leer el cuerpo de la petición."));
    });
  });
}

export async function tiposVehiculoRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const metodo = req.method ?? "";
  const urlCompleta = req.url ?? "";
  const url = urlCompleta.split("?")[0];

  // GET /tipos-vehiculo
  if (metodo === "GET" && url === "/tipos-vehiculo") {
    try {
      const tipos = await listarTiposVehiculo();
      responderJson(res, 200, tipos);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudieron listar los tipos de vehículo."
      });
    }

    return true;
  }

  // GET /tipos-vehiculo/:id
  if (metodo === "GET" && url.startsWith("/tipos-vehiculo/")) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del tipo de vehículo no es válido."
      });

      return true;
    }

    try {
      const tipo = await buscarTipoVehiculoPorId(id);

      if (!tipo) {
        responderJson(res, 404, {
          mensaje: "Tipo de vehículo no encontrado."
        });

        return true;
      }

      responderJson(res, 200, tipo);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo buscar el tipo de vehículo."
      });
    }

    return true;
  }

  // POST /tipos-vehiculo
  if (metodo === "POST" && url === "/tipos-vehiculo") {
    try {
      const datos = await leerBody(req);

      const nuevoTipo = await crearTipoVehiculo(
        datos as {
          nombre: string;
          descripcion?: string;
        }
      );

      responderJson(res, 201, nuevoTipo);
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo crear el tipo de vehículo.";

      responderJson(res, 400, { mensaje });
    }

    return true;
  }

  // PUT /tipos-vehiculo/:id
  if (metodo === "PUT" && url.startsWith("/tipos-vehiculo/")) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del tipo de vehículo no es válido."
      });

      return true;
    }

    try {
      const datos = await leerBody(req);

      const tipoActualizado = await actualizarTipoVehiculo(
        id,
        datos as {
          nombre?: string;
          descripcion?: string;
        }
      );

      if (!tipoActualizado) {
        responderJson(res, 404, {
          mensaje: "Tipo de vehículo no encontrado."
        });

        return true;
      }

      responderJson(res, 200, tipoActualizado);
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el tipo de vehículo.";

      responderJson(res, 400, { mensaje });
    }

    return true;
  }

  // DELETE /tipos-vehiculo/:id
  if (metodo === "DELETE" && url.startsWith("/tipos-vehiculo/")) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del tipo de vehículo no es válido."
      });

      return true;
    }

    try {
      const eliminado = await eliminarTipoVehiculo(id);

      if (!eliminado) {
        responderJson(res, 404, {
          mensaje: "Tipo de vehículo no encontrado."
        });

        return true;
      }

      responderJson(res, 200, {
        mensaje: "Tipo de vehículo eliminado correctamente."
      });
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 409, {
          mensaje:
            "No se puede eliminar el tipo de vehículo porque está asociado a uno o más vehículos."
        });

        return true;
      }

      responderJson(res, 500, {
        mensaje: "No se pudo eliminar el tipo de vehículo."
      });
    }

    return true;
  }

  return false;
}