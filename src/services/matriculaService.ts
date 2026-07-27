import { pool } from "../database/connection";
import { Matricula } from "../models/matricula";

type MatriculaRegistro = {
  id_vehiculo: number;
  id_estado: number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  monto: number;
  fecha_pago?: string | null;
  comprobante?: string | null;
  notas?: string | null;
};

export async function crearMatricula(
  datos: MatriculaRegistro
): Promise<Matricula> {
  const resultado = await pool.query(
    `
      INSERT INTO matricula (
        id_vehiculo,
        id_estado,
        fecha_inicio,
        fecha_vencimiento,
        monto,
        fecha_pago,
        comprobante,
        notas
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
    [
      datos.id_vehiculo,
      datos.id_estado,
      datos.fecha_inicio,
      datos.fecha_vencimiento,
      datos.monto,
      datos.fecha_pago ?? null,
      datos.comprobante ?? null,
      datos.notas ?? null
    ]
  );

  return resultado.rows[0];
}

export async function listarMatriculas(): Promise<Matricula[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM matricula
      ORDER BY id_matricula ASC;
    `
  );

  return resultado.rows;
}

export async function buscarMatriculaPorId(
  id_matricula: number
): Promise<Matricula | null> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM matricula
      WHERE id_matricula = $1;
    `,
    [id_matricula]
  );

  return resultado.rows[0] ?? null;
}

export async function buscarMatriculasPorVehiculo(
  id_vehiculo: number
): Promise<Matricula[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM matricula
      WHERE id_vehiculo = $1
      ORDER BY id_matricula ASC;
    `,
    [id_vehiculo]
  );

  return resultado.rows;
}

export async function actualizarMatricula(
  id_matricula: number,
  datos: Partial<MatriculaRegistro>
): Promise<Matricula | null> {
  const resultado = await pool.query(
    `
      UPDATE matricula
      SET
        id_vehiculo = COALESCE($1, id_vehiculo),
        id_estado = COALESCE($2, id_estado),
        fecha_inicio = COALESCE($3, fecha_inicio),
        fecha_vencimiento = COALESCE($4, fecha_vencimiento),
        monto = COALESCE($5, monto),
        fecha_pago = COALESCE($6, fecha_pago),
        comprobante = COALESCE($7, comprobante),
        notas = COALESCE($8, notas)
      WHERE id_matricula = $9
      RETURNING *;
    `,
    [
      datos.id_vehiculo ?? null,
      datos.id_estado ?? null,
      datos.fecha_inicio ?? null,
      datos.fecha_vencimiento ?? null,
      datos.monto ?? null,
      datos.fecha_pago ?? null,
      datos.comprobante ?? null,
      datos.notas ?? null,
      id_matricula
    ]
  );

  return resultado.rows[0] ?? null;
}

export async function eliminarMatricula(
  id_matricula: number
): Promise<boolean> {
  const resultado = await pool.query(
    `
      DELETE FROM matricula
      WHERE id_matricula = $1;
    `,
    [id_matricula]
  );

  return (resultado.rowCount ?? 0) > 0;
}