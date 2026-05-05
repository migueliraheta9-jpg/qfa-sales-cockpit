'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { COLORS } from '../lib/constants';
import { QFAHeader } from './Shared';
import DiagnosticoView from './Diagnostico';
import { RutaView, StackView } from './RutaStack';

export default function ClientScreen({ lead, onClose }) {
  const [view, setView] = useState('diagnostico');
  const views = [
    { v: 'diagnostico', l: 'Diagnóstico', n: '01' },
    { v: 'ruta', l: 'Ruta', n: '02' },
    { v: 'stack', l: 'Stack', n: '03' },
  ];
  const currentIndex = views.findIndex((v) => v.v === view);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: COLORS.bg }}>
      <div className="px-12 pt-8">
        <QFAHeader />
      </div>
      {view === 'diagnostico' && <DiagnosticoView lead={lead} />}
      {view === 'ruta' && <RutaView />}
      {view === 'stack' && <StackView />}
      <div className="sticky bottom-6 flex justify-center pb-4">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: COLORS.bgLight, border: `1px solid ${COLORS.border}` }}>
          <button onClick={() => currentIndex > 0 && setView(views[currentIndex - 1].v)}
            disabled={currentIndex === 0} className="text-sm transition disabled:opacity-30" style={{ color: COLORS.muted }}>
            ←
          </button>
          <div className="flex items-center gap-2">
            {views.map((t) => (
              <button key={t.v} onClick={() => setView(t.v)} className="rounded-full transition-all"
                style={{ width: view === t.v ? '24px' : '6px', height: '6px', background: view === t.v ? COLORS.white : COLORS.border }}
                title={t.l} />
            ))}
          </div>
          <div className="text-xs tracking-[0.25em] mx-2" style={{ color: COLORS.muted, fontFamily: 'JetBrains Mono, monospace' }}>
            {views[currentIndex].n} / 03
          </div>
          <button onClick={() => currentIndex < views.length - 1 && setView(views[currentIndex + 1].v)}
            disabled={currentIndex === views.length - 1} className="text-sm transition disabled:opacity-30" style={{ color: COLORS.muted }}>
            →
          </button>
          <div className="w-px h-5 mx-1" style={{ background: COLORS.border }} />
          <button onClick={onClose} className="p-1 rounded transition" style={{ color: COLORS.muted }} title="Cerrar">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
