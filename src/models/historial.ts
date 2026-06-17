export interface Historial  {
  id_historial: number;
  id_matricula: number;
  id_usuario: number;
  accion: string;
  descripcion: string;
  fecha: Date;
  valores_old: string;
  valores_new: string;
}