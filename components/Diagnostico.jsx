'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import {
  ArrowRight, Crosshair, Brain, Shield, BarChart3, GraduationCap, DollarSign,
  Sparkles, Target,
} from 'lucide-react';
import { COLORS, getLeadAccent } from '../lib/constants';
import {
  getRadarData, getCuelloBotella, isPuertasComplete, getAxisDescription,
} from '../lib/scoring';

function getCorreccionesItems(lead) {
  const items = [];
  if (lead.estadoEstrategia === 'Sin estrategia / opera por impulso' || lead.estadoEstrategia === 'Probando varias / inconsistente') {
    items.push({ icon: <Crosshair size={20} />, title: 'Te damos UN sistema', desc: 'Pilar 2 — Dominio Estratégico Técnico. ICT, FVGs, liquidez, killzones. Un método. Lo dominas.' });
  }
  if (lead.estadoEstrategia === 'Tiene estrategia pero la rompe en vivo') {
    items.push({ icon: <Brain size={20} />, title: 'Cierras el gap entre saber y ejecutar', desc: 'Pilar 1 — Reprogramación Mental. La 1:1 inicial encuentra qué te hace romper tu propio plan.' });
  }
  if (lead.confianzaApertura === 'Inseguro / opera con miedo' || lead.confianzaApertura === 'Sabe que está apostando' || lead.confianzaApertura === 'Mitad y mitad') {
    items.push({ icon: <Shield size={20} />, title: 'Construyes confianza desde el criterio', desc: 'La confianza llega cuando entiendes por qué entras. No antes.' });
  }
  const cifra = parseFloat(lead.cifraInvertida) || 0;
  if (cifra >= 1000) {
    items.push({ icon: <DollarSign size={20} />, title: 'Dejas de coleccionar cursos', desc: `Has invertido $${cifra.toLocaleString()} sin proceso. Aquí inviertes UNA vez en proceso.` });
  }
  if (lead.tipoCuenta === 'Prop firm / funded') {
    items.push({ icon: <Shield size={20} />, title: 'Operas la funded sin reventarla', desc: 'Pilar 3 — Gestión de riesgo aplicada al drawdown de prop firms.' });
  }
  if (lead.tipoMeta === 'Cuenta funded aprobada') {
    items.push({ icon: <Target size={20} />, title: 'Construyes el criterio para aprobar fondeo', desc: 'No memorizas reglas — desarrollas el juicio para operar bajo límite.' });
  }
  if (lead.reaccionCompromiso === '🟢 "Eso es lo que necesito"') {
    items.push({ icon: <GraduationCap size={20} />, title: 'Tienes el ingrediente clave: disposición', desc: 'El sistema funciona si se ejecuta. Tú ya estás en la mentalidad correcta.' });
  }
  if (items.length === 0) {
    items.push({ icon: <Sparkles size={20} />, title: 'Diagnóstico en construcción', desc: 'Completa las puertas para ver qué corregimos contigo específicamente.' });
  }
  return items.slice(0, 4);
}

