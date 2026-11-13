'use client';
import { useState } from 'react';
import { COLORS } from '../lib/constants';
import { getCompletedPuertas, isPuertasComplete, getCuelloBotella } from '../lib/scoring';
import { PAIS_POR_DEFECTO, validarTelefono } from '../lib/paises';
import { PREGUNTAS, respuestasParaGuardar } from '../lib/precalificacion';
import { CampoTelefono, CamposPrecalificacion } from './ContactoWeb';

// Alta manual de un lead: nombre, teléfono y (si hay) preguntas de precalificación.
// El teléfono y las respuestas se guardan en lead_contacto, nunca en `leads`.
// onCreate({ nombre, whatsapp, respuestas, abrir }) debe devolver una promesa;
// si falla, el diálogo muestra el mensaje y sigue abierto.
export function NewLeadDialog({ onCreate, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [pais, setPais] = useState(PAIS_POR_DEFECTO);
  const [numero, setNumero] = useState('');
  const [valores, setValores] = useState({});
  const [errorTelefono, setErrorTelefono] = useState(null);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const crear = async (abrir) => {
    if (enviando) return;
    const telefono = validarTelefono(pais, numero);
    setErrorTelefono(telefono.error);
    if (telefono.error) return;
    setEnviando(true);
    setError(null);
    try {
      await onCreate({
        nombre: nombre.trim(),
        whatsapp: telefono.whatsapp,
        respuestas: respuestasParaGuardar(PREGUNTAS, valores),
        abrir,
      });
    } catch (err) {
      setError(err?.message || 'No se pudo crear el lead.');
      setEnviando(false);
    }
  };

  const campo = { background: COLORS.bg, color: COLORS.white, border: `1px solid ${COLORS.border}` };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.7)' }}
      role="dialog" aria-modal="true" aria-labelledby="nuevo-lead-titulo">
      <form onSubmit={(e) => { e.preventDefault(); crear(true); }} noValidate
        className="rounded-lg border p-6 max-w-md w-full space-y-4" style={{ background: COLORS.bgLight, borderColor: COLORS.border }}>
        <div>
          <h3 id="nuevo-lead-titulo" className="text-2xl mb-1" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white }}>
            Nuevo lead
          </h3>
          <p className="text-sm" style={{ color: COLORS.muted }}>Todos los campos son opcionales. El teléfono solo lo ve el equipo.</p>
        </div>
        <div>
          <label htmlFor="nuevo-lead-nombre" className="text-[10px] tracking-[0.3em] font-bold mb-2 block" style={{ color: COLORS.muted }}>
            NOMBRE
          </label>
          <input id="nuevo-lead-nombre" type="text" autoFocus maxLength={120} autoComplete="off" value={nombre}
            onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del prospecto"
            className="px-3 py-2 rounded-md outline-none text-sm w-full" style={campo} />
        </div>
        <CampoTelefono pais={pais} numero={numero} onPais={setPais} onNumero={setNumero} error={errorTelefono} idBase="nuevo-lead" />
        <CamposPrecalificacion valores={valores} onChange={setValores} idBase="nuevo-lead-precal" />
        {error && <p role="alert" className="text-sm" style={{ color: COLORS.fail }}>{error}</p>}
        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" onClick={onCancel} disabled={enviando} className="px-4 py-2.5 rounded-md font-bold"
            style={{ background: 'transparent', color: COLORS.white, border: `1px solid ${COLORS.border}` }}>
            Cancelar
          </button>
          <button type="button" onClick={() => crear(false)} disabled={enviando} className="flex-1 px-4 py-2.5 rounded-md font-bold disabled:opacity-50"
            style={{ background: 'transparent', color: COLORS.white, border: `1px solid ${COLORS.white}` }}
            title="Guarda el lead en pausa; el cronómetro empieza cuando lo abras">
            Guardar para después
          </button>
          <button type="submit" disabled={enviando} className="flex-1 px-4 py-2.5 rounded-md font-bold disabled:opacity-50"
            style={{ background: 'transparent', color: COLORS.green, border: `1px solid ${COLORS.green}` }}>
            {enviando ? 'Creando…' : 'Iniciar sesión ahora'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CloseDialog({ lead, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-lg border p-6 max-w-md w-full" style={{ background: COLORS.bgLight, borderColor: COLORS.border }}>
        <h3 className="text-2xl mb-1" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white }}>
          Cerrar sesión
        </h3>
        <p className="text-sm mb-4" style={{ color: COLORS.muted }}>Resumen de lo que queda guardado:</p>
        <div className="space-y-2 text-sm" style={{ color: COLORS.white }}>
          <div><strong>Prospecto:</strong> {lead.name || '(sin nombre)'}</div>
          <div><strong>Resultado:</strong> {lead.outcome || '(no marcado)'}</div>
          <div><strong>Temperatura:</strong> {lead.temperatura || '—'}</div>
          <div><strong>Puertas completas:</strong> {getCompletedPuertas(lead)}/7</div>
          {isPuertasComplete(lead) && <div><strong>Cuello:</strong> {getCuelloBotella(lead)}</div>}
          {lead.outcome === 'follow-up' && (
            <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: COLORS.border, color: COLORS.orange }}>
              ⏱ Timer del bono de 48h se activa al confirmar.
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-md font-bold"
            style={{ background: 'transparent', color: COLORS.white, border: `1px solid ${COLORS.border}` }}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-md font-bold"
            style={{ background: 'transparent', color: COLORS.green, border: `1px solid ${COLORS.green}` }}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteDialog({ lead, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-lg border p-6 max-w-md w-full" style={{ background: COLORS.bgLight, borderColor: COLORS.fail + '66' }}>
        <h3 className="text-2xl mb-1" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white }}>
          Borrar sesión
        </h3>
        <p className="text-sm mb-4" style={{ color: COLORS.muted }}>
          Vas a borrar permanentemente la sesión de <strong style={{ color: COLORS.white }}>{lead.name || '(sin nombre)'}</strong>.
          <br />Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2 mt-6">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-md font-bold"
            style={{ background: 'transparent', color: COLORS.white, border: `1px solid ${COLORS.border}` }}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-md font-bold"
            style={{ background: COLORS.fail, color: COLORS.bg }}>
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}
