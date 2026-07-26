import fs from "fs";
import path from "path";
import { Notificacion } from "../models/notificacion";

const rutaNotificacionesJson =
  process.env.NOTIFICACION_JSON_PATH ??
  path.resolve(__dirname, "../data/notificacion.json");

const notificaciones: Notificacion[] = [];
let siguienteId = 1;

function cargarNotificacionesDesdeJson() {
  if (!fs.existsSync(rutaNotificacionesJson)) {
    fs.writeFileSync(rutaNotificacionesJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaNotificacionesJson, "utf8");

  if (!contenido.trim()) {
    fs.writeFileSync(rutaNotificacionesJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as Notificacion[];

  if (datos.length > 0) {
    datos.forEach(notificacion => notificaciones.push(notificacion));
    siguienteId =
      Math.max(...datos.map(notificacion => notificacion.id_notif), 0) + 1;
  }
}

function guardarNotificacionesEnJson() {
  fs.writeFileSync(
    rutaNotificacionesJson,
    JSON.stringify(notificaciones, null, 2),
    "utf8"
  );
}

cargarNotificacionesDesdeJson();

type NotificacionRegistro = Omit<Notificacion, "id_notif">;

export function crearNotificacion(
  notificacion: NotificacionRegistro
): Notificacion {

  const nuevaNotificacion: Notificacion = {
    id_notif: siguienteId++,
    ...notificacion
  };

  notificaciones.push(nuevaNotificacion);
  guardarNotificacionesEnJson();

  return nuevaNotificacion;
}

export function listarNotificaciones(): Notificacion[] {
  return notificaciones;
}

export function buscarNotificacionPorId(
  id_notif: number
): Notificacion | undefined {

  return notificaciones.find(
    notificacion => notificacion.id_notif === id_notif
  );
}

export function buscarNotificacionesPorUsuario(
  id_usuario: number
): Notificacion[] {

  return notificaciones.filter(
    notificacion => notificacion.id_usuario === id_usuario
  );
}

export function buscarNotificacionesPorMatricula(
  id_matricula: number
): Notificacion[] {

  return notificaciones.filter(
    notificacion => notificacion.id_matricula === id_matricula
  );
}

export function actualizarNotificacion(
  id_notif: number,
  datosActualizados: NotificacionRegistro
): Notificacion | null {

  const indice = notificaciones.findIndex(
    notificacion => notificacion.id_notif === id_notif
  );

  if (indice === -1) {
    return null;
  }

  notificaciones[indice] = {
    ...notificaciones[indice],
    ...datosActualizados
  };

  guardarNotificacionesEnJson();

  return notificaciones[indice];
}

export function eliminarNotificacion(
  id_notif: number
): boolean {

  const indice = notificaciones.findIndex(
    notificacion => notificacion.id_notif === id_notif
  );

  if (indice === -1) {
    return false;
  }

  notificaciones.splice(indice, 1);

  guardarNotificacionesEnJson();

  return true;
}