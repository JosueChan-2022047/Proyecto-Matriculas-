import { pool } from "../database/connection";
import { Vehiculo } from "../models/vehiculo";

type VehiculoRegistro = Omit<Vehiculo, "id_vehiculo" | "fecha_registro">;

export async function crearVehiculo(
  datos: VehiculoRegistro
): Promise<Vehiculo> {

  const placaExiste = await pool.query(
    "SELECT 1 FROM vehiculo WHERE UPPER(placa)=UPPER($1)",
    [datos.placa]
  );

  if (placaExiste.rowCount) {
    throw new Error("La placa ya está registrada.");
  }

  const query = `
    INSERT INTO vehiculo
    (id_usuario, placa, id_tipo, id_marca, modelo, anio, color)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *;
  `;

  const values = [
    datos.id_usuario,
    datos.placa,
    datos.id_tipo,
    datos.id_marca,
    datos.modelo,
    datos.anio,
    datos.color
  ];

  const resultado = await pool.query(query, values);

  return resultado.rows[0];
}

export async function listarVehiculos(): Promise<Vehiculo[]> {

  const resultado = await pool.query(`
    SELECT *
    FROM vehiculo
    ORDER BY id_vehiculo ASC;
  `);

  return resultado.rows;
}

export async function buscarVehiculoPorId(
  id_vehiculo: number
): Promise<Vehiculo | null> {

  const resultado = await pool.query(
    "SELECT * FROM vehiculo WHERE id_vehiculo=$1",
    [id_vehiculo]
  );

  return resultado.rows[0] ?? null;
}

export async function buscarVehiculosPorUsuario(
  id_usuario: number
): Promise<Vehiculo[]> {

  const resultado = await pool.query(
    "SELECT * FROM vehiculo WHERE id_usuario=$1",
    [id_usuario]
  );

  return resultado.rows;
}

export async function actualizarVehiculo(
  id_vehiculo: number,
  datos: Partial<VehiculoRegistro>
): Promise<Vehiculo | null> {

  const query = `
    UPDATE vehiculo
    SET
      id_usuario = COALESCE($1,id_usuario),
      placa      = COALESCE($2,placa),
      id_tipo    = COALESCE($3,id_tipo),
      id_marca   = COALESCE($4,id_marca),
      modelo     = COALESCE($5,modelo),
      anio       = COALESCE($6,anio),
      color      = COALESCE($7,color)
    WHERE id_vehiculo=$8
    RETURNING *;
  `;

  const values = [
    datos.id_usuario ?? null,
    datos.placa ?? null,
    datos.id_tipo ?? null,
    datos.id_marca ?? null,
    datos.modelo ?? null,
    datos.anio ?? null,
    datos.color ?? null,
    id_vehiculo
  ];

  const resultado = await pool.query(query, values);

  return resultado.rows[0] ?? null;
}

export async function eliminarVehiculo(
  id_vehiculo: number
): Promise<boolean> {

  const resultado = await pool.query(
    "DELETE FROM vehiculo WHERE id_vehiculo=$1",
    [id_vehiculo]
  );

  return (resultado.rowCount ?? 0) > 0;
}