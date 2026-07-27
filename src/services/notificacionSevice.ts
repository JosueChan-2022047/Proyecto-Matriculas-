import { pool } from "../database/connection";
import { Notificacion } from "../models/notificacion";

type NotificacionRegistro = {
  id_usuario: number;
  id_matricula: number;
  mensaje: string;
  tipo: string;
  fecha: string;
  estado: string;
};

export async function crearNotificacion(
  datos: NotificacionRegistro
): Promise<Notificacion> {
  const resultado = await pool.query(
    `
      INSERT INTO notificacion (
        id_usuario,
        id_matricula,
        mensaje,
        tipo,
        fecha,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
    [
      datos.id_usuario,
      datos.id_matricula,
      datos.mensaje,
      datos.tipo,
      datos.fecha,
      datos.estado
    ]
  );

  return resultado.rows[0];
}

export async function listarNotificaciones(): Promise<Notificacion[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM notificacion
      ORDER BY id_notif ASC;
    `
  );

  return resultado.rows;
}

export async function buscarNotificacionPorId(
  id_notif: number
): Promise<Notificacion | null> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM notificacion
      WHERE id_notif = $1;
    `,
    [id_notif]
  );

  return resultado.rows[0] ?? null;
}

export async function buscarNotificacionesPorUsuario(
  id_usuario: number
): Promise<Notificacion[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM notificacion
      WHERE id_usuario = $1
      ORDER BY id_notif ASC;
    `,
    [id_usuario]
  );

  return resultado.rows;
}

export async function buscarNotificacionesPorMatricula(
  id_matricula: number
): Promise<Notificacion[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM notificacion
      WHERE id_matricula = $1
      ORDER BY id_notif ASC;
    `,
    [id_matricula]
  );

  return resultado.rows;
}

export async function actualizarNotificacion(
  id_notif: number,
  datos: Partial<NotificacionRegistro>
): Promise<Notificacion | null> {
  const resultado = await pool.query(
    `
      UPDATE notificacion
      SET
        id_usuario = COALESCE($1, id_usuario),
        id_matricula = COALESCE($2, id_matricula),
        mensaje = COALESCE($3, mensaje),
        tipo = COALESCE($4, tipo),
        fecha = COALESCE($5, fecha),
        estado = COALESCE($6, estado)
      WHERE id_notif = $7
      RETURNING *;
    `,
    [
      datos.id_usuario ?? null,
      datos.id_matricula ?? null,
      datos.mensaje ?? null,
      datos.tipo ?? null,
      datos.fecha ?? null,
      datos.estado ?? null,
      id_notif
    ]
  );

  return resultado.rows[0] ?? null;
}

export async function eliminarNotificacion(
  id_notif: number
): Promise<boolean> {
  const resultado = await pool.query(
    `
      DELETE FROM notificacion
      WHERE id_notif = $1;
    `,
    [id_notif]
  );

  return (resultado.rowCount ?? 0) > 0;
}