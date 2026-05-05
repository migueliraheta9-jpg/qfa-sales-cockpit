'use client';
import { useState, useMemo } from 'react';
import { Plus, Eye, Trash2, LogOut } from 'lucide-react';
import { COLORS, getLeadAccent } from '../lib/constants';
import { getStatus, isPuertasComplete, getCuelloBotella } from '../lib/scoring';
import { isAdmin } from '../lib/supabase';
import { QFAHeader, StatusBadge } from './Shared';
import { DeleteDialog } from './Dialogs';

export default function Dashboard({ leads, user, onNewCall, onOpenLead, onDeleteLead, onLogout, loading }) {
  const [filter, setFilter] = useState('all');
  const [leadToDelete, setLeadToDelete] = useState(null);

  const userIsAdmin = isAdmin(user);

  const filtered = useMemo(() => {
    if (filter === 'all') return leads;
    return leads.filter((l) => getStatus(l) === filter);
  }, [leads, filter]);

  const stats = useMemo(() => {
    const counts = { hot: 0, warm: 0, cold: 0, 'closed-won': 0 };
    leads.forEach((l) => {
      const s = getStatus(l);
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [leads]);

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg }}>
      <div className="max-w-7xl mx-auto px-10 py-12">
        <QFAHeader
          rightSlot={
            <div className="flex items-center gap-3">
              <div
                className="px-3 py-1.5 rounded-md text-[10px] tracking-[0.25em] font-bold flex items-center gap-2"
                style={{ border: `1px solid ${COLORS.border}`, color: COLORS.muted }}
              >
                <span style={{ color: COLORS.green }}>●</span>
                COHORTE ACTIVA · 5 CUPOS
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: userIsAdmin ? COLORS.cyan : COLORS.lavanda, color: COLORS.bg }}>
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-xs" style={{ color: COLORS.white }}>
                  {userIsAdmin ? 'Miguel' : user?.email?.split('@')[0]}
                </span>
                {userIsAdmin && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: COLORS.cyan + '22', color: COLORS.cyan, fontWeight: 700 }}>
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md transition"
                style={{ background: 'transparent', color: COLORS.muted, border: `1px solid ${COLORS.border}` }}
                title="Cerrar sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          }
        />

        <div className="flex items-end justify-between mb-12 pb-8 border-b" style={{ borderColor: COLORS.border }}>
          <div>
            <div className="text-[10px] tracking-[0.4em] mb-3" style={{ color: COLORS.muted }}>
              DOCUMENTO INTERNO · SALES COCKPIT · v2.0
            </div>
            <h1
              className="text-7xl font-normal leading-none"
              style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white, letterSpacing: '-0.03em' }}
            >
              Sesiones <em style={{ color: COLORS.cyan }}>estratégicas</em>
            </h1>
            <p className="mt-4 text-lg" style={{ color: COLORS.muted, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
              {userIsAdmin ? 'Vista admin — viendo todas las sesiones del equipo' : 'Diagnóstico, cierre y seguimiento — guion v2.0'}
            </p>
          </div>
          <button
            onClick={onNewCall}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3.5 font-bold rounded-md transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: COLORS.white, color: COLORS.bg }}
          >
            <Plus size={18} /> Nueva Sesión
          </button>
        </div>

        <div className="grid grid-cols-4 gap-0 mb-14 border-y py-8" style={{ borderColor: COLORS.border }}>
          {[
            { label: 'CALIENTES', value: stats.hot, color: COLORS.orange },
            { label: 'TIBIOS', value: stats.warm, color: COLORS.lavanda },
            { label: 'FRÍOS', value: stats.cold, color: COLORS.muted },
            { label: 'CERRADOS', value: stats['closed-won'], color: COLORS.green },
          ].map((s, i) => (
            <div key={i} className="px-6 first:pl-0 last:pr-0" style={{ borderRight: i < 3 ? `1px solid ${COLORS.border}` : 'none' }}>
              <div className="text-7xl font-normal leading-none mb-3" style={{ fontFamily: 'Instrument Serif, serif', color: s.color }}>
                {String(s.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] tracking-[0.3em]" style={{ color: COLORS.muted }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { v: 'all', l: 'Todos' },
            { v: 'hot', l: 'Calientes' },
            { v: 'warm', l: 'Tibios' },
            { v: 'cold', l: 'Fríos' },
            { v: 'in-progress', l: 'En progreso' },
            { v: 'closed-won', l: 'Cerrados' },
            { v: 'closed-lost', l: 'Perdidos' },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className="px-4 py-2 text-xs font-bold tracking-wider rounded-md transition-all"
              style={{
                background: filter === f.v ? COLORS.white : 'transparent',
                color: filter === f.v ? COLORS.bg : COLORS.muted,
                border: `1px solid ${filter === f.v ? COLORS.white : COLORS.border}`,
              }}
            >
              {f.l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="rounded-lg overflow-hidden border" style={{ borderColor: COLORS.border }}>
          <div className={`grid ${userIsAdmin ? 'grid-cols-13' : 'grid-cols-12'} gap-3 px-5 py-3 text-[10px] tracking-[0.25em] font-bold`}
            style={{ background: COLORS.bgLight, color: COLORS.muted, gridTemplateColumns: userIsAdmin ? '2fr 2fr 2fr 1fr 2fr 2fr 2fr' : '3fr 2fr 1fr 2fr 2fr 2fr' }}>
            <div>PROSPECTO</div>
            {userIsAdmin && <div>OWNER</div>}
            <div>ESTADO</div>
            <div>TEMP</div>
            <div>CUELLO BOTELLA</div>
            <div>CIFRA / BONO</div>
            <div className="text-right">ACCIONES</div>
          </div>
          {filtered.length === 0 ? (
            <div className="p-12 text-center" style={{ background: COLORS.bgLight, color: COLORS.muted }}>
              <div className="italic" style={{ fontFamily: 'Instrument Serif, serif', fontSize: '20px' }}>
                {loading ? 'Cargando sesiones…' : 'Sin sesiones que mostrar'}
              </div>
              {!loading && <div className="text-sm mt-2">Crea tu primera sesión estratégica con el botón de arriba</div>}
            </div>
          ) : (
            filtered.map((lead) => {
              const status = getStatus(lead);
              const cuello = isPuertasComplete(lead) ? getCuelloBotella(lead) : '—';
              const bonoLeft = lead.bonoExpiresAt ? Math.max(0, Math.round((new Date(lead.bonoExpiresAt) - new Date()) / 3600000)) : null;
              const accent = getLeadAccent(lead);
              const ownerName = lead.owner_email === 'migueliraheta.9@gmail.com' ? 'Miguel' : lead.owner_email?.split('@')[0] || '—';
              return (
                <div
                  key={lead.id}
                  className="grid gap-3 px-5 py-4 items-center border-t hover:bg-white/[0.02] transition cursor-pointer"
                  style={{ background: COLORS.bgLight, borderColor: COLORS.border, color: COLORS.white,
                    gridTemplateColumns: userIsAdmin ? '2fr 2fr 2fr 1fr 2fr 2fr 2fr' : '3fr 2fr 1fr 2fr 2fr 2fr' }}
                  onClick={() => onOpenLead(lead.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent.color }} />
                      <div className="font-bold">{lead.name || '(sin nombre)'}</div>
                    </div>
                    <div className="text-xs mt-0.5 ml-3.5" style={{ color: COLORS.muted }}>
                      {lead.callDate ? new Date(lead.callDate).toLocaleString('es-SV', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </div>
                  </div>
                  {userIsAdmin && (
                    <div className="text-xs" style={{ color: COLORS.muted }}>
                      {ownerName}
                    </div>
                  )}
                  <div><StatusBadge status={status} size="sm" /></div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', color: COLORS.cyan }}>
                    {lead.temperatura || '—'}
                  </div>
                  <div className="text-sm">{cuello}</div>
                  <div className="text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {lead.cifraInvertida ? `$${parseFloat(lead.cifraInvertida).toLocaleString()}` : '—'}
                    {bonoLeft !== null && status !== 'closed-won' && status !== 'closed-lost' && (
                      <div className="text-[10px] mt-0.5" style={{ color: bonoLeft > 0 ? COLORS.orange : COLORS.muted }}>
                        {bonoLeft > 0 ? `Bono: ${bonoLeft}h` : 'Bono expirado'}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onOpenLead(lead.id); }}
                      className="p-2 rounded-md transition" style={{ background: COLORS.cyan + '15', color: COLORS.cyan }} title="Abrir cockpit">
                      <Eye size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setLeadToDelete(lead); }}
                      className="p-2 rounded-md transition" style={{ background: COLORS.orange + '15', color: COLORS.orange }} title="Borrar sesión">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-10 pt-6 border-t flex items-center justify-between text-[10px] tracking-[0.3em]" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
          <span>QFA · 2026 / 03</span>
          <span>SAN SALVADOR, EL SALVADOR</span>
        </div>
      </div>

      {leadToDelete && (
        <DeleteDialog
          lead={leadToDelete}
          onConfirm={() => { onDeleteLead(leadToDelete.id); setLeadToDelete(null); }}
          onCancel={() => setLeadToDelete(null)}
        />
      )}
    </div>
  );
}
