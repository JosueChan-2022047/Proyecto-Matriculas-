import fs from "fs";
import path from "path";
import { EstadoMatricula } from "../models/estadoMatricula";

const rutaEstadosJson =
  process.env.ESTADO_MATRICULA_JSON_PATH ??
  path.resolve(__dirname, "../data/estadoMatricula.json");

const estadosMatricula: EstadoMatricula[] = [];
let siguienteId = 1;

function cargarEstadosDesdeJson() {
  if (!fs.existsSync(rutaEstadosJson)) {
    fs.writeFileSync(rutaEstadosJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaEstadosJson, "utf8");

  if (!contenido.trim()) {
    fs.writeFileSync(rutaEstadosJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as EstadoMatricula[];

  if (datos.length > 0) {
    datos.forEach(estado => estadosMatricula.push(estado));
    siguienteId = Math.max(...datos.map(estado => estado.id_estado), 0) + 1;
  }
}

function guardarEstadosEnJson() {
  fs.writeFileSync(
    rutaEstadosJson,
    JSON.stringify(estadosMatricula, null, 2),
    "utf8"
  );
}

cargarEstadosDesdeJson();

type EstadoRegistro = Omit<EstadoMatricula, "id_estado">;

export function crearEstadoMatricula(
  estado: EstadoRegistro
): EstadoMatricula {

  const existe = estadosMatricula.some(
    e => e.nombre.toLowerCase() === estado.nombre.toLowerCase()
  );

  if (existe) {
    throw new Error("El estado de matrícula ya existe.");
  }

  const nuevoEstado: EstadoMatricula = {
    id_estado: siguienteId++,
    ...estado
  };

  estadosMatricula.push(nuevoEstado);
  guardarEstadosEnJson();

  return nuevoEstado;
}

export function listarEstadosMatricula(): EstadoMatricula[] {
  return estadosMatricula;
}

export function buscarEstadoMatriculaPorId(
  id_estado: number
): EstadoMatricula | undefined {

  return estadosMatricula.find(
    estado => estado.id_estado === id_estado
  );
}

export function actualizarEstadoMatricula(
  id_estado: number,
  datosActualizados: EstadoRegistro
): EstadoMatricula | null {

  const indice = estadosMatricula.findIndex(
    estado => estado.id_estado === id_estado
  );

  if (indice === -1) {
    return null;
  }

  estadosMatricula[indice] = {
    ...estadosMatricula[indice],
    ...datosActualizados
  };

  guardarEstadosEnJson();

  return estadosMatricula[indice];
}

export function eliminarEstadoMatricula(
  id_estado: number
): boolean {

  const indice = estadosMatricula.findIndex(
    estado => estado.id_estado === id_estado
  );

  if (indice === -1) {
    return false;
  }

  estadosMatricula.splice(indice, 1);

  guardarEstadosEnJson();

  return true;
}