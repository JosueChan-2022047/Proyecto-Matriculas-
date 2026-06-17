export interface Pago {
  id_pago: number;
  id_matricula: number;
  monto: number;
  fecha_pago: Date;
  metodo_pago: string;
  estado: string;
  transaccion: string;
}