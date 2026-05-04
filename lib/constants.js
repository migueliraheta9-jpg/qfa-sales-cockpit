// ============================================================
// IDENTIDAD QFA
// ============================================================

export const COLORS = {
  bg: '#0A0A0A',
  bgLight: '#141414',
  bgLighter: '#1F1F1F',
  border: '#2A2A2A',
  cyan: '#4DC7F6',
  lavanda: '#C890D1',
  orange: '#F78E0E',
  green: '#61F1AC',
  white: '#F5F5F5',
  muted: '#7A7A7A',
  mutedDim: '#555555',
  hot: '#F78E0E',
  warm: '#C890D1',
  cold: '#555555',
  success: '#61F1AC',
};

export const MERCADO_COFOUNDER = {
  Futuros: { name: 'Miguel', color: COLORS.cyan, mercado: 'Futuros' },
  Cripto: { name: 'Julio', color: COLORS.orange, mercado: 'Cripto' },
  'Índices sintéticos': { name: 'Jessen', color: COLORS.lavanda, mercado: 'Sintéticos' },
  Forex: { name: 'Miguel', color: COLORS.cyan, mercado: 'Forex' },
  Acciones: { name: 'Miguel', color: COLORS.cyan, mercado: 'Acciones' },
};

export function getLeadAccent(lead) {
  const arr = Array.isArray(lead?.mercados) ? lead.mercados : [];
  if (arr.includes('Cripto')) return MERCADO_COFOUNDER['Cripto'];
  if (arr.includes('Índices sintéticos')) return MERCADO_COFOUNDER['Índices sintéticos'];
  if (arr.includes('Futuros')) return MERCADO_COFOUNDER['Futuros'];
  if (arr.length > 0 && MERCADO_COFOUNDER[arr[0]]) return MERCADO_COFOUNDER[arr[0]];
  return { name: 'QFA', color: COLORS.cyan, mercado: '' };
}

