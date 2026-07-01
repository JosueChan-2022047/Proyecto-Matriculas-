import mysql from "mysql2/promise";

export async function conectarDB() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "?donmoA5m@",
    database: "GestorDeMatriculasVehiculas_in5cm"
  });
}