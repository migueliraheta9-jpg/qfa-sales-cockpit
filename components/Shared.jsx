'use client';
import { Flame, Activity, Snowflake, CheckCircle2, X, Circle, AlertOctagon, RefreshCw } from 'lucide-react';
import { COLORS } from '../lib/constants';

export function QFAHeader({ rightSlot }) {
  return (
    <div className="flex items-center justify-between mb-12">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-xl"
          style={{
            background: 'transparent',
            border: `1px solid ${COLORS.muted}`,
            color: COLORS.white,
            fontFamily: 'Instrument Serif, serif',
          }}
        >
          Q
        </div>
        <div className="text-[11px] tracking-[0.3em] font-bold" style={{ color: COLORS.muted }}>
          QUANTUM FLOW ACADEMY
        </div>
      </div>
      {rightSlot || (
        <div
          className="px-3 py-1.5 rounded-md text-[10px] tracking-[0.25em] font-bold flex items-center gap-2"
          style={{ border: `1px solid ${COLORS.border}`, color: COLORS.muted }}
        >
          <span style={{ color: COLORS.green }}>●</span>
          COHORTE ACTIVA · 5 CUPOS
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status, size = 'md' }) {
  const map = {
    hot: { label: 'CALIENTE', color: COLORS.orange, icon: <Flame size={14} /> },
    warm: { label: 'TIBIO', color: COLORS.lavanda, icon: <Activity size={14} /> },
    cold: { label: 'FRÍO', color: COLORS.cold, icon: <Snowflake size={14} /> },
    'closed-won': { label: 'CERRADO', color: COLORS.green, icon: <CheckCircle2 size={14} /> },
    'closed-lost': { label: 'PERDIDO', color: COLORS.muted, icon: <X size={14} /> },
    'in-progress': { label: 'EN PROGRESO', color: COLORS.cyan, icon: <Circle size={14} /> },
  };
  const s = map[status] || map['in-progress'];
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${px} font-bold tracking-wider rounded-full`}
      style={{ background: s.color + '15', color: s.color, border: `1px solid ${s.color}44` }}
    >
      {s.icon} {s.label}
    </span>
  );
}

// Bloque de skeleton: reproduce la silueta del contenido real en vez de un
// spinner genérico. Usa animate-pulse (utilidad nativa de Tailwind, sin CSS
// ni dependencias nuevas).
export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ background: COLORS.bgLighter, ...style }}
    />
  );
}

// Estado de error de página completa: mensaje legible + botón de reintentar
// + código de error visible. Reemplaza los "Cargando…" que antes se
// quedaban pegados si algo fallaba.
export function ErrorState({ title, message, code, onRetry, retryLabel = 'Reintentar', retryHref }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: COLORS.bg }}>
      <div className="max-w-lg text-center">
        <div className="flex justify-center mb-4" style={{ color: COLORS.fail }}>
          <AlertOctagon size={28} />
        </div>
        <div className="text-2xl mb-3" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white }}>
          {title}
        </div>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: COLORS.muted }}>{message}</p>
        {(onRetry || retryHref) && (
          retryHref ? (
            <a href={retryHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold transition-all hover:opacity-90"
              style={{ background: 'transparent', color: COLORS.fail, border: `1px solid ${COLORS.fail}` }}>
              <RefreshCw size={16} /> {retryLabel}
            </a>
          ) : (
            <button onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold transition-all hover:opacity-90"
              style={{ background: 'transparent', color: COLORS.fail, border: `1px solid ${COLORS.fail}` }}>
              <RefreshCw size={16} /> {retryLabel}
            </button>
          )
        )}
        {code && (
          <div className="text-[10px] tracking-[0.2em] mt-6" style={{ color: COLORS.muted, fontFamily: 'JetBrains Mono, monospace' }}>
            {code}
          </div>
        )}
      </div>
    </div>
  );
}