export const PUERTAS = [
  {
    id: 'p1', num: 1, title: '¿Por qué ahora?', timeRange: '3:00 – 5:00',
    pregunta: '"¿Qué fue lo que te hizo decir \'voy a agendar esta llamada\'? ¿Qué está pasando con tu trading que te hizo buscar algo diferente?"',
    seguimiento: 'Si genérico: "¿Y por qué ahora y no hace 6 meses? ¿Pasó algo específico?"',
    busca: 'El evento detonante. Lo vas a usar literal en el cierre.',
    fields: [
      { key: 'motivacion', label: 'Motivación detrás del agendamiento', type: 'multi',
        options: ['Pérdida reciente significativa','Frustración acumulada / cansado de no avanzar','Cambio de vida (deuda, pareja, trabajo)','Promesa a sí mismo / fecha límite','Comparación con otros (FOMO)','Recomendación de alguien','Otra'] },
      { key: 'eventoDetonante', label: 'Cita literal del evento detonante', type: 'text',
        placeholder: 'Ej: "Perdí $3K la semana pasada por no respetar el SL"',
        critical: true, usedIn: 'Cierre — devolver textualmente' },
    ],
  },
  {
    id: 'p2', num: 2, title: 'Situación actual', timeRange: '5:00 – 9:00',
    pregunta: '"¿Cómo estás operando hoy? ¿Cuenta real, demo, prop firm? ¿Qué mercados? ¿Cómo eliges tus entradas? ¿Te sientes seguro o sientes que estás apostando?"',
    busca: 'Nivel real. Cuenta real → corrección. Demo → fundamentos.',
    fields: [
      { key: 'tipoCuenta', label: 'Tipo de cuenta', type: 'single',
        options: ['Real','Demo','Prop firm / funded','No opera todavía'] },
      { key: 'mercados', label: 'Mercados que opera', type: 'multi',
        options: ['Forex','Futuros','Cripto','Acciones','Índices sintéticos','Otros'] },
      { key: 'estadoEstrategia', label: 'Estado de la estrategia', type: 'single',
        options: ['Tiene estrategia clara y la sigue','Tiene estrategia pero la rompe en vivo','Probando varias / inconsistente','Sin estrategia / opera por impulso'] },
      { key: 'confianzaApertura', label: 'Confianza al abrir operación', type: 'single',
        options: ['Muy seguro / opera con criterio','Seguro la mayoría de veces','Mitad y mitad','Inseguro / opera con miedo','Sabe que está apostando'] },
    ],
  },
  {
    id: 'p3', num: 3, title: 'Historial de intentos', timeRange: '9:00 – 12:00',
    pregunta: '"¿Qué has intentado antes? ¿Cuánto dirías que has invertido en formación, entre cursos, mentorías y capital perdido por falta de proceso?"',
    busca: 'La cifra textual. La usarás literal en Objeción 5 (precio).',
    fields: [
      { key: 'intentos', label: 'Qué ha intentado', type: 'multi',
        options: ['Cursos online','Mentorías 1:1','Señales pagadas','YouTube','Libros','Grupos de Telegram','Ninguno'] },
      { key: 'cifraInvertida', label: 'Cifra total invertida (USD)', type: 'number',
        placeholder: 'Ej: 5000', critical: true, usedIn: 'Objeción 5 (precio) — se inyecta literal' },
    ],
  },
  {
    id: 'p4', num: 4, title: 'Costo de no actuar', timeRange: '12:00 – 14:00',
    pregunta: '"Si sigues operando igual, ¿qué crees que pasa en los próximos 6 meses? ¿Cuánto más estás dispuesto a perder antes de hacer algo diferente?"',
    busca: 'Que él se diga a sí mismo que el costo de no actuar es mayor que el costo de invertir.',
    fields: [
      { key: 'futuro6Meses', label: 'Qué pasa en 6 meses si sigue igual', type: 'single',
        options: ['Sigue perdiendo dinero','Abandona el trading','Sigue estancado en lo mismo','No quiere pensarlo'] },
      { key: 'costoNoActuar', label: 'Costo verbalizado (cifra o situación literal)', type: 'text',
        placeholder: 'Ej: "Probablemente otros $5K perdidos y abandono"',
        critical: true, usedIn: 'Cierre — devolver textualmente' },
    ],
  },
  {
    id: 'p5', num: 5, title: 'Meta concreta', timeRange: '14:00 – 17:00',
    pregunta: '"En los próximos 3-4 meses, ¿cuál sería un resultado que te haría sentir que tomaste la decisión correcta?"',
    busca: 'Anclar a proceso y mejora medible, no a cifras de ingresos.',
    fields: [
      { key: 'tipoMeta', label: 'Tipo de meta', type: 'single',
        options: ['Cifra de ingresos mensual','Cuenta funded aprobada','Reemplazar salario actual','Operar consistente (sin importar monto)','Recuperar lo perdido','Libertad / cambio de vida'] },
      { key: 'metaLiteral', label: 'Meta literal a 3-4 meses', type: 'text',
        placeholder: 'Ej: "Sacar mi primera cuenta funded $50K"',
        critical: true, usedIn: 'Presentación — anclar al proceso' },
    ],
  },
  {
    id: 'p6', num: 6, title: 'Compromiso real', timeRange: '17:00 – 19:00',
    pregunta: '"El programa requiere documentar trades, formularios semanales, 2 clases grupales por semana, traer bitácora a cada 1:1. Sin bitácora no hay sesión. ¿Te parece razonable o demasiado?"',
    busca: 'Si dice "es lo que necesito" → comprador serio. Si dice "no tengo tiempo" → no es tu cliente.',
    fields: [
      { key: 'reaccionCompromiso', label: 'Reacción al requerimiento', type: 'single',
        options: ['🟢 "Eso es lo que necesito"','🟡 Acepta pero con dudas','🟠 Intenta negociar el compromiso','🔴 "No tengo tiempo para eso"'] },
    ],
  },
  {
    id: 'p7', num: 7, title: 'Urgencia', timeRange: '19:00 – 20:00',
    pregunta: '"¿Esto es algo que quieres resolver ahora, o puede esperar?"',
    busca: 'Si "ahora" → presentar oferta. Si "en algún momento" → "¿qué tendría que pasar para que fuera ahora?"',
    fields: [
      { key: 'urgencia', label: 'Disposición temporal', type: 'single',
        options: ['Ahora','Próximas 2 semanas','En algún momento (vago)','No definido'] },
    ],
  },
];

