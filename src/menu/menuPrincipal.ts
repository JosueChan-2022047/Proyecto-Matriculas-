import readline from "readline";
import {crearUsuario,listarUsuarios,buscarUsuarioPorId, actualizarUsuario,eliminarUsuario, iniciarSesion, multarUsuario} from "../services/usuarioService";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function preguntar(pregunta: string): Promise<string> {
  return new Promise(resolve => rl.question(pregunta, resolve));
}

export async function menuPrincipal() {
  while (true) {
    console.log("===== BIENVENIDO =====");
    console.log("1. Iniciar sesión");
    console.log("2. Registrarse");
    console.log("3. Salir");

    const opcionInicio = await preguntar("Elige una opción: ");

    if (opcionInicio === "3") {
      console.log("Saliendo...");
      rl.close();
      return;
    }

    if (opcionInicio === "2") {
      const nombre = await preguntar("Nombre: ");
      const email = await preguntar("Correo: ");
      const telefono = await preguntar("Teléfono: ");
      const password = await preguntar("Contraseña: ");
      const rol = await preguntar("Rol (admin/cliente): ");

      const nuevoUsuario = crearUsuario({ nombre, email, telefono, password, rol });
      console.log("Registro exitoso. Usuario guardado en el JSON:", nuevoUsuario);
      continue;
    }

    if (opcionInicio !== "1") {
      console.log("Opción inválida.\n");
      continue;
    }

    console.log("===== INICIO DE SESION =====");
    const email = await preguntar("Correo: ");
    const password = await preguntar("Contraseña: ");

    const usuario = iniciarSesion(email, password);

    if (!usuario) {
      console.log("Credenciales incorrectas. Intente nuevamente.\n");
      continue;
    }

    console.log(`\nBienvenido ${usuario.nombre} (${usuario.rol})`);

    if (usuario.rol === "admin") {
      let salirAdmin = false;

      while (!salirAdmin) {
        console.log("\n===== MENU ADMIN =====");
        console.log("1. Listar Usuarios");
        console.log("2. Buscar Usuario por ID");
        console.log("3. Actualizar usuario");
        console.log("4. Eliminar Usuario");
        console.log("5. Multar Usuario");
        console.log("6. Cerrar sesión");

        const opcion = await preguntar("Elige una opción: ");

        switch (opcion) {
          case "1":
            console.log("Usuarios:", listarUsuarios());
            break;

          case "2": {
            const id = Number(await preguntar("ID del usuario: "));
            console.log(buscarUsuarioPorId(id) ?? "Usuario no encontrado");
            break;
          }

          case "3": {
            const id = Number(await preguntar("ID a actualizar: "));
            const nombre = await preguntar("Nombre: ");
            const emailUsuario = await preguntar("Email: ");
            const telefono = await preguntar("Teléfono: ");
            const passwordUsuario = await preguntar("Password: ");
            const rol = await preguntar("Rol: ");
            console.log(actualizarUsuario(id, { nombre, email: emailUsuario, telefono, password: passwordUsuario, rol }) ?? "Usuario no encontrado");
            break;
          }

          case "4": {
            const id = Number(await preguntar("ID a eliminar: "));
            console.log(eliminarUsuario(id) ? "Usuario eliminado" : "Usuario no encontrado");
            break;
          }

          case "5": {
            const id = Number(await preguntar("ID del usuario a multar: "));
            console.log(multarUsuario(id));
            break;
          }

          case "6":
            console.log("Sesión cerrada.");
            salirAdmin = true;
            break;

          default:
            console.log("Opción inválida");
        }
      }
    } else {
      let salirCliente = false;

      while (!salirCliente) {
        console.log("\n===== MENU CLIENTE =====");
        console.log("1. Documentos");
        console.log("2. Estado de matrícula");
        console.log("3. Historial");
        console.log("4. Cerrar sesión");

        const opcion = await preguntar("Elige una opción: ");

        switch (opcion) {
          case "1":
            console.log("Mostrando documentos del cliente.");
            break;

          case "2":
            console.log("Mostrando estado de matrícula.");
            break;

          case "3":
            console.log("Mostrando historial del cliente.");
            break;

          case "4":
            console.log("Sesión cerrada.");
            salirCliente = true;
            break;

          default:
            console.log("Opción inválida");
        }
      }
    }
  }
}