export interface Matricula {
  id_matricula: number;
  id_vehiculo: number;
  id_estado: number;
  fecha_inicio?: string;       
  fecha_vencimiento?: string;  
  monto?: number;              
  fecha_pago?: string;         
 
}