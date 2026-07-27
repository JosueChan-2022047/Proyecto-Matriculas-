import { pool } from "../database/connection";
import { Marca } from "../models/marca";

type MarcaRegistro = Omit<Marca, "id_marca">;

export async function crearMarca(
  datos: MarcaRegistro
): Promise<Marca> {

  if (!datos.nombre || !datos.nombre.trim()) {
    throw new Error("El nombre de la marca es obligatorio.");
  }

  const marcaExistente = await pool.query(
    `
      SELECT id_marca
      FROM marca
      WHERE LOWER(nombre) = LOWER($1)
    `,
    [datos.nombre.trim()]
  );

  if ((marcaExistente.rowCount ?? 0) > 0) {
    throw new Error("La marca ya existe.");
  }

  const resultado = await pool.query(
    `
      INSERT INTO marca (nombre)
      VALUES ($1)
      RETURNING *;
    `,
    [datos.nombre.trim()]
  );

  return resultado.rows[0];
}

export async function listarMarcas(): Promise<Marca[]> {

  const resultado = await pool.query(
    `
      SELECT *
      FROM marca
      ORDER BY id_marca ASC;
    `
  );

  return resultado.rows;
}

export async function buscarMarcaPorId(
  id_marca: number
): Promise<Marca | null> {

  const resultado = await pool.query(
    `
      SELECT *
      FROM marca
      WHERE id_marca = $1;
    `,
    [id_marca]
  );

  return resultado.rows[0] ?? null;
}

export async function actualizarMarca(
  id_marca: number,
  datos: Partial<MarcaRegistro>
): Promise<Marca | null> {

  const marcaActual = await buscarMarcaPorId(id_marca);

  if (!marcaActual) {
    return null;
  }

  const nuevoNombre = datos.nombre?.trim() ?? marcaActual.nombre;

  if (!nuevoNombre) {
    throw new Error("El nombre de la marca es obligatorio.");
  }

  const marcaDuplicada = await pool.query(
    `
      SELECT id_marca
      FROM marca
      WHERE LOWER(nombre) = LOWER($1)
        AND id_marca <> $2;
    `,
    [nuevoNombre, id_marca]
  );

  if ((marcaDuplicada.rowCount ?? 0) > 0) {
    throw new Error("Ya existe otra marca con ese nombre.");
  }

  const resultado = await pool.query(
    `
      UPDATE marca
      SET nombre = $1
      WHERE id_marca = $2
      RETURNING *;
    `,
    [nuevoNombre, id_marca]
  );

  return resultado.rows[0] ?? null;
}

export async function eliminarMarca(
  id_marca: number
): Promise<boolean> {

  const resultado = await pool.query(
    `
      DELETE FROM marca
      WHERE id_marca = $1;
    `,
    [id_marca]
  );

  return (resultado.rowCount ?? 0) > 0;
}