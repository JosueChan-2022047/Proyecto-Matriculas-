import { IncomingMessage, ServerResponse } from "http";
import {crearUsuario,listarUsuarios,buscarUsuarioPorId,actualizarUsuario,eliminarUsuario} from "../services/usuarioService";

export async function usuariosRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {

  const url = req.url ?? "";
  const metodo = req.method ?? "";

  // GET /usuarios
  if (metodo === "GET" && url === "/usuarios") {

    const usuarios = await listarUsuarios();

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(usuarios));

    return true;
  }

  // GET /usuarios/:id
  if (metodo === "GET" && url.startsWith("/usuarios/")) {

    const id = Number(url.split("/")[2]);

    const usuario = await buscarUsuarioPorId(id);

    if (!usuario) {
      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        mensaje: "Usuario no encontrado"
      }));

      return true;
    }

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(usuario));

    return true;
  }

  // POST /usuarios
  if (metodo === "POST" && url === "/usuarios") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {

      const datos = JSON.parse(body);

      const usuario = await crearUsuario(datos);

      res.writeHead(201, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify(usuario));

    });

    return true;
  }

  // PUT /usuarios/:id
  if (metodo === "PUT" && url.startsWith("/usuarios/")) {

    const id = Number(url.split("/")[2]);

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {

      const datos = JSON.parse(body);

      const usuario = await actualizarUsuario(id, datos);

      if (!usuario) {

        res.writeHead(404, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          mensaje: "Usuario no encontrado"
        }));

        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify(usuario));

    });

    return true;
  }

  // DELETE /usuarios/:id
  if (metodo === "DELETE" && url.startsWith("/usuarios/")) {

    const id = Number(url.split("/")[2]);

    const eliminado = await eliminarUsuario(id);

    if (!eliminado) {

      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        mensaje: "Usuario no encontrado"
      }));

      return true;
    }

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      mensaje: "Usuario eliminado correctamente"
    }));

    return true;
  }

  return false;
}