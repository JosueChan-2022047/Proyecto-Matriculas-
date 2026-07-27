import { pool } from "../database/connection";
import { Documento } from "../models/documentos";

type DocumentoRegistro = {
  id_matricula: number;
  tipo: string;
  contenido: string;
  fecha: string;
  estado: string;
};

export async function crearDocumento(
  datos: DocumentoRegistro
): Promise<Documento> {
  const resultado = await pool.query(
    `
      INSERT INTO documento (
        id_matricula,
        tipo,
        contenido,
        fecha,
        estado
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    [
      datos.id_matricula,
      datos.tipo,
      datos.contenido,
      datos.fecha,
      datos.estado
    ]
  );

  return resultado.rows[0];
}

export async function listarDocumentos(): Promise<Documento[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM documento
      ORDER BY id_documento ASC;
    `
  );

  return resultado.rows;
}

export async function buscarDocumentoPorId(
  id_documento: number
): Promise<Documento | null> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM documento
      WHERE id_documento = $1;
    `,
    [id_documento]
  );

  return resultado.rows[0] ?? null;
}

export async function buscarDocumentosPorMatricula(
  id_matricula: number
): Promise<Documento[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM documento
      WHERE id_matricula = $1
      ORDER BY id_documento ASC;
    `,
    [id_matricula]
  );

  return resultado.rows;
}

export async function actualizarDocumento(
  id_documento: number,
  datos: Partial<DocumentoRegistro>
): Promise<Documento | null> {
  const resultado = await pool.query(
    `
      UPDATE documento
      SET
        id_matricula = COALESCE($1, id_matricula),
        tipo = COALESCE($2, tipo),
        contenido = COALESCE($3, contenido),
        fecha = COALESCE($4, fecha),
        estado = COALESCE($5, estado)
      WHERE id_documento = $6
      RETURNING *;
    `,
    [
      datos.id_matricula ?? null,
      datos.tipo ?? null,
      datos.contenido ?? null,
      datos.fecha ?? null,
      datos.estado ?? null,
      id_documento
    ]
  );

  return resultado.rows[0] ?? null;
}

export async function eliminarDocumento(
  id_documento: number
): Promise<boolean> {
  const resultado = await pool.query(
    `
      DELETE FROM documento
      WHERE id_documento = $1;
    `,
    [id_documento]
  );

  return (resultado.rowCount ?? 0) > 0;
}