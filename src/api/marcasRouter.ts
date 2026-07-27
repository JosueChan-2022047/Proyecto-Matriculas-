import { IncomingMessage, ServerResponse } from "http";
import {crearMarca,listarMarcas,buscarMarcaPorId,actualizarMarca,eliminarMarca} from "../services/marcaService";

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

export async function marcasRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const metodo = req.method ?? "";
  const urlCompleta = req.url ?? "";
  const url = urlCompleta.split("?")[0];

  // GET /marcas
  if (metodo === "GET" && url === "/marcas") {
    try {
      const marcas = await listarMarcas();
      responderJson(res, 200, marcas);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudieron listar las marcas."
      });
    }

    return true;
  }

  // GET /marcas/:id
  if (metodo === "GET" && url.startsWith("/marcas/")) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID de la marca no es válido."
      });

      return true;
    }

    try {
      const marca = await buscarMarcaPorId(id);

      if (!marca) {
        responderJson(res, 404, {
          mensaje: "Marca no encontrada."
        });

        return true;
      }

      responderJson(res, 200, marca);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo buscar la marca."
      });
    }

    return true;
  }

  // POST /marcas
  if (metodo === "POST" && url === "/marcas") {
    try {
      const datos = await leerBody(req);
      const nuevaMarca = await crearMarca(datos as { nombre: string });

      responderJson(res, 201, nuevaMarca);
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo crear la marca.";

      responderJson(res, 400, { mensaje });
    }

    return true;
  }

  // PUT /marcas/:id
  if (metodo === "PUT" && url.startsWith("/marcas/")) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID de la marca no es válido."
      });

      return true;
    }

    try {
      const datos = await leerBody(req);
      const marcaActualizada = await actualizarMarca(
        id,
        datos as { nombre?: string }
      );

      if (!marcaActualizada) {
        responderJson(res, 404, {
          mensaje: "Marca no encontrada."
        });

        return true;
      }

      responderJson(res, 200, marcaActualizada);
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la marca.";

      responderJson(res, 400, { mensaje });
    }

    return true;
  }

  // DELETE /marcas/:id
  if (metodo === "DELETE" && url.startsWith("/marcas/")) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID de la marca no es válido."
      });

      return true;
    }

    try {
      const eliminada = await eliminarMarca(id);

      if (!eliminada) {
        responderJson(res, 404, {
          mensaje: "Marca no encontrada."
        });

        return true;
      }

      responderJson(res, 200, {
        mensaje: "Marca eliminada correctamente."
      });
    } catch (error: any) {
      if (error.code === "23503") {
        responderJson(res, 409, {
          mensaje:
            "No se puede eliminar la marca porque está asociada a uno o más vehículos."
        });

        return true;
      }

      responderJson(res, 500, {
        mensaje: "No se pudo eliminar la marca."
      });
    }

    return true;
  }

  return false;
}