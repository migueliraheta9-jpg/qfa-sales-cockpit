'use client';
import { useState, useEffect } from 'react';
import {
  Lock, Unlock, Clock, ChevronDown, ArrowLeft, Save, Trash2, Target,
  TrendingUp, AlertTriangle, AlertOctagon, Zap, X, Copy, ExternalLink,
} from 'lucide-react';
import { COLORS, PUERTAS, OBJECTIONS, getLeadAccent } from '../lib/constants';
import { getCompletedPuertas, isPuertasComplete, calcularTemperaturaSugerida } from '../lib/scoring';
import { CloseDialog, DeleteDialog } from './Dialogs';

function FieldEditor({ field, value, onChange }) {
  if (field.type === 'multi') {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div>
        <div className="text-xs tracking-[0.2em] font-bold mb-2" style={{ color: COLORS.muted }}>
          {field.label.toUpperCase()}
        </div>
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => {
            const active = arr.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onChange(active ? arr.filter((x) => x !== opt) : [...arr, opt])}
                className="px-3 py-2 text-sm rounded-md transition-all"
                style={{
                  background: active ? COLORS.white : 'transparent',
                  color: active ? COLORS.bg : COLORS.white,
                  border: `1px solid ${active ? COLORS.white : COLORS.border}`,
                  fontWeight: active ? 700 : 500,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'single') {
    return (
      <div>
        <div className="text-xs tracking-[0.2em] font-bold mb-2" style={{ color: COLORS.muted }}>
          {field.label.toUpperCase()}
        </div>
        <div className="flex flex-col gap-2">
          {field.options.map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                onClick={() => onChange(active ? '' : opt)}
                className="px-4 py-3 text-sm text-left rounded-md transition-all"
                style={{
                  background: active ? COLORS.cyan + '15' : 'transparent',
                  color: COLORS.white,
                  border: `1px solid ${active ? COLORS.cyan : COLORS.border}`,
                  fontWeight: active ? 700 : 500,
                }}
              >
                <span className="inline-block w-5 mr-2" style={{ color: active ? COLORS.cyan : COLORS.muted }}>
                  {active ? '●' : '○'}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'text' || field.type === 'number') {
    return (
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-xs tracking-[0.2em] font-bold" style={{ color: field.critical ? COLORS.orange : COLORS.muted }}>
            {field.label.toUpperCase()}
            {field.critical && <span className="ml-2">★</span>}
          </div>
          {field.usedIn && (
            <div className="text-[10px] italic" style={{ color: COLORS.orange }}>↪ {field.usedIn}</div>
          )}
        </div>
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-4 py-3 rounded-md outline-none transition-all"
          style={{
            background: COLORS.bg,
            color: COLORS.white,
            border: `1px solid ${field.critical ? COLORS.orange + '55' : COLORS.border}`,
            fontFamily: field.type === 'number' ? 'JetBrains Mono, monospace' : 'inherit',
            fontSize: '15px',
          }}
        />
      </div>
    );
  }
  return null;
}

function PuertaCard({ puerta, lead, onUpdate, isOpen, onToggle, isComplete }) {
  return (
    <div
      className="rounded-lg border overflow-hidden transition-all"
      style={{ background: COLORS.bgLight, borderColor: isComplete ? COLORS.green + '55' : COLORS.border }}
    >
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-left">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center font-bold"
            style={{
              background: 'transparent',
              border: `1px solid ${isComplete ? COLORS.green : COLORS.border}`,
              color: isComplete ? COLORS.green : COLORS.cyan,
              fontFamily: 'Instrument Serif, serif',
              fontSize: '20px',
            }}
          >
            {isComplete ? '✓' : String(puerta.num).padStart(2, '0')}
          </div>
          <div>
            <div className="font-bold" style={{ color: COLORS.white }}>
              Puerta {puerta.num} — {puerta.title}
            </div>
            <div className="text-xs mt-0.5" style={{ color: COLORS.muted, fontFamily: 'JetBrains Mono, monospace' }}>
              {puerta.timeRange}
            </div>
          </div>
        </div>
        <ChevronDown size={20} style={{ color: COLORS.muted, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 space-y-5 border-t" style={{ borderColor: COLORS.border }}>
          <div className="p-4 rounded-md" style={{ background: COLORS.bg, border: `1px solid ${COLORS.cyan}33` }}>
            <div className="text-[10px] tracking-[0.25em] font-bold mb-2" style={{ color: COLORS.cyan }}>
              PREGUNTA TEXTUAL
            </div>
            <div className="italic leading-relaxed" style={{ color: COLORS.white, fontFamily: 'Instrument Serif, serif', fontSize: '18px' }}>
              {puerta.pregunta}
            </div>
            {puerta.seguimiento && (
              <div className="text-sm mt-3 pt-3 border-t" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
                <span className="font-bold" style={{ color: COLORS.orange }}>Seguimiento: </span>
                <span className="italic">{puerta.seguimiento}</span>
              </div>
            )}
            <div className="text-xs mt-3 pt-3 border-t" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
              <span className="font-bold">Lo que buscas:</span> {puerta.busca}
            </div>
          </div>
          {puerta.fields.map((field) => (
            <FieldEditor key={field.key} field={field} value={lead[field.key]} onChange={(v) => onUpdate(field.key, v)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ObjectionToolbar({ onOpen }) {
  return (
    <div className="rounded-lg border p-3 mb-4" style={{ background: COLORS.bgLight, borderColor: COLORS.border }}>
      <div className="flex items-center gap-3 mb-2">
        <AlertOctagon size={16} style={{ color: COLORS.orange }} />
        <span className="text-xs font-bold tracking-[0.2em]" style={{ color: COLORS.white }}>
          MANEJO DE OBJECIONES
        </span>
        <span className="text-[10px] italic" style={{ color: COLORS.muted }}>
          Click → script con cifras del cliente inyectadas
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {OBJECTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => onOpen(o.id)}
            className="px-3 py-2 text-xs font-bold rounded-md transition-all hover:scale-[1.02] flex items-center gap-1.5"
            style={{ background: COLORS.bg, color: COLORS.white, border: `1px solid ${COLORS.orange}33` }}
          >
            <span>{o.icon}</span>
            <span>{o.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ObjectionModal({ objectionId, lead, onClose }) {
  const [copied, setCopied] = useState(false);
  const o = OBJECTIONS.find((x) => x.id === objectionId);
  const text = o ? o.script(lead) : '';

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!o) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="rounded-lg border max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        style={{ background: COLORS.bgLight, borderColor: COLORS.orange + '55' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-8 py-5 flex items-center justify-between border-b" style={{ background: COLORS.bg, borderColor: COLORS.border }}>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{o.icon}</div>
            <div>
              <div className="text-[10px] tracking-[0.3em] font-bold" style={{ color: COLORS.orange }}>OBJECIÓN</div>
              <h2 className="text-3xl font-normal" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white, letterSpacing: '-0.01em' }}>
                {o.title}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md transition" style={{ background: COLORS.bgLighter, color: COLORS.muted }} title="Cerrar (Esc)">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 py-6 overflow-y-auto flex-1">
          <pre className="whitespace-pre-wrap leading-relaxed" style={{ color: COLORS.white, fontFamily: 'Manrope, sans-serif', fontSize: '16px', lineHeight: '1.7' }}>
            {text}
          </pre>
        </div>
        <div className="px-8 py-4 flex items-center justify-between border-t" style={{ background: COLORS.bg, borderColor: COLORS.border }}>
          <div className="text-xs italic" style={{ color: COLORS.muted }}>Esc para cerrar · datos del cliente inyectados automáticamente</div>
          <button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 rounded-md font-bold transition-all"
            style={{ background: copied ? COLORS.green : COLORS.white, color: COLORS.bg }}>
            <Copy size={16} /> {copied ? '¡Script copiado!' : 'Copiar script'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CallTimer({ lead }) {
  const startTime = lead.callDate;
  const accumulated = lead.accumulatedSeconds || 0;
  const isPaused = !!lead.pausedAt && !lead.endedAt;
  const isEnded = !!lead.endedAt;
  const isActive = !isPaused && !isEnded;
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  let elapsed = accumulated;
  if (isActive && startTime) {
    const sessionStart = lead.resumedAt || startTime;
    elapsed = accumulated + Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000);
  }

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  let phase;
  if (isEnded) phase = { label: 'Finalizada', color: COLORS.muted };
  else if (isPaused) phase = { label: '❚❚ Pausada', color: COLORS.lavanda };
  else phase = m < 3 ? { label: 'Rapport', color: COLORS.cyan } :
    m < 20 ? { label: 'Diagnóstico', color: COLORS.cyan } :
    m < 30 ? { label: 'Presentación', color: COLORS.orange } :
    m < 32 ? { label: 'Temperatura', color: COLORS.orange } :
    m < 38 ? { label: 'Cierre', color: COLORS.green } :
    m < 42 ? { label: 'Cierre definitivo', color: COLORS.green } :
    { label: '⚠ Sobre tiempo (>45 min)', color: COLORS.orange };

  return (
    <div className="flex items-center gap-3">
      <Clock size={16} style={{ color: phase.color }} />
      <div style={{ fontFamily: 'JetBrains Mono, monospace', color: phase.color, fontWeight: 700, fontSize: '18px' }}>
        {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
      </div>
      <div className="text-xs tracking-[0.2em] font-bold" style={{ color: phase.color }}>
        {phase.label.toUpperCase()}
      </div>
    </div>
  );
}

export default function Cockpit({ lead, onUpdate, onClose, onShareScreen, onDelete, onFinalize }) {
  const [openPuerta, setOpenPuerta] = useState('p1');
  const [openObjection, setOpenObjection] = useState(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);

  const completedCount = getCompletedPuertas(lead);
  const allComplete = isPuertasComplete(lead);
  const canPresent = completedCount >= 4;
  const tempSugerida = allComplete ? calcularTemperaturaSugerida(lead) : null;
  const accent = getLeadAccent(lead);

  useEffect(() => {
    if (allComplete && !lead.temperatura && tempSugerida) {
      onUpdate('temperatura', tempSugerida);
    }
  }, [allComplete, tempSugerida]);

  const reportUrl = lead.publicId && typeof window !== 'undefined'
    ? `${window.location.origin}/r/${lead.publicId}` : '';

  const copyReportLink = () => {
    if (!reportUrl) return;
    navigator.clipboard.writeText(reportUrl).then(() => {
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2500);
    });
  };

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg }}>
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="sticky top-0 z-20 -mx-6 px-6 py-4 mb-4 backdrop-blur"
          style={{ background: COLORS.bg + 'EE', borderBottom: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center justify-between gap-4">
            <button onClick={onClose} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: COLORS.muted }}>
              <ArrowLeft size={18} /> Dashboard
            </button>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {accent.mercado && (
                  <div className="px-2 py-1 rounded text-[10px] tracking-[0.2em] font-bold"
                    style={{ background: accent.color + '15', color: accent.color, border: `1px solid ${accent.color}44` }}
                    title={`Mercado · ${accent.name}`}>
                    {accent.name.toUpperCase()} · {accent.mercado.toUpperCase()}
                  </div>
                )}
                <input type="text" value={lead.name || ''} onChange={(e) => onUpdate('name', e.target.value)}
                  placeholder="Nombre del prospecto"
                  className="px-3 py-2 rounded-md outline-none font-bold text-lg"
                  style={{ background: COLORS.bgLight, color: COLORS.white, border: `1px solid ${COLORS.border}`, minWidth: '240px' }} />
              </div>
              <CallTimer lead={lead} />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold" style={{ color: completedCount === 7 ? COLORS.green : COLORS.cyan }}>
                {completedCount}/7
              </div>
              <button disabled={!canPresent} onClick={onShareScreen}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md font-bold transition-all"
                style={{ background: canPresent ? COLORS.orange : COLORS.bgLighter, color: canPresent ? COLORS.bg : COLORS.muted, cursor: canPresent ? 'pointer' : 'not-allowed' }}
                title={canPresent ? 'Abrir pantalla del cliente' : 'Bloqueado: completa hasta Puerta 4'}>
                {canPresent ? <Unlock size={16} /> : <Lock size={16} />} Pantalla cliente
              </button>
              <button onClick={() => setShowCloseDialog(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-md font-bold transition-all"
                style={{ background: COLORS.green, color: COLORS.bg }}>
                <Save size={16} /> Cerrar
              </button>
              <button onClick={() => setShowDeleteDialog(true)} className="p-2.5 rounded-md transition-all"
                style={{ background: 'transparent', color: COLORS.muted, border: `1px solid ${COLORS.border}` }} title="Borrar esta sesión">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-1">
            {PUERTAS.map((p) => {
              const c = p.fields.every((f) => {
                const v = lead[f.key];
                if (f.type === 'multi') return Array.isArray(v) && v.length > 0;
                return v !== undefined && v !== null && v !== '';
              });
              return (
                <div key={p.id} onClick={() => setOpenPuerta(p.id)} className="flex-1 h-1.5 rounded-full cursor-pointer"
                  style={{ background: c ? COLORS.green : COLORS.bgLighter }} />
              );
            })}
          </div>
        </div>

        {/* Bloque del reporte público */}
        {allComplete && reportUrl && (
          <div className="mb-4 rounded-lg border p-4 flex items-center justify-between"
            style={{ background: COLORS.bgLight, borderColor: COLORS.green + '55' }}>
            <div>
              <div className="text-[10px] tracking-[0.3em] font-bold mb-1" style={{ color: COLORS.green }}>
                REPORTE PÚBLICO PARA EL CLIENTE
              </div>
              <div className="text-sm" style={{ color: COLORS.white }}>
                Link único de su diagnóstico:{' '}
                <code style={{ color: COLORS.cyan, fontFamily: 'JetBrains Mono, monospace' }}>{reportUrl}</code>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyReportLink} className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm"
                style={{ background: reportCopied ? COLORS.green : COLORS.white, color: COLORS.bg }}>
                <Copy size={14} /> {reportCopied ? '¡Copiado!' : 'Copiar link'}
              </button>
              <a href={reportUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm"
                style={{ background: 'transparent', color: COLORS.white, border: `1px solid ${COLORS.border}` }}>
                <ExternalLink size={14} /> Abrir
              </a>
            </div>
          </div>
        )}

        <ObjectionToolbar onOpen={setOpenObjection} />

        <div className="rounded-md px-4 py-3 mb-4 flex items-center gap-4 flex-wrap text-xs"
          style={{ background: COLORS.bg, border: `1px solid ${COLORS.orange}22` }}>
          <div className="flex items-center gap-2" style={{ color: COLORS.orange }}>
            <AlertTriangle size={14} />
            <span className="font-bold tracking-[0.2em]">RECORDATORIOS:</span>
          </div>
          <span style={{ color: COLORS.muted }}>Hablas máx 30%</span>
          <span style={{ color: COLORS.mutedDim }}>·</span>
          <span style={{ color: COLORS.muted }}>No oferta antes de Puerta 4</span>
          <span style={{ color: COLORS.mutedDim }}>·</span>
          <span style={{ color: COLORS.muted }}>Tras el precio: silencio</span>
          <span style={{ color: COLORS.mutedDim }}>·</span>
          <span style={{ color: COLORS.muted }}>Cifras: solo las que ÉL dijo</span>
          <span style={{ color: COLORS.mutedDim }}>·</span>
          <span style={{ color: COLORS.muted }}>Cierre assumptive: "¿pago único o plan?"</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} style={{ color: COLORS.cyan }} />
            <h2 className="font-bold tracking-[0.2em]" style={{ color: COLORS.white }}>LAS 7 PUERTAS</h2>
            <span className="text-xs italic" style={{ color: COLORS.muted }}>· No saltes puertas. No apures.</span>
          </div>
          {PUERTAS.map((p) => {
            const isComplete = p.fields.every((f) => {
              const v = lead[f.key];
              if (f.type === 'multi') return Array.isArray(v) && v.length > 0;
              return v !== undefined && v !== null && v !== '';
            });
            return (
              <PuertaCard key={p.id} puerta={p} lead={lead} onUpdate={onUpdate}
                isOpen={openPuerta === p.id}
                onToggle={() => setOpenPuerta(openPuerta === p.id ? null : p.id)}
                isComplete={isComplete} />
            );
          })}
        </div>

        <div className="rounded-lg border p-6 mt-6"
          style={{ background: COLORS.bgLight, borderColor: allComplete ? COLORS.orange + '55' : COLORS.border }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} style={{ color: COLORS.orange }} />
              <h3 className="font-bold tracking-[0.2em]" style={{ color: COLORS.white }}>TEMPERATURA & RESULTADO</h3>
            </div>
            {tempSugerida && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{ background: COLORS.cyan + '15', border: `1px solid ${COLORS.cyan}44` }}>
                <Zap size={14} style={{ color: COLORS.cyan }} />
                <span className="text-xs font-bold tracking-[0.2em]" style={{ color: COLORS.cyan }}>
                  SUGERIDA: {tempSugerida}/10
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="text-xs tracking-[0.2em] font-bold mb-2" style={{ color: COLORS.muted }}>
              {allComplete ? 'TEMPERATURA — auto-calculada (override si el cliente da otro número)' : 'CHEQUEO DE TEMPERATURA (1-10)'}
            </div>
            <div className="flex gap-1.5 mb-3">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const active = parseInt(lead.temperatura) === n;
                const isSuggested = tempSugerida === n;
                const color = n >= 9 ? COLORS.green : n >= 7 ? COLORS.lavanda : COLORS.orange;
                return (
                  <button key={n} onClick={() => onUpdate('temperatura', n)}
                    className="flex-1 py-3 rounded-md font-bold transition-all"
                    style={{
                      background: active ? color : 'transparent',
                      color: active ? COLORS.bg : COLORS.white,
                      border: `${isSuggested && !active ? '2px' : '1px'} solid ${active ? color : (isSuggested && !active ? COLORS.cyan : COLORS.border)}`,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-5">
            <div className="text-xs tracking-[0.2em] font-bold mb-2" style={{ color: COLORS.muted }}>
              RESULTADO DE LA SESIÓN
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 'closed-won', l: 'Cerró', color: COLORS.green },
                { v: 'follow-up', l: 'Seguimiento', color: COLORS.lavanda },
                { v: 'closed-lost', l: 'No cerró', color: COLORS.muted },
              ].map((o) => (
                <button key={o.v} onClick={() => onUpdate('outcome', o.v)}
                  className="px-4 py-3 rounded-md font-bold transition-all"
                  style={{
                    background: lead.outcome === o.v ? o.color : 'transparent',
                    color: lead.outcome === o.v ? COLORS.bg : COLORS.white,
                    border: `1px solid ${lead.outcome === o.v ? o.color : COLORS.border}`,
                  }}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {openObjection && <ObjectionModal objectionId={openObjection} lead={lead} onClose={() => setOpenObjection(null)} />}
        {showCloseDialog && (
          <CloseDialog
            lead={lead}
            onConfirm={() => {
              if (lead.outcome === 'follow-up' && !lead.bonoExpiresAt) {
                onUpdate('bonoExpiresAt', new Date(Date.now() + 48 * 3600000).toISOString());
              }
              onFinalize(lead.id);
              setShowCloseDialog(false);
              onClose();
            }}
            onCancel={() => setShowCloseDialog(false)}
          />
        )}
        {showDeleteDialog && (
          <DeleteDialog lead={lead} onConfirm={() => onDelete(lead.id)} onCancel={() => setShowDeleteDialog(false)} />
        )}
      </div>
    </div>
  );
}