export const OBJECTIONS = [
  { id: 'o1', title: 'No tengo el dinero ahora', short: 'Dinero', icon: '💰',
    script: (lead) => `PASO 1 — AISLAR:
"Entiendo. Supongamos que el dinero no fuera un problema — ¿habría alguna otra razón para no entrar, o es solo el dinero?"

Si dice "solo el dinero" → PASO 2.

PASO 2 — REENCUADRE CON SU CIFRA:
"NOMBRE, hace un rato me dijiste que has invertido ${lead.cifraInvertida ? `$${lead.cifraInvertida}` : '[CIFRA QUE ÉL DIJO]'} en cursos y formación que no te funcionó. La inversión aquí son $2,000 por un proceso de 12 meses con corrección directa mía — no contenido grabado.

Pero entiendo que $2,000 de golpe puede ser fuerte. Por eso existe el plan: $1,000 ahora y $1,000 en 60 días. Con el primer pago quedas dentro y arrancas esta semana. ¿Eso te funciona?"

Si insiste:
"¿Cuánto podrías invertir hoy para arrancar?"

Si la cifra es muy baja:
"Si invertir $1,000 hoy compromete tu estabilidad, este no es el momento correcto. Prefiero que entres cuando estés en una posición sólida. ¿Te parece si te notifico cuando abramos el siguiente grupo?"` },
  { id: 'o2', title: 'Necesito pensarlo', short: 'Pensarlo', icon: '🤔',
    script: () => `"Claro. Solo por curiosidad — cuando dices que necesitas pensarlo, ¿qué es exactamente lo que necesitas evaluar? ¿Es el dinero? ¿El tiempo? ¿Si el método funciona? ¿O algo más?"

Lo que diga es la objeción real.

SI ES "CONSULTAR CON PAREJA":
"Totalmente válido. ¿Cuál crees que sería la preocupación principal? ¿El dinero, el tiempo, o la duda de si funciona?"

"Te lo resumo así para que puedas explicárselo: 12 meses de acompañamiento. 1 hora al día de estudio. La inversión son $2,000 una vez — o $1,000 + $1,000 en 60 días. Y si en 90 días no ves mejora real, te doy 60 días más sin costo. ¿Crees que con esa información pueden tomar la decisión hoy o mañana?"

SI ES "TIEMPO PARA PENSARLO SOLO":
"Respeto eso. Te pregunto algo: ¿cuántas veces has dicho 'lo voy a pensar' sobre algo de tu trading... y después no hiciste nada?

No te lo digo para presionarte. Te lo digo porque uno de los patrones que veo en traders que no avanzan es exactamente ese. A veces la decisión de invertir en tu formación es el primer trade difícil que ejecutas.

Si necesitas tiempo, tómalo. Solo recuerda dos cosas: los cupos son 5 al mes, y la auditoría inicial solo aplica si confirmas en las próximas 48 horas."` },
  { id: 'o3', title: 'Ya probé cursos y no funcionó', short: 'Cursos previos', icon: '📚',
    script: () => `"Te entiendo. Yo también pasé por eso. Y probablemente esa experiencia es la razón por la que estás siendo cauteloso — lo cual es inteligente.

Te pregunto algo: los cursos que tomaste, ¿tenían a alguien que revisara tus trades personalmente y te dijera qué estabas haciendo mal?"

[Respuesta casi siempre: "no"]

"Exacto. Esa es la diferencia. Un curso te da información y te desea suerte. Aquí yo reviso tus trades reales, identifico el error que más te está costando, y te dejo ejercicios específicos para corregirlo. Cada 15 días. Durante 3 meses. Y después seguimiento mensual por 8 meses más.

No es lo mismo tener acceso a información que tener a alguien corrigiéndote en vivo. Javis tomó cursos durante 2 años sin hacer un solo retiro. En 4 meses con corrección directa, empezó a retirar consistentemente."` },
  { id: 'o4', title: '¿Cómo sé que esto funciona?', short: '¿Funciona?', icon: '🔍',
    script: () => `"Es la pregunta correcta. Y no te voy a pedir que me creas a mí.

[COMPARTIR PANTALLA — TESTIMONIOS]

Javis: llegó sin retiros, hoy retira consistentemente. Marvin: llegó siendo impulsivo, ahora opera con disciplina y lleva meses positivos consecutivos.

Mi propia cuenta funded de seis cifras la opero todos los días con el mismo sistema que te enseño. No te vendo una teoría que no aplico.

Pero te voy a ser honesto: si no haces el trabajo, no funciona. Si no documentas, si no vienes a las clases, si no traes tu bitácora — el programa no te da resultados. El sistema funciona si tú ejecutas. Por eso tenemos reglas estrictas: sin bitácora no hay sesión 1:1. Eso filtra a quienes van en serio."` },
  { id: 'o5', title: 'Es muy caro / $2K es mucho', short: 'Caro', icon: '💵',
    script: (lead) => `"Entiendo. $2,000 es una inversión importante.

Te hago una pregunta: tú me dijiste hace un rato que has perdido dinero operando sin proceso, y que has invertido en cursos que no te funcionaron. ${lead.cifraInvertida ? `Mencionaste $${lead.cifraInvertida}.` : ''} ¿Cuánto crees que te ha costado en total — entre pérdidas en el mercado y formación que no dio resultado — operar sin un proceso real durante este último año?"

[Dejar que ÉL diga la cifra. Esa cifra es tuya, no inventada.]

"Lo que te estoy proponiendo no es agregar otro gasto a esa lista. Es invertir, una vez, en lo que evita que esa lista siga creciendo: un proceso de 12 meses con corrección directa.

Si lo divides, son $167 al mes por acompañamiento real. La pregunta no es si $2,000 es mucho — la pregunta es si vale más que seguir donde estás.

¿El problema es el monto total, o es que $2,000 de golpe es fuerte? Porque si es lo segundo, tienes el plan de $1,000 + $1,000."` },
  { id: 'o6', title: 'No tengo tiempo', short: 'Tiempo', icon: '⏱️',
    script: () => `"¿Cuánto tiempo le estás dedicando al trading ahora — entre ver gráficos, estudiar, operar, ver contenido en redes?"

[Casi siempre 1-3 horas/día]

"Lo que necesitas para QF es 1 hora al día, 5 días a la semana. Más las 2 clases grupales — lunes y jueves por la mañana, 1 hora cada una.

La diferencia es que esas horas van a ser productivas. Ahora probablemente gastas 2 horas viendo videos de YouTube que no aplicas. Aquí cada hora tiene un propósito: o estás practicando un ejercicio específico que te dejé, o estás documentando, o estás en clase grupal donde se resuelven dudas reales.

No es más tiempo. Es tiempo mejor invertido."

SI GENUINAMENTE NO TIENE 1H/DÍA:
"Si no puedes dedicar 1 hora al día al proceso, el programa no va a funcionar. Prefiero decírtelo ahora que después de que pagues. Cuando tu agenda lo permita, hablamos."` },
  { id: 'o7', title: 'Déjame ver otros programas', short: 'Comparar', icon: '🔄',
    script: () => `"Me parece bien que compares. Te lo recomiendo. Cuando lo hagas, te pido que preguntes 3 cosas:

PRIMERO — ¿el mentor opera una cuenta funded con dinero real, o solo enseña teoría?
SEGUNDO — ¿te corrigen tus trades personalmente, o te dan contenido grabado?
TERCERO — ¿cuánto dura el acompañamiento? Porque 4-8 semanas no es suficiente.

Compara con esas 3 preguntas. Y mientras decides — recuerda que los 5 cupos de este mes se llenan en orden de confirmación. Si me confirmas en 48h, tu cupo queda reservado."` },
  { id: 'o8', title: 'No sé si estoy listo', short: 'No listo', icon: '😰',
    script: () => `"¿Qué significa 'listo' para ti? ¿Qué tendría que pasar para que sintieras que lo estás?"

[Escuchar. Usualmente es miedo a fracasar de nuevo o síndrome del impostor.]

"La mayoría de traders que entran a QF se sienten exactamente como tú en este momento. Nadie llega sintiéndose listo. Llegan porque están cansados de no avanzar solos.

El mes 1 del programa existe precisamente para esto — es de adaptación. No te tiro al agua profunda. Pero sí te exijo que hagas el trabajo.

La pregunta no es si estás listo. La pregunta es si estás cansado de seguir donde estás."` },
  { id: 'o9', title: '¿Por qué 12 meses?', short: '12 meses', icon: '📅',
    script: () => `"Porque la realidad del trading es que no te transformas en 4 semanas. Ni en 8. Los programas cortos te dan información — pero no te dan tiempo para practicar, cometer errores, recibir corrección, y consolidar un proceso.

Mes 1 estudias los fundamentos. Del mes 2 al 4 yo te corrijo en vivo. Del mes 5 al 12 operas con autonomía y seguimiento mensual. Para el mes 12 tienes una sesión de graduación donde presentas tu curva de equity del año completo.

¿Sabes cuántas academias de trading te gradúan? Ninguna. Porque la mayoría no dura lo suficiente para ver si su método realmente funciona.

12 meses es lo que toma hacer esto bien. No hay atajo."` },
  { id: 'o10', title: '¿Y si no me funciona? (Garantía)', short: 'Garantía', icon: '🛡️',
    script: () => `GARANTÍA CANÓNICA:

"Si en 90 días aplicando el sistema, asistiendo a las clases y entregando tu bitácora, no muestras mejora medible en tu porcentaje de acierto y en tu control emocional, te doy 60 días adicionales de mentoría sin costo. Es mi compromiso con tu proceso.

No te garantizo cifras de ingresos — eso depende del mercado y de tu ejecución. Te garantizo que si haces el trabajo y no mejoras, yo invierto más tiempo en ti sin cobrarte.

Y te voy a ser honesto: ningún estudiante que ha cumplido con la bitácora y las sesiones ha necesitado reclamar esa garantía. El sistema funciona cuando se ejecuta."` },
];
