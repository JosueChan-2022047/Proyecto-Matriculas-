import { Usuario } from "../models/usuario";
import { listarUsuarios } from "../services/usuarioService";
import { listarMatriculas, actualizarMatricula } from "../services/matriculaService";
import { crearMarca, listarMarcas } from "../services/marcaService";

export async function menuAdministrador(
  usuarioAdmin: Usuario,
  preguntar: (p: string) => Promise<string> 
) {
  let salirAdmin = false;

  while (!salirAdmin) {
    console.log(`\n===== MENÚ ADMIN (${usuarioAdmin.nombre}) =====`);
    console.log("1. Listar todos los usuarios");
    console.log("2. Ver todas las solicitudes de matrícula");
    console.log("3. Actualizar estado de una matrícula");
    console.log("4. Crear Marca de vehículo");
    console.log("5. Listar Marcas");
    console.log("6. Cerrar sesión");

    const opcion = await preguntar("Elige una opción: ");

    switch (opcion) {
      case "1":
        console.log("\n--- USUARIOS REGISTRADOS ---");
        console.log(listarUsuarios());
        break;

      case "2":
        console.log("\n--- TODAS LAS MATRÍCULAS ---");
        console.log(listarMatriculas());
        break;

      case "3": {
        console.log("\n--- ACTUALIZAR MATRÍCULA ---");
        const id_matricula = Number(await preguntar("ID de la matrícula: "));
        const id_estado = Number(await preguntar("Nuevo ID de estado (1: Pendiente, 2: Aprobada, 3: Rechazada): "));
        const id_vehiculo = Number(await preguntar("ID del vehículo asociado: "));

  
        const actualizada = actualizarMatricula(id_matricula, {
          id_vehiculo,
          id_estado
        });

        console.log(actualizada ? "Matrícula actualizada:" : "Matrícula no encontrada.", actualizada);
        break;
      }

      case "4": {
        const nombreMarca = await preguntar("Nombre de la nueva marca: ");
        const nuevaMarca = crearMarca({ nombre: nombreMarca });
        console.log("Marca creada:", nuevaMarca);
        break;
      }

      case "5":
        console.log("\n--- MARCAS DISPONIBLES ---");
        console.log(listarMarcas());
        break;

      case "6":
        console.log("Cerrando sesión de administrador...");
        salirAdmin = true;
        break;

      default:
        console.log("Opción inválida.");
    }
  }
}