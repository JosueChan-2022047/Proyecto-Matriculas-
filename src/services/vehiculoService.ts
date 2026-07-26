import fs from "fs";
import path from "path";
import { Vehiculo } from "../models/vehiculo";

const rutaVehiculosJson =
  process.env.VEHICULO_JSON_PATH ??
  path.resolve(__dirname, "../data/vehiculo.json");

const vehiculos: Vehiculo[] = [];
let siguienteId = 1;

function cargarVehiculosDesdeJson() {
  if (!fs.existsSync(rutaVehiculosJson)) {
    fs.writeFileSync(rutaVehiculosJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaVehiculosJson, "utf8");

  if (!contenido.trim()) {
    fs.writeFileSync(rutaVehiculosJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as Vehiculo[];

  if (datos.length > 0) {
    datos.forEach(vehiculo => vehiculos.push(vehiculo));
    siguienteId =
      Math.max(...datos.map(vehiculo => vehiculo.id_vehiculo), 0) + 1;
  }
}

function guardarVehiculosEnJson() {
  fs.writeFileSync(
    rutaVehiculosJson,
    JSON.stringify(vehiculos, null, 2),
    "utf8"
  );
}

cargarVehiculosDesdeJson();

type VehiculoRegistro = Omit<Vehiculo, "id_vehiculo" | "fecha_registro">;

export function crearVehiculo(
  vehiculo: VehiculoRegistro
): Vehiculo {
    
    const placaExiste = vehiculos.some(
  v => v.placa.toUpperCase() === vehiculo.placa.toUpperCase()
);

if (placaExiste) {
  throw new Error("La placa ya está registrada.");
}

  const nuevoVehiculo: Vehiculo = {
    id_vehiculo: siguienteId++,
    ...vehiculo,
    fecha_registro: new Date()
  };

  vehiculos.push(nuevoVehiculo);
  guardarVehiculosEnJson();

  return nuevoVehiculo;
}

export function listarVehiculos(): Vehiculo[] {
  return vehiculos;
}

export function buscarVehiculoPorId(
  id_vehiculo: number
): Vehiculo | undefined {

  return vehiculos.find(
    vehiculo => vehiculo.id_vehiculo === id_vehiculo
  );
}

export function actualizarVehiculo(
  id_vehiculo: number,
  datosActualizados: Omit<Vehiculo, "id_vehiculo" | "fecha_registro">
): Vehiculo | null {

  const indice = vehiculos.findIndex(
    vehiculo => vehiculo.id_vehiculo === id_vehiculo
  );

  if (indice === -1) {
    return null;
  }

  vehiculos[indice] = {
    ...vehiculos[indice],
    ...datosActualizados
  };

  guardarVehiculosEnJson();

  return vehiculos[indice];
}

export function eliminarVehiculo(
  id_vehiculo: number
): boolean {

  const indice = vehiculos.findIndex(
    vehiculo => vehiculo.id_vehiculo === id_vehiculo
  );

  if (indice === -1) {
    return false;
  }

  vehiculos.splice(indice, 1);

  guardarVehiculosEnJson();

  return true;
}

export function buscarVehiculosPorUsuario(
  id_usuario: number
): Vehiculo[] {

  return vehiculos.filter(
    vehiculo => vehiculo.id_usuario === id_usuario
  );
}