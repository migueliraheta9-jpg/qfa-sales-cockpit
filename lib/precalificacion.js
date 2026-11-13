// Preguntas de precalificación.
//
// COPIA de qfa-web (src/config/precalificacion.ts): deben ser LAS MISMAS preguntas que el
// formulario de /diagnostico del sitio. Si se cambian allí, cambiar aquí también.
//
// Mientras la lista esté vacía (como en el sitio hoy), el bloque de preguntas no aparece
// ni en el alta manual ni en la edición de la ficha.
//
// Forma de cada pregunta:
//   { id: 'experiencia', etiqueta: 'Texto de la pregunta', tipo: 'opcion' | 'texto',
//     opciones: [{ valor: 'a', etiqueta: 'Texto de la opción' }] }
// En el Cockpit todas son opcionales.
export const PREGUNTAS = [];

// Formato en el que se GUARDA cada respuesta (lead_contacto.precal_respuestas), idéntico al
// del sitio: lleva el texto de la pregunta tal como estaba al responder.
//   { [id]: { pregunta: 'texto', respuesta: 'texto legible', valor: 'código (solo opciones)' } }
export function respuestasParaGuardar(preguntas, valores) {
  const guardadas = {};
  for (const pregunta of preguntas) {
    const valor = String(valores?.[pregunta.id] ?? '').trim();
    if (!valor) continue;
    if (pregunta.tipo === 'opcion') {
      const opcion = (pregunta.opciones || []).find((item) => item.valor === valor);
      if (!opcion) continue; // un valor que no es una opción no se guarda
      guardadas[pregunta.id] = { pregunta: pregunta.etiqueta, respuesta: opcion.etiqueta, valor };
    } else {
      guardadas[pregunta.id] = { pregunta: pregunta.etiqueta, respuesta: valor };
    }
  }
  return guardadas;
}

// De lo guardado a los valores de los campos del formulario (id → valor).
export function valoresDeRespuestas(preguntas, guardadas) {
  const valores = {};
  for (const pregunta of preguntas) {
    const guardada = guardadas?.[pregunta.id];
    if (!guardada) continue;
    valores[pregunta.id] = typeof guardada === 'string' ? guardada : (guardada.valor ?? guardada.respuesta ?? '');
  }
  return valores;
}

// Lista para mostrar: [{ id, pregunta, respuesta }]. Tolera respuestas guardadas como texto
// simple (formato anterior) y preguntas que ya no están en PREGUNTAS.
export function respuestasParaMostrar(guardadas) {
  return Object.entries(guardadas || {}).map(([id, guardada]) =>
    typeof guardada === 'string'
      ? { id, pregunta: id, respuesta: guardada }
      : { id, pregunta: guardada?.pregunta || id, respuesta: guardada?.respuesta ?? '' },
  );
}

// Al editar: las respuestas nuevas, conservando las de preguntas que ya no existen en
// PREGUNTAS (no se pueden editar, pero tampoco se pierden).
export function combinarRespuestas(preguntas, guardadas, valores) {
  const ids = new Set(preguntas.map((pregunta) => pregunta.id));
  const antiguas = Object.fromEntries(Object.entries(guardadas || {}).filter(([id]) => !ids.has(id)));
  return { ...antiguas, ...respuestasParaGuardar(preguntas, valores) };
}
