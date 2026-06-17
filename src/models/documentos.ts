export interface Documento {
  id_documento: number;
  id_matricula: number;
  tipo: string;
  contenido: string;
  fecha: Date;
  estado: string;
}