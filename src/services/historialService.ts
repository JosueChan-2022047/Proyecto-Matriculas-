import fs from "fs";
import path from "path";
import { Historial } from "../models/historial";

const rutaHistorialJson =
  process.env.HISTORIAL_JSON_PATH ??
  path.resolve(__dirname, "../data/historial.json");

const historiales: Historial[] = [];
let siguienteId = 1;

function cargarHistorialDesdeJson() {
  if (!fs.existsSync(rutaHistorialJson)) {
    fs.writeFileSync(rutaHistorialJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaHistorialJson, "utf8");

  if (!contenido.trim()) {
    fs.writeFileSync(rutaHistorialJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as Historial[];

  if (datos.length > 0) {
    datos.forEach(historial => historiales.push(historial));
    siguienteId =
      Math.max(...datos.map(historial => historial.id_historial), 0) + 1;
  }
}

function guardarHistorialEnJson() {
  fs.writeFileSync(
    rutaHistorialJson,
    JSON.stringify(historiales, null, 2),
    "utf8"
  );
}

cargarHistorialDesdeJson();

type HistorialRegistro = Omit<Historial, "id_historial">;

export function crearHistorial(
  historial: HistorialRegistro
): Historial {

  const nuevoHistorial: Historial = {
    id_historial: siguienteId++,
    ...historial
  };

  historiales.push(nuevoHistorial);
  guardarHistorialEnJson();

  return nuevoHistorial;
}

export function listarHistorial(): Historial[] {
  return historiales;
}

export function buscarHistorialPorId(
  id_historial: number
): Historial | undefined {

  return historiales.find(
    historial => historial.id_historial === id_historial
  );
}

export function buscarHistorialPorMatricula(
  id_matricula: number
): Historial[] {

  return historiales.filter(
    historial => historial.id_matricula === id_matricula
  );
}

export function buscarHistorialPorUsuario(
  id_usuario: number
): Historial[] {

  return historiales.filter(
    historial => historial.id_usuario === id_usuario
  );
}

export function actualizarHistorial(
  id_historial: number,
  datosActualizados: HistorialRegistro
): Historial | null {

  const indice = historiales.findIndex(
    historial => historial.id_historial === id_historial
  );

  if (indice === -1) {
    return null;
  }

  historiales[indice] = {
    ...historiales[indice],
    ...datosActualizados
  };

  guardarHistorialEnJson();

  return historiales[indice];
}

export function eliminarHistorial(
  id_historial: number
): boolean {

  const indice = historiales.findIndex(
    historial => historial.id_historial === id_historial
  );

  if (indice === -1) {
    return false;
  }

  historiales.splice(indice, 1);
  guardarHistorialEnJson();

  return true;
}