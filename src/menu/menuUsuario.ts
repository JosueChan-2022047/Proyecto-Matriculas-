import { Usuario } from "../models/usuario";
import { crearVehiculo, buscarVehiculosPorUsuario } from "../services/vehiculoService";
import { crearMatricula, buscarMatriculasPorVehiculo } from "../services/matriculaService";

export async function menuUsuario(
  usuarioCliente: Usuario,
  preguntar: (p: string) => Promise<string> 
) {
  let salirCliente = false;

  while (!salirCliente) {
    console.log(`===== MENÚ CLIENTE (${usuarioCliente.nombre}) =====`);
    console.log("1. Registrar mi vehículo");
    console.log("2. Ver mis vehículos");
    console.log("3. Solicitar matrícula");
    console.log("4. Mis trámites / Estado de matrícula");
    console.log("5. Cerrar sesión");

    const opcion = await preguntar("Elige una opción: ");

    switch (opcion) {
      case "1": {
        console.log("--- REGISTRAR VEHÍCULO ---");
        const placa = await preguntar("Placa: ");
        const modelo = await preguntar("Modelo: ");
        const color = await preguntar("Color: "); 
        const anio = Number(await preguntar("Año: "));
        const id_marca = Number(await preguntar("ID Marca: "));
        const id_tipo = Number(await preguntar("ID Tipo Vehículo: "));

        const nuevoVehiculo = crearVehiculo({  placa, modelo, color, anio,id_usuario: usuarioCliente.id_usuario,id_marca,id_tipo });

        console.log("Vehículo registrado con éxito:", nuevoVehiculo);
        break;
      }

      case "2": {
        console.log("\n--- MIS VEHÍCULOS ---");
        const misVehiculos = buscarVehiculosPorUsuario(usuarioCliente.id_usuario);
        console.log(misVehiculos.length > 0 ? misVehiculos : "No tienes vehículos registrados.");
        break;
      }

      case "3": {
        console.log("--- SOLICITAR MATRÍCULA ---");
        const id_vehiculo = Number(await preguntar("ID del vehículo a matricular: "));

        
        const nuevaMatricula = crearMatricula({
          id_vehiculo,
          id_estado: 1 
        });

        console.log("Solicitud de matrícula creada:", nuevaMatricula);
        break;
      }

      case "4": {
        console.log("\n--- MIS TRÁMITES ---");
        const misVehiculos = buscarVehiculosPorUsuario(usuarioCliente.id_usuario);
        
        for (const v of misVehiculos) {
          const matriculas = buscarMatriculasPorVehiculo(v.id_vehiculo);
          console.log(`Vehículo [${v.placa}]:`, matriculas);
        }
        break;
      }

      case "5":
        console.log("Cerrando sesión...");
        salirCliente = true;
        break;

      default:
        console.log("Opción inválida.");
    }
  }
}