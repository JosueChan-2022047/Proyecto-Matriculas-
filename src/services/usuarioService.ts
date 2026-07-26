import { pool } from "../database/connection";
import { Usuario } from "../models/usuario";

type UsuarioRegistro = Omit<Usuario, "id_usuario" | "fecha_registro">;

export async function crearUsuario(datos: UsuarioRegistro): Promise<Usuario> {
  const query = `
    INSERT INTO usuario (nombre, email, telefono, password, rol)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [
    datos.nombre,
    datos.email,
    datos.telefono,
    datos.password,
    datos.rol ?? 'usuario'
  ];

  const resultado = await pool.query(query, values);
  return resultado.rows[0];
}

export async function iniciarSesion(email: string, password: string): Promise<Usuario | null> {
  const query = `SELECT * FROM usuario WHERE email = $1 AND password = $2;`;
  const resultado = await pool.query(query, [email, password]);

  if (resultado.rows.length === 0) {
    return null;
  }

  return resultado.rows[0];
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const query = `SELECT * FROM usuario ORDER BY id_usuario ASC;`;
  const resultado = await pool.query(query);
  return resultado.rows;
}

export async function buscarUsuarioPorId(id_usuario: number): Promise<Usuario | null> {
  const query = `SELECT * FROM usuario WHERE id_usuario = $1;`;
  const resultado = await pool.query(query, [id_usuario]);

  return resultado.rows[0] ?? null;
}

export async function actualizarUsuario(
  id_usuario: number,
  datos: Partial<UsuarioRegistro>
): Promise<Usuario | null> {
  const query = `
    UPDATE usuario
    SET nombre = COALESCE($1, nombre),
        email = COALESCE($2, email),
        telefono = COALESCE($3, telefono),
        password = COALESCE($4, password),
        rol = COALESCE($5, rol)
    WHERE id_usuario = $6
    RETURNING *;
  `;
  const values = [
    datos.nombre ?? null,
    datos.email ?? null,
    datos.telefono ?? null,
    datos.password ?? null,
    datos.rol ?? null,
    id_usuario
  ];

  const resultado = await pool.query(query, values);
  return resultado.rows[0] ?? null;
}

export async function eliminarUsuario(id_usuario: number): Promise<boolean> {
  const query = `DELETE FROM usuario WHERE id_usuario = $1;`;
  const resultado = await pool.query(query, [id_usuario]);
  return (resultado.rowCount ?? 0) > 0;
}