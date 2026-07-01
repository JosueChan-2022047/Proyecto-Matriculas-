import readline from "readline";
import {
  crearUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
} from "../services/usuarioService";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function preguntar(pregunta: string): Promise<string> {
  return new Promise(resolve => rl.question(pregunta, resolve));
}

export async function menuUsuario() {
  while (true) {
    console.log("\n===== MENU USUARIO =====");
    console.log("1. Crear usuario");
    console.log("2. Listar usuarios");
    console.log("3. Buscar usuario por ID");
    console.log("4. Actualizar usuario");
    console.log("5. Eliminar usuario");
    console.log("6. Salir");

    const opcion = await preguntar("Elige una opción: ");

    switch (opcion) {
      case "1": {
        const nombre = await preguntar("Nombre: ");
        const email = await preguntar("Email: ");
        const telefono = await preguntar("Teléfono: ");
        const password = await preguntar("Password: ");
        const rol = await preguntar("Rol: ");
        const nuevo = crearUsuario({ nombre, email, telefono, password, rol });
        console.log("Usuario creado:", nuevo);
        break;
      }

      case "2":
        console.log("Usuarios:", listarUsuarios());
        break;

      case "3": {
        const id = Number(await preguntar("ID del usuario: "));
        console.log(buscarUsuarioPorId(id) ?? "Usuario no encontrado");
        break;
      }

      case "4": {
        const id = Number(await preguntar("ID a actualizar: "));
        const nombre = await preguntar("Nombre: ");
        const email = await preguntar("Email: ");
        const telefono = await preguntar("Teléfono: ");
        const password = await preguntar("Password: ");
        const rol = await preguntar("Rol: ");
        console.log(actualizarUsuario(id, { nombre, email, telefono, password, rol }) ?? "Usuario no encontrado");
        break;
      }

      case "5": {
        const id = Number(await preguntar("ID a eliminar: "));
        console.log(eliminarUsuario(id) ? "Usuario eliminado" : "Usuario no encontrado");
        break;
      }

      case "6":
        console.log("Saliendo...");
        rl.close();
        return;

      default:
        console.log("Opción inválida");
    }
  }
}