function AxisCard({ axis, score, projected, lead }) {
  const pctActual = (score / 10) * 100;
  const pctProjected = (projected / 10) * 100;
  const color = score <= 3 ? COLORS.orange : score <= 6 ? COLORS.lavanda : COLORS.green;

  return (
    <div className="rounded-lg p-6" style={{ background: COLORS.bgLight, border: `1px solid ${COLORS.border}` }}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-[10px] tracking-[0.3em] mb-1" style={{ color: COLORS.muted }}>DIMENSIÓN</div>
          <h3 className="text-2xl" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white }}>{axis}</h3>
        </div>
        <div className="text-right" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <div className="text-5xl font-normal leading-none" style={{ color }}>{score}</div>
          <div className="text-xs mt-1" style={{ color: COLORS.muted }}>/ 10</div>
        </div>
      </div>
      <div className="relative mb-4">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.bg }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pctActual}%`, background: color }} />
        </div>
        <div className="absolute top-0 -translate-x-1/2" style={{ left: `${pctProjected}%`, height: '8px' }}>
          <div className="w-0.5 h-3" style={{ background: COLORS.green, marginTop: '-2px' }} />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] tracking-[0.2em]" style={{ color: COLORS.muted, fontFamily: 'JetBrains Mono, monospace' }}>
          <span>HOY · {score}</span>
          <span style={{ color: COLORS.green }}>META · {projected}</span>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: COLORS.white }}>
        {getAxisDescription(axis, lead)}
      </p>
    </div>
  );
}

export default function DiagnosticoView({ lead, isPublic = false }) {
  const data = getRadarData(lead);
  const cuello = getCuelloBotella(lead);
  const allComplete = isPuertasComplete(lead);
  const correcciones = getCorreccionesItems(lead);
  const cifra = parseFloat(lead.cifraInvertida) || 0;
  const promedioActual = data.reduce((s, d) => s + d.actual, 0) / data.length;
  const gap = (9 - promedioActual).toFixed(1);
  const accent = getLeadAccent(lead);

  return (
    <div className="px-12 pb-32 pt-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-px" style={{ background: COLORS.muted }} />
          <div className="text-[10px] tracking-[0.4em]" style={{ color: COLORS.muted }}>
            DIAGNÓSTICO PERSONAL · 01
          </div>
        </div>
        <h1 className="font-normal mb-3"
          style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white, fontSize: 'clamp(48px, 6vw, 80px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          Tu radiografía como trader,
          <br />
          <em style={{ color: accent.color }}>{lead.name || 'trader'}.</em>
        </h1>
        <p className="text-lg italic mt-4" style={{ color: COLORS.muted, fontFamily: 'Instrument Serif, serif' }}>
          Dónde estás hoy &mdash; dónde puedes estar a 12 meses
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-7 rounded-lg p-6" style={{ background: COLORS.bgLight, border: `1px solid ${COLORS.border}` }}>
            <div style={{ height: 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="78%">
                  <PolarGrid stroke={COLORS.border} />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: COLORS.white, fontSize: 13, fontWeight: 600 }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar name="Hoy" dataKey="actual" stroke={accent.color} fill={accent.color} fillOpacity={0.35} strokeWidth={2} />
                  <Radar name="Con QF a 12 meses" dataKey="proyectado" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.05} strokeWidth={2} strokeDasharray="6 6" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-8 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: accent.color }} />
                <span className="text-sm" style={{ color: COLORS.white }}>Tu situación hoy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: COLORS.green, background: 'transparent' }} />
                <span className="text-sm" style={{ color: COLORS.white }}>Tu potencial con QF</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5 space-y-4">
            <div className="rounded-lg p-7" style={{ background: COLORS.bgLight, border: `1px solid ${COLORS.border}` }}>
              <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: COLORS.muted }}>PROMEDIO GENERAL · HOY</div>
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-7xl font-normal leading-none"
                  style={{ fontFamily: 'Instrument Serif, serif', color: promedioActual <= 3 ? COLORS.orange : promedioActual <= 6 ? COLORS.lavanda : COLORS.green }}>
                  {promedioActual.toFixed(1)}
                </span>
                <span className="text-2xl" style={{ color: COLORS.muted, fontFamily: 'Instrument Serif, serif' }}>/ 10</span>
              </div>
              <div className="flex items-center gap-2 text-sm pt-4 border-t" style={{ color: COLORS.white, borderColor: COLORS.border }}>
                <ArrowRight size={16} style={{ color: COLORS.green }} />
                <span>Brecha de mejora: <strong style={{ color: COLORS.green, fontFamily: 'JetBrains Mono, monospace' }}>+{gap}</strong> puntos</span>
              </div>
            </div>

            {allComplete && (
              <div className="rounded-lg p-7" style={{ background: COLORS.bgLight, border: `1px solid ${COLORS.orange}55` }}>
                <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: COLORS.orange }}>TU CUELLO DE BOTELLA</div>
                <div className="text-4xl mb-3" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white, fontStyle: 'italic' }}>
                  {cuello}.
                </div>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.white }}>
                  Es el área que más te frena hoy. Mejorarla cambia toda tu curva. <em style={{ color: COLORS.orange }}>Aquí enfocamos primero.</em>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px" style={{ background: COLORS.muted }} />
            <div className="text-[10px] tracking-[0.3em]" style={{ color: COLORS.muted }}>DESGLOSE POR DIMENSIÓN</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {data.map((d) => (
            <AxisCard key={d.axis} axis={d.axis} score={d.actual} projected={d.proyectado} lead={lead} />
          ))}
        </div>

        {allComplete && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px" style={{ background: COLORS.muted }} />
              <div className="text-[10px] tracking-[0.3em]" style={{ color: COLORS.muted }}>LO QUE VAMOS A CORREGIR CONTIGO</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {correcciones.map((item, i) => (
                <div key={i} className="rounded-lg p-5 flex gap-4" style={{ background: COLORS.bgLight, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center"
                    style={{ background: accent.color + '15', color: accent.color, border: `1px solid ${accent.color}33` }}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold mb-1.5" style={{ color: COLORS.white, fontSize: '15px' }}>{item.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: COLORS.muted }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cifra > 0 && (
          <div className="rounded-lg p-10" style={{ background: COLORS.bgLight, border: `1px solid ${COLORS.orange}44` }}>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-px" style={{ background: COLORS.orange }} />
                <div className="text-[10px] tracking-[0.4em]" style={{ color: COLORS.orange }}>
                  LO QUE YA HAS INVERTIDO · LO QUE TE PROPONEMOS
                </div>
                <div className="w-8 h-px" style={{ background: COLORS.orange }} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: COLORS.muted }}>HASTA HOY</div>
                <div className="text-6xl font-normal" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.muted }}>
                  ${cifra.toLocaleString()}
                </div>
                <div className="text-xs mt-3 italic" style={{ color: COLORS.muted, fontFamily: 'Instrument Serif, serif' }}>
                  en cursos / pérdidas / formación
                </div>
                <div className="text-[10px] tracking-[0.2em] mt-2" style={{ color: COLORS.orange }}>SIN PROCESO · SIN CORRECCIÓN</div>
              </div>
              <div className="text-center">
                <div className="text-4xl" style={{ color: COLORS.orange, fontFamily: 'Instrument Serif, serif' }}>→</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: COLORS.cyan }}>DESDE HOY</div>
                <div className="text-6xl font-normal" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white }}>
                  $2,000
                </div>
                <div className="text-xs mt-3 italic" style={{ color: COLORS.white, fontFamily: 'Instrument Serif, serif' }}>
                  o $1,000 + $1,000 a 60 días
                </div>
                <div className="text-[10px] tracking-[0.2em] mt-2" style={{ color: COLORS.green }}>12 MESES · CORRECCIÓN DIRECTA</div>
              </div>
            </div>
            <div className="text-center mt-8 pt-6 border-t" style={{ borderColor: COLORS.border }}>
              <p className="italic text-xl" style={{ color: COLORS.white, fontFamily: 'Instrument Serif, serif', letterSpacing: '-0.01em' }}>
                "La pregunta no es si $2,000 es mucho — es si vale más que seguir donde estás."
              </p>
            </div>
          </div>
        )}

        {/* CTA al final si es vista pública del cliente */}
        {isPublic && allComplete && (() => {
          const waNumber = '50370137129';
          const clientName = lead.name || 'Cliente QF';
          const waMessage = `Hola Miguel 👋

Vengo de revisar mi diagnóstico de QF Accelerator.
Quiero confirmar mi cupo y agendar el siguiente paso.

— ${clientName}`;
          const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
          return (
            <div className="mt-12 text-center">
              <p className="text-2xl italic mb-6" style={{ color: COLORS.white, fontFamily: 'Instrument Serif, serif' }}>
                ¿Listo para empezar a corregir?
              </p>
              <a href={waUrl}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-md font-bold text-lg transition-all hover:opacity-90"
                style={{ background: COLORS.green, color: COLORS.bg }}>
                Confirmar mi cupo por WhatsApp →
              </a>
              <p className="text-xs mt-4 italic" style={{ color: COLORS.muted }}>
                Solo 5 cupos por mes · Auditoría inicial gratis si confirmas en 48h
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
