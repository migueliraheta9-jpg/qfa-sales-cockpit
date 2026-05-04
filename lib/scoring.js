import { PUERTAS } from './constants';

export function scoreSistemaTecnico(lead) {
  const map = {
    'Tiene estrategia clara y la sigue': 8,
    'Tiene estrategia pero la rompe en vivo': 5,
    'Probando varias / inconsistente': 3,
    'Sin estrategia / opera por impulso': 1,
  };
  return map[lead.estadoEstrategia] ?? 0;
}

export function scoreControlEmocional(lead) {
  const conf = {
    'Muy seguro / opera con criterio': 8,
    'Seguro la mayoría de veces': 6,
    'Mitad y mitad': 4,
    'Inseguro / opera con miedo': 2,
    'Sabe que está apostando': 1,
  }[lead.confianzaApertura] ?? 0;
  const compr = {
    '🟢 "Eso es lo que necesito"': 2,
    '🟡 Acepta pero con dudas': 1,
    '🟠 Intenta negociar el compromiso': 0,
    '🔴 "No tengo tiempo para eso"': -1,
  }[lead.reaccionCompromiso] ?? 0;
  return Math.max(0, Math.min(10, conf + compr));
}

export function scoreGestionRiesgo(lead) {
  const cuenta = {
    Real: 5,
    Demo: 4,
    'Prop firm / funded': 3,
    'No opera todavía': 2,
  }[lead.tipoCuenta] ?? 0;
  const cifra = parseFloat(lead.cifraInvertida) || 0;
  const penalty =
    cifra >= 10000 ? -3 : cifra >= 5000 ? -2 : cifra >= 1000 ? -1 : 0;
  return Math.max(0, Math.min(10, cuenta + penalty + 2));
}

export function scoreConsistencia(lead) {
  const estr = {
    'Tiene estrategia clara y la sigue': 6,
    'Tiene estrategia pero la rompe en vivo': 3,
    'Probando varias / inconsistente': 2,
    'Sin estrategia / opera por impulso': 1,
  }[lead.estadoEstrategia] ?? 0;
  const compr = {
    '🟢 "Eso es lo que necesito"': 3,
    '🟡 Acepta pero con dudas': 2,
    '🟠 Intenta negociar el compromiso': 1,
    '🔴 "No tengo tiempo para eso"': 0,
  }[lead.reaccionCompromiso] ?? 0;
  return Math.max(0, Math.min(10, estr + compr));
}

export function getRadarData(lead) {
  return [
    { axis: 'Sistema técnico', actual: scoreSistemaTecnico(lead), proyectado: 9 },
    { axis: 'Control emocional', actual: scoreControlEmocional(lead), proyectado: 9 },
    { axis: 'Gestión de riesgo', actual: scoreGestionRiesgo(lead), proyectado: 9 },
    { axis: 'Consistencia', actual: scoreConsistencia(lead), proyectado: 9 },
  ];
}

export function getCuelloBotella(lead) {
  const data = getRadarData(lead);
  const min = data.reduce((a, b) => (a.actual < b.actual ? a : b));
  return min.axis;
}

