export interface Notificacion  {
  id_notif: number;
  id_usuario: number;
  id_matricula: number;
  mensaje: string;
  tipo: string;
  fecha: Date;
  estado: string;
}