import { pool } from "../database/connection";
import { EstadoMatricula } from "../models/estadoMatricula";

type EstadoMatriculaRegistro = Omit<EstadoMatricula, "id_estado">;

export async function crearEstadoMatricula(
  datos: EstadoMatriculaRegistro
): Promise<EstadoMatricula> {
  if (!datos.nombre || !datos.nombre.trim()) {
    throw new Error("El nombre del estado es obligatorio.");
  }

  const estadoExistente = await pool.query(
    `
      SELECT id_estado
      FROM estado_matricula
      WHERE LOWER(nombre) = LOWER($1);
    `,
    [datos.nombre.trim()]
  );

  if ((estadoExistente.rowCount ?? 0) > 0) {
    throw new Error("El estado de matrícula ya existe.");
  }

  const resultado = await pool.query(
    `
      INSERT INTO estado_matricula (
        nombre,
        descripcion
      )
      VALUES ($1, $2)
      RETURNING *;
    `,
    [
      datos.nombre.trim(),
      datos.descripcion?.trim() || null
    ]
  );

  return resultado.rows[0];
}

export async function listarEstadosMatricula():
Promise<EstadoMatricula[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM estado_matricula
      ORDER BY id_estado ASC;
    `
  );

  return resultado.rows;
}

export async function buscarEstadoMatriculaPorId(
  id_estado: number
): Promise<EstadoMatricula | null> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM estado_matricula
      WHERE id_estado = $1;
    `,
    [id_estado]
  );

  return resultado.rows[0] ?? null;
}

export async function actualizarEstadoMatricula(
  id_estado: number,
  datos: Partial<EstadoMatriculaRegistro>
): Promise<EstadoMatricula | null> {
  const estadoActual = await buscarEstadoMatriculaPorId(id_estado);

  if (!estadoActual) {
    return null;
  }

  const nuevoNombre =
    datos.nombre?.trim() ?? estadoActual.nombre;

  const nuevaDescripcion =
    datos.descripcion !== undefined
      ? datos.descripcion.trim() || null
      : estadoActual.descripcion ?? null;

  if (!nuevoNombre) {
    throw new Error("El nombre del estado es obligatorio.");
  }

  const estadoDuplicado = await pool.query(
    `
      SELECT id_estado
      FROM estado_matricula
      WHERE LOWER(nombre) = LOWER($1)
        AND id_estado <> $2;
    `,
    [nuevoNombre, id_estado]
  );

  if ((estadoDuplicado.rowCount ?? 0) > 0) {
    throw new Error(
      "Ya existe otro estado de matrícula con ese nombre."
    );
  }

  const resultado = await pool.query(
    `
      UPDATE estado_matricula
      SET
        nombre = $1,
        descripcion = $2
      WHERE id_estado = $3
      RETURNING *;
    `,
    [
      nuevoNombre,
      nuevaDescripcion,
      id_estado
    ]
  );

  return resultado.rows[0] ?? null;
}

export async function eliminarEstadoMatricula(
  id_estado: number
): Promise<boolean> {
  const resultado = await pool.query(
    `
      DELETE FROM estado_matricula
      WHERE id_estado = $1;
    `,
    [id_estado]
  );

  return (resultado.rowCount ?? 0) > 0;
}