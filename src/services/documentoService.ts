import fs from "fs";
import path from "path";
import { Documento } from "../models/documentos";

const rutaDocumentosJson =
  process.env.DOCUMENTO_JSON_PATH ??
  path.resolve(__dirname, "../data/documentos.json");

const documentos: Documento[] = [];
let siguienteId = 1;

function cargarDocumentosDesdeJson() {
  if (!fs.existsSync(rutaDocumentosJson)) {
    fs.writeFileSync(rutaDocumentosJson, "[]", "utf8");
    return;
  }

  const contenido = fs.readFileSync(rutaDocumentosJson, "utf8");

  if (!contenido.trim()) {
    fs.writeFileSync(rutaDocumentosJson, "[]", "utf8");
    return;
  }

  const datos = JSON.parse(contenido) as Documento[];

  if (datos.length > 0) {
    datos.forEach(documento => documentos.push(documento));
    siguienteId = Math.max(...datos.map(documento => documento.id_documento), 0) + 1;
  }
}

function guardarDocumentosEnJson() {
  fs.writeFileSync(
    rutaDocumentosJson,
    JSON.stringify(documentos, null, 2),
    "utf8"
  );
}

cargarDocumentosDesdeJson();

type DocumentoRegistro = Omit<Documento, "id_documento">;

export function crearDocumento(
  documento: DocumentoRegistro
): Documento {

  const nuevoDocumento: Documento = {
    id_documento: siguienteId++,
    ...documento
  };

  documentos.push(nuevoDocumento);
  guardarDocumentosEnJson();

  return nuevoDocumento;
}

export function listarDocumentos(): Documento[] {
  return documentos;
}

export function buscarDocumentoPorId(
  id_documento: number
): Documento | undefined {

  return documentos.find(
    documento => documento.id_documento === id_documento
  );
}

export function buscarDocumentosPorMatricula(
  id_matricula: number
): Documento[] {

  return documentos.filter(
    documento => documento.id_matricula === id_matricula
  );
}

export function actualizarDocumento(
  id_documento: number,
  datosActualizados: DocumentoRegistro
): Documento | null {

  const indice = documentos.findIndex(
    documento => documento.id_documento === id_documento
  );

  if (indice === -1) {
    return null;
  }

  documentos[indice] = {
    ...documentos[indice],
    ...datosActualizados
  };

  guardarDocumentosEnJson();

  return documentos[indice];
}

export function eliminarDocumento(
  id_documento: number
): boolean {

  const indice = documentos.findIndex(
    documento => documento.id_documento === id_documento
  );

  if (indice === -1) {
    return false;
  }

  documentos.splice(indice, 1);

  guardarDocumentosEnJson();

  return true;
}