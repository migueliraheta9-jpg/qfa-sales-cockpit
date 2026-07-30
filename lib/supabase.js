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
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('data->>publicId', publicId)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeLead(data) : null;
}

export async function createLead(initial = {}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('No autenticado');

  const now = new Date().toISOString();
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
    ...initial,
  };
  const { data: row, error } = await supabase
    .from(TABLE)
    .insert({
      name: initial.name || '',
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
