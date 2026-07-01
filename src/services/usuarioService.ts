import { Usuario } from "../models/usuario";

const usuarios: Usuario[] = [];
let siguienteId = 1;

export function crearUsuario(usuario: Omit<Usuario, "id_usuario" | "fecha_registro">): Usuario {
  const nuevoUsuario: Usuario = {
    id_usuario: siguienteId++,
    ...usuario,
    fecha_registro: new Date()
  };

  usuarios.push(nuevoUsuario);
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

  return usuarios[indice];
}

export function eliminarUsuario(id_usuario: number): boolean {
  const indice = usuarios.findIndex(usuario => usuario.id_usuario === id_usuario);

  if (indice === -1) {
    return false;
  }
 
  usuarios.splice(indice, 1);
  return true;
}