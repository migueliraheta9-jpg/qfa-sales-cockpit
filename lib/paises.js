// Países del selector de teléfono / WhatsApp.
//
// COPIA de qfa-web (src/config/paises.ts): misma lista y misma forma de armar el número que
// el formulario de /diagnostico del sitio. Si se cambia allí, cambiar aquí también.
// El número se guarda siempre en formato internacional E.164 (+50370000000).

export const PAISES = [
  { codigo: 'AR', nombre: 'Argentina', prefijo: '+54' },
  { codigo: 'BO', nombre: 'Bolivia', prefijo: '+591' },
  { codigo: 'BR', nombre: 'Brasil', prefijo: '+55' },
  { codigo: 'CA', nombre: 'Canadá', prefijo: '+1' },
  { codigo: 'CL', nombre: 'Chile', prefijo: '+56' },
  { codigo: 'CO', nombre: 'Colombia', prefijo: '+57' },
  { codigo: 'CR', nombre: 'Costa Rica', prefijo: '+506' },
  { codigo: 'CU', nombre: 'Cuba', prefijo: '+53' },
  { codigo: 'EC', nombre: 'Ecuador', prefijo: '+593' },
  { codigo: 'SV', nombre: 'El Salvador', prefijo: '+503' },
  { codigo: 'ES', nombre: 'España', prefijo: '+34' },
  { codigo: 'US', nombre: 'Estados Unidos', prefijo: '+1' },
  { codigo: 'GT', nombre: 'Guatemala', prefijo: '+502' },
  { codigo: 'HN', nombre: 'Honduras', prefijo: '+504' },
  { codigo: 'MX', nombre: 'México', prefijo: '+52' },
  { codigo: 'NI', nombre: 'Nicaragua', prefijo: '+505' },
  { codigo: 'PA', nombre: 'Panamá', prefijo: '+507' },
  { codigo: 'PY', nombre: 'Paraguay', prefijo: '+595' },
  { codigo: 'PE', nombre: 'Perú', prefijo: '+51' },
  { codigo: 'PR', nombre: 'Puerto Rico', prefijo: '+1' },
  { codigo: 'DO', nombre: 'República Dominicana', prefijo: '+1' },
  { codigo: 'UY', nombre: 'Uruguay', prefijo: '+598' },
  { codigo: 'VE', nombre: 'Venezuela', prefijo: '+58' },
];

// Valor del selector para escribir el número completo con su prefijo.
export const OTRO_PAIS = 'OTRO';
export const PAIS_POR_DEFECTO = 'SV'; // +503

// La misma regla que valida el servidor del sitio y la base de datos.
export const E164 = /^\+[1-9]\d{7,14}$/;

// Arma el número internacional. Devuelve '' si no hay número.
// - Con país: prefijo + dígitos (sin ceros iniciales de marcación local).
// - Si ya se escribió con "+", se respeta tal cual.
export function armarWhatsapp(codigoPais, numero) {
  const limpio = String(numero || '').replace(/[\s\-().]/g, '');
  if (!limpio) return '';
  if (limpio.startsWith('+')) return limpio;
  if (limpio.startsWith('00')) return `+${limpio.slice(2)}`;
  const pais = PAISES.find((item) => item.codigo === codigoPais);
  return pais ? `${pais.prefijo}${limpio.replace(/^0+/, '')}` : limpio;
}

// Valida lo que se va a guardar. Devuelve { whatsapp, error }:
// whatsapp '' = sin número; error = mensaje para mostrar, o null.
export function validarTelefono(codigoPais, numero) {
  const whatsapp = armarWhatsapp(codigoPais, numero);
  if (!whatsapp) return { whatsapp: '', error: null };
  if (!whatsapp.startsWith('+')) return { whatsapp, error: 'Elige el país o escribe el número con su prefijo (+…).' };
  if (!E164.test(whatsapp)) return { whatsapp, error: 'Revisa el número: elige el país y escribe el número completo.' };
  return { whatsapp, error: null };
}

// Lo contrario de armarWhatsapp, para editar un número ya guardado:
// "+50370000000" → { pais: 'SV', numero: '70000000' }.
export function separarWhatsapp(whatsapp) {
  if (!whatsapp) return { pais: PAIS_POR_DEFECTO, numero: '' };
  const candidatos = PAISES.filter((item) => whatsapp.startsWith(item.prefijo)).sort((a, b) => b.prefijo.length - a.prefijo.length);
  // Varios países comparten prefijo (+1): se deja el número completo para no adivinar.
  const unico = candidatos.filter((item) => item.prefijo === candidatos[0]?.prefijo).length === 1;
  if (candidatos[0] && unico) return { pais: candidatos[0].codigo, numero: whatsapp.slice(candidatos[0].prefijo.length) };
  return { pais: OTRO_PAIS, numero: whatsapp };
}
