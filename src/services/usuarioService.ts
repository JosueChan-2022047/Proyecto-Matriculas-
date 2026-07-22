import fs from "fs";
import path from "path";
import { Usuario } from "../models/usuario";

const rutaUsuariosJson = process.env.USUARIO_JSON_PATH ?? path.resolve(__dirname, "../data/usuario.json");
const usuarios: Usuario[] = [];
let siguienteId = 1;

function cargarUsuariosDesdeJson() {
  if (!fs.existsSync(rutaUsuariosJson)) {
    fs.writeFileSync(rutaUsuariosJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaUsuariosJson, "utf8");
  if (!contenido.trim()) {
    fs.writeFileSync(rutaUsuariosJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as Usuario[];
  if (datos.length > 0) {
    datos.forEach(usuario => usuarios.push(usuario));
    siguienteId = Math.max(...datos.map(usuario => usuario.id_usuario), 0) + 1;
  }
}

function guardarUsuariosEnJson() {
  fs.writeFileSync(rutaUsuariosJson, JSON.stringify(usuarios, null, 2), "utf8");
}



export function crearUsuario(usuario: Omit<Usuario, "id_usuario" | "fecha_registro">): Usuario {
  const nuevoUsuario: Usuario = {
    id_usuario: siguienteId++,
    ...usuario,
    fecha_registro: new Date()
  };

  usuarios.push(nuevoUsuario);
  guardarUsuariosEnJson();
  return nuevoUsuario;
}

export function listarUsuarios(): Usuario[] {
  return usuarios;
}

export function buscarUsuarioPorId(id_usuario: number): Usuario | undefined {
  return usuarios.find(usuario => usuario.id_usuario === id_usuario);
}

export function actualizarUsuario(
  id_usuario: number,
  datosActualizados: Omit<Usuario, "id_usuario" | "fecha_registro">
): Usuario | null {
  const indice = usuarios.findIndex(usuario => usuario.id_usuario === id_usuario);

  if (indice === -1) {
    return null;
  }
  usuarios[indice] = {
    ...usuarios[indice],
    ...datosActualizados
  };

  guardarUsuariosEnJson();
  return usuarios[indice];
}

export function eliminarUsuario(id_usuario: number): boolean {
  const indice = usuarios.findIndex(usuario => usuario.id_usuario === id_usuario);

  if (indice === -1) {
    return false;
  }
 
  usuarios.splice(indice, 1);
  guardarUsuariosEnJson();
  return true;
}

export function iniciarSesion(email: string, password: string): Usuario | null {
  return usuarios.find(usuario => usuario.email === email && usuario.password === password) ?? null;
}

export function multarUsuario(id_usuario: number): string {
  const usuario = buscarUsuarioPorId(id_usuario);

  if (!usuario) {
    return "Usuario no encontrado";
  }

  return `Se ha aplicado una multa al usuario ${usuario.nombre} (${usuario.email}).`;
}