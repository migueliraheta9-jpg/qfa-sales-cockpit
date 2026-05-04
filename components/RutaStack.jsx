'use client';
import { Brain, Users, MessageSquare, FileText, Timer } from 'lucide-react';
import { COLORS } from '../lib/constants';

export function RutaView() {
  const fases = [
    { n: 1, title: 'Adaptación', meses: 'Mes 1',
      desc: 'Fundamentos del sistema. Estructura de mercado, liquidez, FVGs, gestión de riesgo. Primera bitácora.',
      hito: 'Análisis publicado en el foro = ganas tu primera 1:1', color: COLORS.cyan },
    { n: 2, title: 'Corrección activa', meses: 'Meses 2 — 4',
      desc: '1:1 conmigo cada 15 días. Revisión de bitácora, identificación de patrón de error, ejercicios concretos. 2 clases grupales por semana.',
      hito: 'Lunes pre-mercado en vivo · Jueves revisión de tus trades reales', color: COLORS.lavanda },
    { n: 3, title: 'Autonomía', meses: 'Meses 5 — 12',
      desc: 'Operas autónomo con seguimiento mensual. Contenido avanzado se desbloquea. Sesión de graduación al mes 12.',
      hito: 'Curva de equity del año completo presentada', color: COLORS.green },
  ];

  return (
    <div className="px-12 pb-32 pt-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px" style={{ background: COLORS.muted }} />
          <div className="text-[10px] tracking-[0.4em]" style={{ color: COLORS.muted }}>EL PROCESO · 02</div>
        </div>
        <h1 className="font-normal mb-2"
          style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white, fontSize: 'clamp(48px, 6vw, 80px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          La <em style={{ color: COLORS.cyan }}>ruta</em>, mes a mes.
        </h1>
        <p className="text-lg italic mb-12" style={{ color: COLORS.muted, fontFamily: 'Instrument Serif, serif' }}>
          12 meses · 3 fases · 1 sistema
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fases.map((f) => (
            <div key={f.n} className="rounded-lg p-7 flex flex-col" style={{ background: COLORS.bgLight, border: `1px solid ${f.color}33` }}>
              <div className="text-7xl font-normal mb-5 leading-none" style={{ fontFamily: 'Instrument Serif, serif', color: f.color }}>
                0{f.n}
              </div>
              <div className="text-[10px] tracking-[0.3em] font-bold mb-2" style={{ color: f.color }}>
                {f.meses.toUpperCase()}
              </div>
              <h3 className="text-3xl mb-4" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white, letterSpacing: '-0.01em' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: COLORS.white }}>{f.desc}</p>
              <div className="mt-auto pt-4 text-xs italic border-t"
                style={{ borderColor: COLORS.border, color: f.color, fontFamily: 'Instrument Serif, serif', fontSize: '14px' }}>
                ↳ {f.hito}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center text-lg italic" style={{ color: COLORS.muted, fontFamily: 'Instrument Serif, serif' }}>
          Aquí no avanzas por pagar. <em style={{ color: COLORS.white }}>Avanzas por ejecutar.</em>
        </div>
      </div>
    </div>
  );
}

export function StackView() {
  const items = [
    { n: 'I', title: 'Corrección directa con Miguel', desc: '14 sesiones 1:1 sobre TU bitácora, TUS trades, TU patrón de error. No teoría.', icon: <Brain size={28} /> },
    { n: 'II', title: 'Formación grupal continua', desc: '96 clases en 12 meses. Lunes pre-mercado · Jueves revisión de trades reales.', icon: <Users size={28} /> },
    { n: 'III', title: 'Comunidad operativa', desc: 'Foro de corrección donde publicas análisis y recibes feedback. No es Telegram.', icon: <MessageSquare size={28} /> },
    { n: 'IV', title: 'Plataforma completa', desc: 'Todos los módulos del sistema, contenido avanzado por fases, biblioteca de trades corregidos.', icon: <FileText size={28} /> },
    { n: 'V', title: 'El tiempo', desc: '12 meses. Un trader no se transforma en 8 semanas. Necesita ejecución, error y consolidación.', icon: <Timer size={28} /> },
  ];

  return (
    <div className="px-12 pb-32 pt-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px" style={{ background: COLORS.muted }} />
          <div className="text-[10px] tracking-[0.4em]" style={{ color: COLORS.muted }}>LA INVERSIÓN · 03</div>
        </div>
        <h1 className="font-normal mb-2"
          style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white, fontSize: 'clamp(48px, 6vw, 80px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          Quantum Flow no es un curso.
        </h1>
        <p className="text-2xl italic mb-12" style={{ color: COLORS.cyan, fontFamily: 'Instrument Serif, serif' }}>
          Es un proceso de formación de 12 meses.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg p-5 flex flex-col" style={{ background: COLORS.bgLight, border: `1px solid ${COLORS.border}` }}>
              <div className="flex items-center justify-between mb-4">
                <div style={{ color: COLORS.cyan }}>{item.icon}</div>
                <div className="text-4xl" style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: COLORS.orange }}>
                  {item.n}
                </div>
              </div>
              <h3 className="font-bold mb-2 leading-tight" style={{ color: COLORS.white, fontSize: '15px' }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: COLORS.muted }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-12 text-center" style={{ background: COLORS.bgLight, border: `1px solid ${COLORS.border}` }}>
          <div className="text-[10px] tracking-[0.3em] mb-6" style={{ color: COLORS.muted }}>QF ACCELERATOR · 12 MESES · 5 CUPOS</div>
          <div className="flex items-baseline justify-center gap-3 mb-3">
            <div className="text-2xl" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.muted, letterSpacing: '0.05em' }}>USD</div>
            <div className="font-normal leading-none"
              style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white, fontSize: '120px', letterSpacing: '-0.04em' }}>
              2,000
            </div>
          </div>
          <div className="text-sm mb-8" style={{ color: COLORS.muted }}>Pago único — acceso completo al programa</div>
          <div className="pt-8 border-t inline-block px-12" style={{ borderColor: COLORS.border }}>
            <div className="text-[10px] tracking-[0.3em] mb-2" style={{ color: COLORS.muted }}>O SI PREFIERES DIVIDIRLO</div>
            <div className="text-2xl" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white }}>
              <strong>$1,000 hoy</strong> <em style={{ color: COLORS.muted }}>+ $1,000 a 60 días</em>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center max-w-3xl mx-auto">
          <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: COLORS.green }}>COMPROMISO</div>
          <p className="text-xl italic leading-relaxed"
            style={{ color: COLORS.white, fontFamily: 'Instrument Serif, serif', letterSpacing: '-0.01em' }}>
            "Si en 90 días aplicando el sistema no muestras mejora medible, te doy 60 días adicionales sin costo. Es mi compromiso con tu proceso."
          </p>
        </div>
      </div>
    </div>
  );
}
