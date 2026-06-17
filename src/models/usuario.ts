export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  rol: string;
  fecha_registro?: Date;
}