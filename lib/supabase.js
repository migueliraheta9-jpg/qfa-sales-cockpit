import { createClient } from '@supabase/supabase-js';

let _client = null;

function getSupabaseClient() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno');
  }

  _client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

export const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

const TABLE = 'leads';
const ADMIN_EMAIL = 'migueliraheta.9@gmail.com';

function shortId() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

// ============================================================
// AUTH
// ============================================================

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return data.subscription;
}

export function isAdmin(user) {
  return user?.email === ADMIN_EMAIL;
}

// ============================================================
// DATA
// ============================================================

export async function listLeads() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeLead);
}

export async function getLeadByPublicId(publicId) {
  // El reporte público se lee con la función reporte_publico de la base de datos,
  // que devuelve un solo lead a partir de su publicId exacto.
  const { data, error } = await supabase.rpc('reporte_publico', { p_public_id: publicId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? normalizeLead(row) : null;
}

export async function createLead(initial = {}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('No autenticado');

  const now = new Date().toISOString();
  // El nombre va en su columna, no dentro de `data` (si quedara en los dos sitios,
  // el de `data` taparía los cambios posteriores del nombre).
  const { name, ...extra } = initial;
  const data = {
    callDate: now,
    resumedAt: now,
    accumulatedSeconds: 0,
    pausedAt: null,
    endedAt: null,
    motivacion: [],
    mercados: [],
    intentos: [],
    outcome: null,
    bonoExpiresAt: null,
    publicId: shortId(),
    ...extra,
  };
  const { data: row, error } = await supabase
    .from(TABLE)
    .insert({
      name: name || '',
      data,
      owner_email: user.email,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return normalizeLead(row);
}

export async function updateLead(id, patch) {
  const { data: existing, error: fetchErr } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (fetchErr) throw fetchErr;

  const newData = { ...(existing.data || {}) };
  let newName = existing.name;

  for (const [k, v] of Object.entries(patch)) {
    if (k === 'name') newName = v;
    else newData[k] = v;
  }

  const { data: row, error } = await supabase
    .from(TABLE)
    .update({
      name: newName,
      data: newData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return normalizeLead(row);
}

export async function deleteLead(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ============================================================
// DATOS DE CONTACTO (tabla lead_contacto)
// ============================================================
// El teléfono, el email y las respuestas de precalificación NO viven en `leads`:
// `leads.data` alimenta el reporte público /r/{publicId}. Por eso:
//   - Se leen aparte, solo al abrir un lead, y nunca se mezclan con el objeto `lead`.
//   - Se escriben solo mediante dos funciones de la base, que comprueban que la sesión
//     sea del equipo (staff_allowlist) y que el lead sea visible para quien edita.
// La base decide el acceso; aquí no hay ninguna clave nueva.

const COLUMNAS_CONTACTO = [
  'id', 'origen', 'nombre', 'email', 'whatsapp',
  'whatsapp_consentimiento_marketing', 'whatsapp_consentimiento_marketing_at',
  'utm_source', 'utm_medium', 'utm_campaign', 'landing_path', 'lp_slug', 'recurso_descargado',
  'precal_respuestas', 'calificado', 'calificado_motivo',
  'cita_inicio', 'cita_estado', 'meet_url',
  'promovido_at', 'created_at', 'updated_at',
].join(',');

// Devuelve el contacto del lead, o null si no tiene (o si la cuenta no es del equipo).
export async function getContactoByLeadId(leadId) {
  const { data, error } = await supabase
    .from('lead_contacto')
    .select(COLUMNAS_CONTACTO)
    .eq('lead_id', leadId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Mensajes legibles para los errores que devuelven las funciones de la base.
const ERRORES_CONTACTO = {
  no_autorizado: 'Tu cuenta no tiene permiso para editar datos de contacto.',
  lead_no_disponible: 'No tienes acceso a este lead.',
  whatsapp_invalido: 'El número no es válido. Debe ir en formato internacional (+503…).',
  respuestas_invalidas: 'Las respuestas no tienen el formato esperado.',
  contacto_ya_existe: 'Este lead ya tiene datos de contacto.',
  whatsapp_con_consentimiento: 'No se puede borrar el número: la persona aceptó mensajes de seguimiento en él.',
};
function errorDeContacto(error) {
  const legible = ERRORES_CONTACTO[error?.message];
  return new Error(legible || error?.message || 'No se pudo guardar el contacto.');
}

// Alta manual: guarda nombre, teléfono y respuestas de un lead recién creado a mano.
// whatsapp: '' o null = sin número. respuestas: objeto en el formato de lib/precalificacion.js.
export async function crearContactoManual(leadId, { nombre, whatsapp, respuestas }) {
  const { data, error } = await supabase.rpc('contacto_alta_manual', {
    p_lead_id: leadId,
    p_nombre: nombre || null,
    p_whatsapp: whatsapp || null,
    p_respuestas: respuestas && Object.keys(respuestas).length > 0 ? respuestas : null,
  });
  if (error) throw errorDeContacto(error);
  return data;
}

// Edición. Cada campo es opcional: `undefined` = no cambiar.
// whatsapp: '' = borrar el número. respuestas: reemplaza todas las respuestas.
export async function editarContacto(leadId, { whatsapp, respuestas } = {}) {
  const { data, error } = await supabase.rpc('contacto_editar', {
    p_lead_id: leadId,
    p_whatsapp: whatsapp === undefined ? null : whatsapp,
    p_respuestas: respuestas === undefined ? null : respuestas,
  });
  if (error) throw errorDeContacto(error);
  return data;
}

function normalizeLead(row) {
  return {
    id: row.id,
    name: row.name,
    owner_email: row.owner_email,
    updated_at: row.updated_at,
    created_at: row.created_at,
    ...(row.data || {}),
  };
}
