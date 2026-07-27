import { pool } from "../database/connection";
import { Pago } from "../models/pago";

type PagoRegistro = {
  id_matricula: number;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  estado: string;
  transaccion?: string | null;
};

export async function crearPago(
  datos: PagoRegistro
): Promise<Pago> {
  const resultado = await pool.query(
    `
      INSERT INTO pago (
        id_matricula,
        monto,
        fecha_pago,
        metodo_pago,
        estado,
        transaccion
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
    [
      datos.id_matricula,
      datos.monto,
      datos.fecha_pago,
      datos.metodo_pago,
      datos.estado,
      datos.transaccion ?? null
    ]
  );

  return resultado.rows[0];
}

export async function listarPagos(): Promise<Pago[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM pago
      ORDER BY id_pago ASC;
    `
  );

  return resultado.rows;
}

export async function buscarPagoPorId(
  id_pago: number
): Promise<Pago | null> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM pago
      WHERE id_pago = $1;
    `,
    [id_pago]
  );

  return resultado.rows[0] ?? null;
}

export async function buscarPagosPorMatricula(
  id_matricula: number
): Promise<Pago[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM pago
      WHERE id_matricula = $1
      ORDER BY id_pago ASC;
    `,
    [id_matricula]
  );

  return resultado.rows;
}

export async function actualizarPago(
  id_pago: number,
  datos: Partial<PagoRegistro>
): Promise<Pago | null> {
  const resultado = await pool.query(
    `
      UPDATE pago
      SET
        id_matricula = COALESCE($1, id_matricula),
        monto = COALESCE($2, monto),
        fecha_pago = COALESCE($3, fecha_pago),
        metodo_pago = COALESCE($4, metodo_pago),
        estado = COALESCE($5, estado),
        transaccion = COALESCE($6, transaccion)
      WHERE id_pago = $7
      RETURNING *;
    `,
    [
      datos.id_matricula ?? null,
      datos.monto ?? null,
      datos.fecha_pago ?? null,
      datos.metodo_pago ?? null,
      datos.estado ?? null,
      datos.transaccion ?? null,
      id_pago
    ]
  );

  return resultado.rows[0] ?? null;
}

export async function eliminarPago(
  id_pago: number
): Promise<boolean> {
  const resultado = await pool.query(
    `
      DELETE FROM pago
      WHERE id_pago = $1;
    `,
    [id_pago]
  );

  return (resultado.rowCount ?? 0) > 0;
}