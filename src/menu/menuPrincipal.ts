import readline from "readline";
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
    console.log("===== MENU PRINCIPAL =====");
    console.log("1. Usuarios");
    console.log("2. Vehículos");
    console.log("3. Matrículas");
    console.log("4. Salir");

    const opcion = await preguntar("Elige una opción: ");

    switch (opcion) {
      case "1":
        await menuUsuario();
        break;

      case "2":
        console.log("Módulo de vehículos aún no creado");
        break;

      case "3":
        console.log("Módulo de matrículas aún no creado");
        break;

      case "4":
        console.log("Saliendo...");
        rl.close();
        return;

      default:
        console.log("Opción inválida");
    }
  }
}