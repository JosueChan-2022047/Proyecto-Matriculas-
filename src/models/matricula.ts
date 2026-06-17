export interface Matricula  {
  id_matricula: number;
  id_vehiculo: number;
  id_estado: number;
  fecha_inicio: Date;
  fecha_vencimiento: Date;
  monto: number;
  fecha_pago: Date;
  comprobante: string;
  notas: string;
  fecha_registro: Date;
}