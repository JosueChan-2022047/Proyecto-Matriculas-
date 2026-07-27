import { IncomingMessage, ServerResponse } from "http";
import { crearVehiculo,listarVehiculos,buscarVehiculoPorId,actualizarVehiculo,eliminarVehiculo} from "../services/vehiculoService";

export async function vehiculosRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {

  const url = req.url ?? "";
  const metodo = req.method ?? "";

  // GET /vehiculos
  if (metodo === "GET" && url === "/vehiculos") {

    const vehiculos = await listarVehiculos();

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(vehiculos));

    return true;
  }

  // GET /vehiculos/:id
  if (metodo === "GET" && url.startsWith("/vehiculos/")) {

    const id = Number(url.split("/")[2]);

    const vehiculo = await buscarVehiculoPorId(id);

    if (!vehiculo) {

      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        mensaje: "Vehículo no encontrado"
      }));

      return true;
    }

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify(vehiculo));

    return true;
  }

  // POST /vehiculos
  if (metodo === "POST" && url === "/vehiculos") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {

      try {

        const datos = JSON.parse(body);

        const vehiculo = await crearVehiculo(datos);

        res.writeHead(201, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify(vehiculo));

      } catch (error: any) {

        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          mensaje: error.message
        }));

      }

    });

    return true;
  }

  // PUT /vehiculos/:id
  if (metodo === "PUT" && url.startsWith("/vehiculos/")) {

    const id = Number(url.split("/")[2]);

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {

      try {

        const datos = JSON.parse(body);

        const vehiculo = await actualizarVehiculo(id, datos);

        if (!vehiculo) {

          res.writeHead(404, {
            "Content-Type": "application/json"
          });

          res.end(JSON.stringify({
            mensaje: "Vehículo no encontrado"
          }));

          return;
        }

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify(vehiculo));

      } catch (error: any) {

        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          mensaje: error.message
        }));

      }

    });

    return true;
  }

  // DELETE /vehiculos/:id
  if (metodo === "DELETE" && url.startsWith("/vehiculos/")) {

    const id = Number(url.split("/")[2]);

    const eliminado = await eliminarVehiculo(id);

    if (!eliminado) {

      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        mensaje: "Vehículo no encontrado"
      }));

      return true;
    }

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      mensaje: "Vehículo eliminado correctamente"
    }));

    return true;
  }

  return false;
}