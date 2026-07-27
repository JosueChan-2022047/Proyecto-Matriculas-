import http from "http";
import { usuariosRouter } from "./usuariosRouter";
import { vehiculosRouter } from "./vehiculosRouter";
import { marcasRouter } from "./marcasRouter";
import { tiposVehiculoRouter } from "./tiposVehiculoRouter";
import { estadosMatriculaRouter } from "./estadosMatriculaRouter";
import { matriculasRouter } from "./matriculasRouter";
import { pagosRouter } from "./pagosRouter";
import { documentosRouter } from "./documentosRouter";
import { historialesRouter } from "./historialesRouter";
import { notificacionesRouter } from "./notificacionesRouter";

const PORT = 3000;

export function iniciarServidor() {
  const server = http.createServer(async (req, res) => {
    try {
      if (await usuariosRouter(req, res)) {
        return;
      }

      if (await vehiculosRouter(req, res)) {
        return;
      }

      if (await marcasRouter(req, res)) {
        return;
      }

      if (await tiposVehiculoRouter(req, res)) {
        return;
      }

      if (await estadosMatriculaRouter(req, res)) {
        return;
      }

      if (await matriculasRouter(req, res)) {
        return;
      }

      if (await pagosRouter(req, res)) {
        return;
      }

      if (await documentosRouter(req, res)) {
        return;
      }

      if (await historialesRouter(req, res)) {
        return;
      }

      if (await notificacionesRouter(req, res)) {
        return;
      }

      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      res.end(
        JSON.stringify({
          mensaje: "Ruta no encontrada"
        })
      );
    } catch (error) {
      console.error("Error en el servidor:", error);

      if (!res.headersSent) {
        res.writeHead(500, {
          "Content-Type": "application/json"
        });
      }

      res.end(
        JSON.stringify({
          mensaje: "Error interno del servidor"
        })
      );
    }
  });

  server.listen(PORT, () => {
    console.log(
      `Servidor ejecutándose en http://localhost:${PORT}`
    );
  });
}