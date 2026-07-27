import { IncomingMessage, ServerResponse } from "http";
import {crearDocumento,listarDocumentos,buscarDocumentoPorId,buscarDocumentosPorMatricula,actualizarDocumento,eliminarDocumento} from "../services/documentoService";

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

export async function documentosRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const metodo = req.method ?? "";
  const urlCompleta = req.url ?? "";
  const url = urlCompleta.split("?")[0];

  // GET /documentos
  if (metodo === "GET" && url === "/documentos") {
    try {
      const documentos = await listarDocumentos();

      responderJson(res, 200, documentos);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudieron listar los documentos."
      });
    }

    return true;
  }

  // GET /documentos/matricula/:id
  if (
    metodo === "GET" &&
    url.startsWith("/documentos/matricula/")
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
      const documentos =
        await buscarDocumentosPorMatricula(idMatricula);

      responderJson(res, 200, documentos);
    } catch {
      responderJson(res, 500, {
        mensaje:
          "No se pudieron buscar los documentos de la matrícula."
      });
    }

    return true;
  }

  // GET /documentos/:id
  if (
    metodo === "GET" &&
    url.startsWith("/documentos/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del documento no es válido."
      });

      return true;
    }

    try {
      const documento = await buscarDocumentoPorId(id);

      if (!documento) {
        responderJson(res, 404, {
          mensaje: "Documento no encontrado."
        });

        return true;
      }

      responderJson(res, 200, documento);
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo buscar el documento."
      });
    }

    return true;
  }

  // POST /documentos
  if (metodo === "POST" && url === "/documentos") {
    try {
      const datos = await leerBody(req);

      const nuevoDocumento = await crearDocumento(
        datos as {
          id_matricula: number;
          tipo: string;
          contenido: string;
          fecha: string;
          estado: string;
        }
      );

      responderJson(res, 201, nuevoDocumento);
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
          : "No se pudo crear el documento.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // PUT /documentos/:id
  if (
    metodo === "PUT" &&
    url.startsWith("/documentos/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del documento no es válido."
      });

      return true;
    }

    try {
      const datos = await leerBody(req);

      const documentoActualizado =
        await actualizarDocumento(
          id,
          datos as {
            id_matricula?: number;
            tipo?: string;
            contenido?: string;
            fecha?: string;
            estado?: string;
          }
        );

      if (!documentoActualizado) {
        responderJson(res, 404, {
          mensaje: "Documento no encontrado."
        });

        return true;
      }

      responderJson(res, 200, documentoActualizado);
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
          : "No se pudo actualizar el documento.";

      responderJson(res, 400, {
        mensaje
      });
    }

    return true;
  }

  // DELETE /documentos/:id
  if (
    metodo === "DELETE" &&
    url.startsWith("/documentos/")
  ) {
    const id = obtenerIdDesdeUrl(url);

    if (id === null) {
      responderJson(res, 400, {
        mensaje: "El ID del documento no es válido."
      });

      return true;
    }

    try {
      const eliminado = await eliminarDocumento(id);

      if (!eliminado) {
        responderJson(res, 404, {
          mensaje: "Documento no encontrado."
        });

        return true;
      }

      responderJson(res, 200, {
        mensaje: "Documento eliminado correctamente."
      });
    } catch {
      responderJson(res, 500, {
        mensaje: "No se pudo eliminar el documento."
      });
    }

    return true;
  }

  return false;
}