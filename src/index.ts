import { probarConexion } from "./database/connection";
import { iniciarServidor } from "./api/server";

async function main() {
  await probarConexion();
  iniciarServidor();
}

main();