import fs from "fs";
import path from "path";
import { Marca } from "../models/marca";

const rutaMarcasJson =
  process.env.MARCA_JSON_PATH ??
  path.resolve(__dirname, "../data/marca.json");

const marcas: Marca[] = [];
let siguienteId = 1;

function cargarMarcasDesdeJson() {
  if (!fs.existsSync(rutaMarcasJson)) {
    fs.writeFileSync(rutaMarcasJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaMarcasJson, "utf8");

  if (!contenido.trim()) {
    fs.writeFileSync(rutaMarcasJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as Marca[];

  if (datos.length > 0) {
    datos.forEach(marca => marcas.push(marca));
    siguienteId = Math.max(...datos.map(marca => marca.id_marca), 0) + 1;
  }
}

function guardarMarcasEnJson() {
  fs.writeFileSync(
    rutaMarcasJson,
    JSON.stringify(marcas, null, 2),
    "utf8"
  );
}

cargarMarcasDesdeJson();

type MarcaRegistro = Omit<Marca, "id_marca">;

export function crearMarca(marca: MarcaRegistro): Marca {

  const existe = marcas.some(
    m => m.nombre.toLowerCase() === marca.nombre.toLowerCase()
  );

  if (existe) {
    throw new Error("La marca ya existe.");
  }

  const nuevaMarca: Marca = {
    id_marca: siguienteId++,
    ...marca
  };

  marcas.push(nuevaMarca);
  guardarMarcasEnJson();

  return nuevaMarca;
}

export function listarMarcas(): Marca[] {
  return marcas;
}

export function buscarMarcaPorId(id_marca: number): Marca | undefined {
  return marcas.find(marca => marca.id_marca === id_marca);
}

export function actualizarMarca(
  id_marca: number,
  datosActualizados: MarcaRegistro
): Marca | null {

  const indice = marcas.findIndex(
    marca => marca.id_marca === id_marca
  );

  if (indice === -1) {
    return null;
  }

  marcas[indice] = {
    ...marcas[indice],
    ...datosActualizados
  };

  guardarMarcasEnJson();

  return marcas[indice];
}

export function eliminarMarca(id_marca: number): boolean {

  const indice = marcas.findIndex(
    marca => marca.id_marca === id_marca
  );

  if (indice === -1) {
    return false;
  }

  marcas.splice(indice, 1);

  guardarMarcasEnJson();

  return true;
}