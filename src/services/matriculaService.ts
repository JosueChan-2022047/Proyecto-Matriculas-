import fs from "fs";
import path from "path";
import { Matricula } from "../models/matricula";

const rutaMatriculasJson =
  process.env.MATRICULA_JSON_PATH ??
  path.resolve(__dirname, "../data/matricula.json");

const matriculas: Matricula[] = [];
let siguienteId = 1;

function cargarMatriculasDesdeJson() {
  if (!fs.existsSync(rutaMatriculasJson)) {
    fs.writeFileSync(rutaMatriculasJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaMatriculasJson, "utf8");

  if (!contenido.trim()) {
    fs.writeFileSync(rutaMatriculasJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as Matricula[];

  if (datos.length > 0) {
    datos.forEach(matricula => matriculas.push(matricula));
    siguienteId =
      Math.max(...datos.map(matricula => matricula.id_matricula), 0) + 1;
  }
}

function guardarMatriculasEnJson() {
  fs.writeFileSync(
    rutaMatriculasJson,
    JSON.stringify(matriculas, null, 2),
    "utf8"
  );
}

cargarMatriculasDesdeJson();

type MatriculaRegistro = Omit<Matricula, "id_matricula" | "fecha_registro">;

export function crearMatricula(
  matricula: MatriculaRegistro
): Matricula {

  const nuevaMatricula: Matricula = {
    id_matricula: siguienteId++,
    ...matricula,
    fecha_registro: new Date()
  };

  matriculas.push(nuevaMatricula);
  guardarMatriculasEnJson();

  return nuevaMatricula;
}

export function listarMatriculas(): Matricula[] {
  return matriculas;
}

export function buscarMatriculaPorId(
  id_matricula: number
): Matricula | undefined {

  return matriculas.find(
    matricula => matricula.id_matricula === id_matricula
  );
}

export function buscarMatriculasPorVehiculo(
  id_vehiculo: number
): Matricula[] {

  return matriculas.filter(
    matricula => matricula.id_vehiculo === id_vehiculo
  );
}

export function actualizarMatricula(
  id_matricula: number,
  datosActualizados: MatriculaRegistro
): Matricula | null {

  const indice = matriculas.findIndex(
    matricula => matricula.id_matricula === id_matricula
  );

  if (indice === -1) {
    return null;
  }

  matriculas[indice] = {
    ...matriculas[indice],
    ...datosActualizados
  };

  guardarMatriculasEnJson();

  return matriculas[indice];
}

export function eliminarMatricula(
  id_matricula: number
): boolean {

  const indice = matriculas.findIndex(
    matricula => matricula.id_matricula === id_matricula
  );

  if (indice === -1) {
    return false;
  }

  matriculas.splice(indice, 1);

  guardarMatriculasEnJson();

  return true;
}