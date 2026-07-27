import { pool } from "../database/connection";
import { TipoVehiculo } from "../models/tipoVehiculo";

type TipoVehiculoRegistro = Omit<TipoVehiculo, "id_tipo">;

export async function crearTipoVehiculo(
  datos: TipoVehiculoRegistro
): Promise<TipoVehiculo> {
  if (!datos.nombre || !datos.nombre.trim()) {
    throw new Error("El nombre del tipo de vehículo es obligatorio.");
  }

  const tipoExistente = await pool.query(
    `
      SELECT id_tipo
      FROM tipo_vehiculo
      WHERE LOWER(nombre) = LOWER($1);
    `,
    [datos.nombre.trim()]
  );

  if ((tipoExistente.rowCount ?? 0) > 0) {
    throw new Error("El tipo de vehículo ya existe.");
  }

  const resultado = await pool.query(
    `
      INSERT INTO tipo_vehiculo (
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

export async function listarTiposVehiculo(): Promise<TipoVehiculo[]> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM tipo_vehiculo
      ORDER BY id_tipo ASC;
    `
  );

  return resultado.rows;
}

export async function buscarTipoVehiculoPorId(
  id_tipo: number
): Promise<TipoVehiculo | null> {
  const resultado = await pool.query(
    `
      SELECT *
      FROM tipo_vehiculo
      WHERE id_tipo = $1;
    `,
    [id_tipo]
  );

  return resultado.rows[0] ?? null;
}

export async function actualizarTipoVehiculo(
  id_tipo: number,
  datos: Partial<TipoVehiculoRegistro>
): Promise<TipoVehiculo | null> {
  const tipoActual = await buscarTipoVehiculoPorId(id_tipo);

  if (!tipoActual) {
    return null;
  }

  const nuevoNombre =
    datos.nombre?.trim() ?? tipoActual.nombre;

  const nuevaDescripcion =
    datos.descripcion !== undefined
      ? datos.descripcion.trim() || null
      : tipoActual.descripcion ?? null;

  if (!nuevoNombre) {
    throw new Error("El nombre del tipo de vehículo es obligatorio.");
  }

  const tipoDuplicado = await pool.query(
    `
      SELECT id_tipo
      FROM tipo_vehiculo
      WHERE LOWER(nombre) = LOWER($1)
        AND id_tipo <> $2;
    `,
    [nuevoNombre, id_tipo]
  );

  if ((tipoDuplicado.rowCount ?? 0) > 0) {
    throw new Error(
      "Ya existe otro tipo de vehículo con ese nombre."
    );
  }

  const resultado = await pool.query(
    `
      UPDATE tipo_vehiculo
      SET
        nombre = $1,
        descripcion = $2
      WHERE id_tipo = $3
      RETURNING *;
    `,
    [
      nuevoNombre,
      nuevaDescripcion,
      id_tipo
    ]
  );

  return resultado.rows[0] ?? null;
}

export async function eliminarTipoVehiculo(
  id_tipo: number
): Promise<boolean> {
  const resultado = await pool.query(
    `
      DELETE FROM tipo_vehiculo
      WHERE id_tipo = $1;
    `,
    [id_tipo]
  );

  return (resultado.rowCount ?? 0) > 0;
}