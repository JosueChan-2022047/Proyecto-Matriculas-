import { pool } from "../database/connection";
import { Historial } from "../models/historial";

type HistorialRegistro = {
  id_matricula: number;
  id_usuario: number;
  accion: string;
  descripcion: string;
  fecha: string;
  valores_old?: string | null;
  valores_new?: string | null;
};

export async function crearHistorial(
  datos: HistorialRegistro
): Promise<Historial> {
  const resultado = await pool.query(
    `
      INSERT INTO historial (
        id_matricula,
        id_usuario,
        accion,
        descripcion,
        fecha,
        valores_old,
        valores_new
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `,
    [
      datos.id_matricula,
      datos.id_usuario,
      datos.accion,
      datos.descripcion,
      datos.fecha,
      datos.valores_old ?? null,
      datos.valores_new ?? null
    ]
  );

  return resultado.rows[0];
}

export async function listarHistorial(): Promise<Historial[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM historial
      ORDER BY id_historial ASC;
    `
  );

  return resultado.rows;
}

export async function buscarHistorialPorId(
  id_historial: number
): Promise<Historial | null> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM historial
      WHERE id_historial = $1;
    `,
    [id_historial]
  );

  return resultado.rows[0] ?? null;
}

export async function buscarHistorialPorMatricula(
  id_matricula: number
): Promise<Historial[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM historial
      WHERE id_matricula = $1
      ORDER BY id_historial ASC;
    `,
    [id_matricula]
  );

  return resultado.rows;
}

export async function buscarHistorialPorUsuario(
  id_usuario: number
): Promise<Historial[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM historial
      WHERE id_usuario = $1
      ORDER BY id_historial ASC;
    `,
    [id_usuario]
  );

  return resultado.rows;
}

export async function actualizarHistorial(
  id_historial: number,
  datos: Partial<HistorialRegistro>
): Promise<Historial | null> {
  const resultado = await pool.query(
    `
      UPDATE historial
      SET
        id_matricula = COALESCE($1, id_matricula),
        id_usuario = COALESCE($2, id_usuario),
        accion = COALESCE($3, accion),
        descripcion = COALESCE($4, descripcion),
        fecha = COALESCE($5, fecha),
        valores_old = COALESCE($6, valores_old),
        valores_new = COALESCE($7, valores_new)
      WHERE id_historial = $8
      RETURNING *;
    `,
    [
      datos.id_matricula ?? null,
      datos.id_usuario ?? null,
      datos.accion ?? null,
      datos.descripcion ?? null,
      datos.fecha ?? null,
      datos.valores_old ?? null,
      datos.valores_new ?? null,
      id_historial
    ]
  );

  return resultado.rows[0] ?? null;
}

export async function eliminarHistorial(
  id_historial: number
): Promise<boolean> {
  const resultado = await pool.query(
    `
      DELETE FROM historial
      WHERE id_historial = $1;
    `,
    [id_historial]
  );

  return (resultado.rowCount ?? 0) > 0;
}