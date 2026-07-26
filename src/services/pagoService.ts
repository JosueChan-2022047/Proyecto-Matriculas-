import fs from "fs";
import path from "path";
import { Pago } from "../models/pago";

const rutaPagosJson =
  process.env.PAGO_JSON_PATH ??
  path.resolve(__dirname, "../data/pago.json");

const pagos: Pago[] = [];
let siguienteId = 1;

function cargarPagosDesdeJson() {
  if (!fs.existsSync(rutaPagosJson)) {
    fs.writeFileSync(rutaPagosJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaPagosJson, "utf8");

  if (!contenido.trim()) {
    fs.writeFileSync(rutaPagosJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as Pago[];

  if (datos.length > 0) {
    datos.forEach(pago => pagos.push(pago));
    siguienteId =
      Math.max(...datos.map(pago => pago.id_pago), 0) + 1;
  }
}

function guardarPagosEnJson() {
  fs.writeFileSync(
    rutaPagosJson,
    JSON.stringify(pagos, null, 2),
    "utf8"
  );
}

cargarPagosDesdeJson();

type PagoRegistro = Omit<Pago, "id_pago">;

export function crearPago(
  pago: PagoRegistro
): Pago {

  const nuevoPago: Pago = {
    id_pago: siguienteId++,
    ...pago
  };

  pagos.push(nuevoPago);
  guardarPagosEnJson();

  return nuevoPago;
}

export function listarPagos(): Pago[] {
  return pagos;
}

export function buscarPagoPorId(
  id_pago: number
): Pago | undefined {

  return pagos.find(
    pago => pago.id_pago === id_pago
  );
}

export function buscarPagosPorMatricula(
  id_matricula: number
): Pago[] {

  return pagos.filter(
    pago => pago.id_matricula === id_matricula
  );
}

export function actualizarPago(
  id_pago: number,
  datosActualizados: PagoRegistro
): Pago | null {

  const indice = pagos.findIndex(
    pago => pago.id_pago === id_pago
  );

  if (indice === -1) {
    return null;
  }

  pagos[indice] = {
    ...pagos[indice],
    ...datosActualizados
  };

  guardarPagosEnJson();

  return pagos[indice];
}

export function eliminarPago(
  id_pago: number
): boolean {

  const indice = pagos.findIndex(
    pago => pago.id_pago === id_pago
  );

  if (indice === -1) {
    return false;
  }

  pagos.splice(indice, 1);

  guardarPagosEnJson();

  return true;
}