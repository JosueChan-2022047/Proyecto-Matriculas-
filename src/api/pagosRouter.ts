import { IncomingMessage, ServerResponse } from "http";
import {crearPago, listarPagos, buscarPagoPorId, buscarPagosPorMatricula, actualizarPago, eliminarPago} from "../services/pagoService";

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

export async function pagosRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const metodo = req.method ?? "";
  const urlCompleta = req.url ?? "";
  const url = urlCompleta.split("?")[0];

  // GET /pagos
  if (metodo === "GET" && url === "/pagos") {
    try {
      const pagos = await listarPagos();

      responderJson(res, 200, pagos);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudieron listar los pagos."
      });
    }

    return true;
  }

  // GET /pagos/matricula/:id
  if (
    metodo === "GET" &&
    url.startsWith("/pagos/matricula/")
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
      const pagos = await buscarPagosPorMatricula(idMatricula);

      responderJson(res, 200, pagos);
    } catch {
      responderJson(res, 500, {
        mensaje:
          "No se pudieron buscar los pagos de la matrícula."
      });
    }

    return true;
  }

  // GET /pagos/:id
  if (
    metodo === "GET" &&
    url.startsWith("/pagos/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del pago no es válido."
      });

      return true;
    }

    try {
      const pago = await buscarPagoPorId(id);

      if (!pago) {
        responderJson(res, 404, {
          mensaje: "Pago no encontrado."
        });

        return true;
      }

      responderJson(res, 200, pago);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo buscar el pago."
      });
    }

    return true;
  }

  // POST /pagos
  if (metodo === "POST" && url === "/pagos") {
    try {
      const datos = await leerBody(req);

      const nuevoPago = await crearPago(
        datos as {
          id_matricula: number;
          monto: number;
          fecha_pago: string;
          metodo_pago: string;
          estado: string;
          transaccion?: string | null;
        }
      );

      responderJson(res, 201, nuevoPago);
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 400, {
          mensaje: "La matrícula indicada no existe."
        });

        return true;
      }

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo crear el pago.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // PUT /pagos/:id
  if (
    metodo === "PUT" &&
    url.startsWith("/pagos/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del pago no es válido."
      });

      return true;
    }

    try {
      const datos = await leerBody(req);

      const pagoActualizado = await actualizarPago(
        id,
        datos as {
          id_matricula?: number;
          monto?: number;
          fecha_pago?: string;
          metodo_pago?: string;
          estado?: string;
          transaccion?: string | null;
        }
      );

      if (!pagoActualizado) {
        responderJson(res, 404, {
          mensaje: "Pago no encontrado."
        });

        return true;
      }

      responderJson(res, 200, pagoActualizado);
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 400, {
          mensaje: "La matrícula indicada no existe."
        });

        return true;
      }

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el pago.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // DELETE /pagos/:id
  if (
    metodo === "DELETE" &&
    url.startsWith("/pagos/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del pago no es válido."
      });

      return true;
    }

    try {
      const eliminado = await eliminarPago(id);

      if (!eliminado) {
        responderJson(res, 404, {
          mensaje: "Pago no encontrado."
        });

        return true;
      }

      responderJson(res, 200, {
        mensaje: "Pago eliminado correctamente."
      });
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo eliminar el pago."
      });
    }

    return true;
  }

  return false;
}