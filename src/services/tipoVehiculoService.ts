import fs from "fs";
import path from "path";
import { TipoVehiculo } from "../models/tipoVehiculo";

const rutaTiposJson =
  process.env.TIPO_VEHICULO_JSON_PATH ??
  path.resolve(__dirname, "../data/tipoVehiculo.json");

const tiposVehiculo: TipoVehiculo[] = [];
let siguienteId = 1;

function cargarTiposVehiculoDesdeJson() {
  if (!fs.existsSync(rutaTiposJson)) {
    fs.writeFileSync(rutaTiposJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaTiposJson, "utf8");

  if (!contenido.trim()) {
    fs.writeFileSync(rutaTiposJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as TipoVehiculo[];

  if (datos.length > 0) {
    datos.forEach(tipo => tiposVehiculo.push(tipo));
    siguienteId = Math.max(...datos.map(tipo => tipo.id_tipo), 0) + 1;
  }
}

function guardarTiposVehiculoEnJson() {
  fs.writeFileSync(
    rutaTiposJson,
    JSON.stringify(tiposVehiculo, null, 2),
    "utf8"
  );
}

cargarTiposVehiculoDesdeJson();

type TipoVehiculoRegistro = Omit<TipoVehiculo, "id_tipo">;

export function crearTipoVehiculo(
  tipo: TipoVehiculoRegistro
): TipoVehiculo {

  const existe = tiposVehiculo.some(
    t => t.nombre.toLowerCase() === tipo.nombre.toLowerCase()
  );

  if (existe) {
    throw new Error("El tipo de vehículo ya existe.");
  }

  const nuevoTipo: TipoVehiculo = {
    id_tipo: siguienteId++,
    ...tipo
  };

  tiposVehiculo.push(nuevoTipo);
  guardarTiposVehiculoEnJson();

  return nuevoTipo;
}

export function listarTiposVehiculo(): TipoVehiculo[] {
  return tiposVehiculo;
}

export function buscarTipoVehiculoPorId(
  id_tipo: number
): TipoVehiculo | undefined {

  return tiposVehiculo.find(
    tipo => tipo.id_tipo === id_tipo
  );
}

export function actualizarTipoVehiculo(
  id_tipo: number,
  datosActualizados: TipoVehiculoRegistro
): TipoVehiculo | null {

  const indice = tiposVehiculo.findIndex(
    tipo => tipo.id_tipo === id_tipo
  );

  if (indice === -1) {
    return null;
  }

  tiposVehiculo[indice] = {
    ...tiposVehiculo[indice],
    ...datosActualizados
  };

  guardarTiposVehiculoEnJson();

  return tiposVehiculo[indice];
}

export function eliminarTipoVehiculo(
  id_tipo: number
): boolean {

  const indice = tiposVehiculo.findIndex(
    tipo => tipo.id_tipo === id_tipo
  );

  if (indice === -1) {
    return false;
  }

  tiposVehiculo.splice(indice, 1);

  guardarTiposVehiculoEnJson();

  return true;
}