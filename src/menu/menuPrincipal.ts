import readline from "readline";
import { crearUsuario, iniciarSesion } from "../services/usuarioService";
import { menuAdministrador } from "./menuAdministrador";
import { menuUsuario } from "./menuUsuario";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function preguntar(pregunta: string): Promise<string> {
  return new Promise(resolve => rl.question(pregunta, resolve));
}

export async function menuPrincipal() {
  while (true) {
    console.log("\n===== GESTIÓN DE MATRÍCULAS VEHICULARES =====");
    console.log("1. Iniciar sesión");
    console.log("2. Registrarse");
    console.log("3. Salir");

    const opcionInicio = await preguntar("Elige una opción: ");

    if (opcionInicio === "3") {
      console.log("¡Hasta luego!");
      rl.close();
      return;
    }

    if (opcionInicio === "2") {
      console.log("\n--- REGISTRO DE USUARIO ---");
      const nombre = await preguntar("Nombre: ");
      const email = await preguntar("Correo: ");
      const telefono = await preguntar("Teléfono: ");
      const password = await preguntar("Contraseña: ");

    
      const nuevoUsuario = await crearUsuario({ nombre, email, telefono, password, rol: "usuario" });
      console.log("Registro exitoso en PostgreSQL:", nuevoUsuario);
      continue;
    }

    if (opcionInicio === "1") {
      console.log("\n--- INICIO DE SESIÓN ---");
      const email = await preguntar("Correo: ");
      const password = await preguntar("Contraseña: ");

      // Agregado 'await' para consultar a PostgreSQL
      const usuario = await iniciarSesion(email, password);

      if (!usuario) {
        console.log("Credenciales incorrectas. Intente nuevamente.");
        continue;
      }

      console.log(`\n¡Bienvenido/a ${usuario.nombre}!`);

      // Redirección según el rol registrado en PostgreSQL
      if (usuario.rol === "admin") {
        await menuAdministrador(usuario, preguntar);
      } else {
        await menuUsuario(usuario, preguntar);
      }
    } else {
      console.log("Opción inválida.\n");
    }
  }
}