export function getAxisDescription(axis, lead) {
  if (axis === 'Sistema técnico') {
    return {
      'Tiene estrategia clara y la sigue': 'Tienes una estrategia definida y la respetas. El siguiente paso es refinar la ejecución y el criterio.',
      'Tiene estrategia pero la rompe en vivo': 'Tienes método pero lo rompes bajo presión. Ahí trabajamos: convertir conocimiento en hábito.',
      'Probando varias / inconsistente': 'Saltas entre estrategias buscando "la buena". Necesitas un método único y dominarlo.',
      'Sin estrategia / opera por impulso': 'Operas por intuición. Esto es lo primero que cambiamos: te damos un sistema.',
    }[lead.estadoEstrategia] || 'Sin diagnosticar todavía.';
  }
  if (axis === 'Control emocional') {
    return {
      'Muy seguro / opera con criterio': 'Tu confianza al abrir operaciones es alta.',
      'Seguro la mayoría de veces': 'Operas con cierta confianza, pero hay momentos de duda.',
      'Mitad y mitad': 'Tu seguridad emocional al operar es inestable.',
      'Inseguro / opera con miedo': 'Operas desde el miedo. Cierra trades buenos antes de tiempo y deja correr trades malos.',
      'Sabe que está apostando': 'Reconoces que estás apostando. Ese reconocimiento es el primer paso para cambiarlo.',
    }[lead.confianzaApertura] || 'Sin diagnosticar todavía.';
  }
  if (axis === 'Gestión de riesgo') {
    const cifra = parseFloat(lead.cifraInvertida) || 0;
    if (cifra >= 5000) return `Has invertido $${cifra.toLocaleString()} sin construir un proceso. El problema no es falta de información — es falta de gestión y método.`;
    if (cifra >= 1000) return `Has invertido $${cifra.toLocaleString()} en formación previa. La gestión de riesgo separa a quien sigue invirtiendo de quien empieza a recuperar.`;
    return 'La gestión de riesgo determina si tu cuenta sobrevive el tiempo necesario para volverse rentable.';
  }
  if (axis === 'Consistencia') {
    return {
      '🟢 "Eso es lo que necesito"': 'Estás listo para el nivel de disciplina que requiere consistencia real.',
      '🟡 Acepta pero con dudas': 'Aceptas el compromiso con reservas. Trabajaremos esas reservas en mes 1.',
      '🟠 Intenta negociar el compromiso': 'Buscas atajos al compromiso. Sin proceso documentado no hay consistencia posible.',
      '🔴 "No tengo tiempo para eso"': 'Sin tiempo para documentar, no hay forma de medir mejora. Sin medir, no hay consistencia.',
    }[lead.reaccionCompromiso] || 'Sin diagnosticar todavía.';
  }
  return '';
}

export function calcularTemperaturaSugerida(lead) {
  let score = 5;
  score += {
    '🟢 "Eso es lo que necesito"': 3,
    '🟡 Acepta pero con dudas': 1,
    '🟠 Intenta negociar el compromiso': -1,
    '🔴 "No tengo tiempo para eso"': -4,
  }[lead.reaccionCompromiso] ?? 0;
  score += {
    Ahora: 2, 'Próximas 2 semanas': 1, 'En algún momento (vago)': -1, 'No definido': -2,
  }[lead.urgencia] ?? 0;
  score += {
    'Sigue perdiendo dinero': 1, 'Abandona el trading': 1,
    'Sigue estancado en lo mismo': 0, 'No quiere pensarlo': -1,
  }[lead.futuro6Meses] ?? 0;
  const cifra = parseFloat(lead.cifraInvertida) || 0;
  if (cifra >= 1000) score += 1;
  if (cifra >= 5000) score += 0.5;
  if (lead.eventoDetonante && lead.eventoDetonante.length > 10) score += 0.5;
  if (lead.metaLiteral && lead.metaLiteral.length > 5) score += 0.5;
  return Math.max(1, Math.min(10, Math.round(score)));
}

export function getStatus(lead) {
  if (lead.outcome === 'closed-won') return 'closed-won';
  if (lead.outcome === 'closed-lost') return 'closed-lost';
  const temp = parseInt(lead.temperatura) || 0;
  if (lead.reaccionCompromiso === '🔴 "No tengo tiempo para eso"') return 'cold';
  if (temp >= 9) return 'hot';
  if (temp >= 7) return 'warm';
  if (temp > 0) return 'cold';
  return 'in-progress';
}

export function isPuertasComplete(lead) {
  return PUERTAS.every((p) =>
    p.fields.every((f) => {
      const v = lead[f.key];
      if (f.type === 'multi') return Array.isArray(v) && v.length > 0;
      return v !== undefined && v !== null && v !== '';
    })
  );
}

export function getCompletedPuertas(lead) {
  return PUERTAS.filter((p) =>
    p.fields.every((f) => {
      const v = lead[f.key];
      if (f.type === 'multi') return Array.isArray(v) && v.length > 0;
      return v !== undefined && v !== null && v !== '';
    })
  ).length;
}
