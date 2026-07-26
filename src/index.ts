import { probarConexion } from "./database/connection";
import { menuPrincipal } from "./menu/menuPrincipal";

async function main() {
  await probarConexion();
  await menuPrincipal();
}

main();