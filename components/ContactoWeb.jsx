'use client';
// Ficha de contacto del lead: teléfono, email, consentimiento, respuestas de
// precalificación, cita y origen. Sale de la tabla `lead_contacto`, NO de `leads`.
//
// Reglas (no romperlas):
// - Se consulta solo al abrir un lead y se guarda en el estado de ESTE componente.
//   Nunca se copia dentro del objeto `lead`: `leads.data` alimenta el reporte público.
// - Este componente no se usa en ClientScreen (pantalla compartida), ni en /r/[id],
//   ni en el Dashboard.
// - Solo lo ve y lo edita el equipo (staff_allowlist); lo decide la base de datos.
import { useCallback, useEffect, useState } from 'react';
import { Phone, Mail, Pencil, RefreshCw, Video, AlertTriangle } from 'lucide-react';
import { COLORS } from '../lib/constants';
import { getContactoByLeadId, editarContacto } from '../lib/supabase';
import { PAISES, OTRO_PAIS, PAIS_POR_DEFECTO, validarTelefono, separarWhatsapp } from '../lib/paises';
import { PREGUNTAS, valoresDeRespuestas, respuestasParaMostrar, combinarRespuestas } from '../lib/precalificacion';
import { Skeleton } from './Shared';

const ETIQUETA = 'text-[10px] tracking-[0.3em] font-bold mb-2';
const CAMPO = 'px-3 py-2 rounded-md outline-none text-sm';
const estiloCampo = { background: COLORS.bg, color: COLORS.white, border: `1px solid ${COLORS.border}` };

// Selector de país + número. Se usa aquí y en el alta manual (Dialogs.jsx).
export function CampoTelefono({ pais, numero, onPais, onNumero, error, idBase = 'tel' }) {
  return (
    <div>
      <label htmlFor={`${idBase}-numero`} className={`${ETIQUETA} block`} style={{ color: COLORS.muted }}>
        TELÉFONO / WHATSAPP
      </label>
      <div className="flex gap-2">
        <select aria-label="País" value={pais} onChange={(e) => onPais(e.target.value)} className={CAMPO} style={{ ...estiloCampo, maxWidth: '11rem' }}>
          {PAISES.map((item) => (
            <option key={item.codigo} value={item.codigo}>{item.nombre} ({item.prefijo})</option>
          ))}
          <option value={OTRO_PAIS}>Otro (escribir con +)</option>
        </select>
        <input id={`${idBase}-numero`} type="tel" inputMode="tel" autoComplete="off" value={numero}
          onChange={(e) => onNumero(e.target.value)}
          placeholder={pais === OTRO_PAIS ? '+34 600 000 000' : 'Número sin prefijo'}
          aria-invalid={Boolean(error)}
          className={`${CAMPO} flex-1 min-w-0`}
          style={{ ...estiloCampo, borderColor: error ? COLORS.fail : COLORS.border }} />
      </div>
      {error && <p role="alert" className="text-xs mt-1.5" style={{ color: COLORS.fail }}>{error}</p>}
    </div>
  );
}

// Preguntas de precalificación, todas opcionales. Si no hay preguntas, no muestra nada.
export function CamposPrecalificacion({ valores, onChange, idBase = 'precal' }) {
  if (PREGUNTAS.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className={ETIQUETA} style={{ color: COLORS.muted }}>PRECALIFICACIÓN (OPCIONAL)</div>
      {PREGUNTAS.map((pregunta) => (
        <div key={pregunta.id}>
          <label htmlFor={`${idBase}-${pregunta.id}`} className="text-sm block mb-1" style={{ color: COLORS.white }}>
            {pregunta.etiqueta}
          </label>
          {pregunta.tipo === 'opcion' ? (
            <select id={`${idBase}-${pregunta.id}`} value={valores[pregunta.id] || ''}
              onChange={(e) => onChange({ ...valores, [pregunta.id]: e.target.value })}
              className={`${CAMPO} w-full`} style={estiloCampo}>
              <option value="">Sin respuesta</option>
              {(pregunta.opciones || []).map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
              ))}
            </select>
          ) : (
            <input id={`${idBase}-${pregunta.id}`} type="text" maxLength={500} value={valores[pregunta.id] || ''}
              onChange={(e) => onChange({ ...valores, [pregunta.id]: e.target.value })}
              className={`${CAMPO} w-full`} style={estiloCampo} />
          )}
        </div>
      ))}
    </div>
  );
}

function fechaLocal(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es', { dateStyle: 'full', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function Bloque({ titulo, children }) {
  return (
    <div className="min-w-0">
      <div className={ETIQUETA} style={{ color: COLORS.muted }}>{titulo}</div>
      <div className="text-sm space-y-1" style={{ color: COLORS.white }}>{children}</div>
    </div>
  );
}

export default function ContactoWeb({ leadId }) {
  // estado: 'cargando' | 'listo' | 'error'
  const [estado, setEstado] = useState('cargando');
  const [contacto, setContacto] = useState(null);
  const [editando, setEditando] = useState(false);
  const [pais, setPais] = useState(PAIS_POR_DEFECTO);
  const [numero, setNumero] = useState('');
  const [valores, setValores] = useState({});
  const [errorTelefono, setErrorTelefono] = useState(null);
  const [errorGuardar, setErrorGuardar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      setContacto(await getContactoByLeadId(leadId));
      setEstado('listo');
    } catch (err) {
      console.error('Error leyendo el contacto:', err?.message);
      setEstado('error');
    }
  }, [leadId]);

  useEffect(() => {
    setEditando(false);
    setContacto(null);
    cargar();
  }, [cargar]);

  const abrirEdicion = () => {
    const partes = separarWhatsapp(contacto?.whatsapp);
    setPais(partes.pais);
    setNumero(partes.numero);
    setValores(valoresDeRespuestas(PREGUNTAS, contacto?.precal_respuestas));
    setErrorTelefono(null);
    setErrorGuardar(null);
    setEditando(true);
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    const telefono = validarTelefono(pais, numero);
    setErrorTelefono(telefono.error);
    if (telefono.error) return;

    setGuardando(true);
    setErrorGuardar(null);
    try {
      await editarContacto(leadId, {
        whatsapp: telefono.whatsapp, // '' = borrar el número
        // Sin preguntas configuradas no hay nada que editar: las respuestas no se tocan.
        respuestas: PREGUNTAS.length > 0 ? combinarRespuestas(PREGUNTAS, contacto?.precal_respuestas, valores) : undefined,
      });
      setContacto(await getContactoByLeadId(leadId));
      setEditando(false);
    } catch (err) {
      setErrorGuardar(err?.message || 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const marco = 'mb-4 rounded-lg border p-4';
  const estiloMarco = { background: COLORS.bgLight, borderColor: COLORS.border };

  if (estado === 'cargando') {
    return (
      <div className={marco} style={estiloMarco} aria-busy="true">
        <Skeleton className="h-3 w-40 mb-3" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (estado === 'error') {
    return (
      <div role="alert" className={`${marco} flex items-center justify-between gap-4`} style={{ ...estiloMarco, borderColor: COLORS.fail + '66' }}>
        <span className="text-sm" style={{ color: COLORS.fail }}>No se pudieron cargar los datos de contacto.</span>
        <button onClick={cargar} className="flex items-center gap-2 px-3 py-1.5 rounded-md font-bold text-sm"
          style={{ background: 'transparent', color: COLORS.fail, border: `1px solid ${COLORS.fail}` }}>
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    );
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className={`${marco} space-y-4`} style={estiloMarco} noValidate>
        <div className="text-[10px] tracking-[0.3em] font-bold" style={{ color: COLORS.cyan }}>EDITAR DATOS DE CONTACTO</div>
        <CampoTelefono pais={pais} numero={numero} onPais={setPais} onNumero={setNumero} error={errorTelefono} idBase={`ficha-${leadId}`} />
        <CamposPrecalificacion valores={valores} onChange={setValores} idBase={`ficha-precal-${leadId}`} />
        {errorGuardar && <p role="alert" className="text-sm" style={{ color: COLORS.fail }}>{errorGuardar}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditando(false)} disabled={guardando} className="px-4 py-2 rounded-md font-bold text-sm"
            style={{ background: 'transparent', color: COLORS.white, border: `1px solid ${COLORS.border}` }}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="px-4 py-2 rounded-md font-bold text-sm disabled:opacity-50"
            style={{ background: 'transparent', color: COLORS.green, border: `1px solid ${COLORS.green}` }}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    );
  }

  const botonEditar = (texto) => (
    <button onClick={abrirEdicion} className="flex items-center gap-2 px-3 py-1.5 rounded-md font-bold text-sm shrink-0"
      style={{ background: 'transparent', color: COLORS.white, border: `1px solid ${COLORS.border}` }}>
      <Pencil size={14} /> {texto}
    </button>
  );

  // Lead sin datos de contacto (creado a mano antes de esta función, o sin teléfono).
  if (!contacto) {
    return (
      <div className={`${marco} flex items-center justify-between gap-4`} style={estiloMarco}>
        <span className="text-sm" style={{ color: COLORS.muted }}>Este lead no tiene datos de contacto guardados.</span>
        {botonEditar('Añadir teléfono')}
      </div>
    );
  }

  const respuestas = respuestasParaMostrar(contacto.precal_respuestas);
  const consiente = contacto.whatsapp_consentimiento_marketing === true;
  const origenPartes = [
    contacto.utm_source && `fuente: ${contacto.utm_source}`,
    contacto.utm_medium && `medio: ${contacto.utm_medium}`,
    contacto.utm_campaign && `campaña: ${contacto.utm_campaign}`,
    contacto.lp_slug && `landing: ${contacto.lp_slug}`,
    contacto.recurso_descargado && `recurso: ${contacto.recurso_descargado}`,
  ].filter(Boolean);
  const cancelada = contacto.cita_estado === 'cancelada';

  return (
    <div className={marco} style={estiloMarco}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="text-[10px] tracking-[0.3em] font-bold" style={{ color: COLORS.cyan }}>
          DATOS DE CONTACTO · {contacto.origen === 'manual' ? 'ALTA MANUAL' : 'SITIO WEB'}
        </div>
        {botonEditar('Editar')}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Bloque titulo="CONTACTO">
          {contacto.whatsapp ? (
            <a href={`https://wa.me/${contacto.whatsapp.replace('+', '')}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 hover:opacity-80" style={{ color: COLORS.white }}>
              <Phone size={14} style={{ color: COLORS.cyan }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{contacto.whatsapp}</span>
            </a>
          ) : (
            <div style={{ color: COLORS.muted }}>Sin teléfono</div>
          )}
          {contacto.email ? (
            <a href={`mailto:${contacto.email}`} className="flex items-center gap-2 hover:opacity-80 break-all" style={{ color: COLORS.white }}>
              <Mail size={14} style={{ color: COLORS.cyan }} /> {contacto.email}
            </a>
          ) : (
            <div style={{ color: COLORS.muted }}>Sin email</div>
          )}
          {contacto.whatsapp && (
            <div className="flex items-start gap-2 text-xs pt-1" style={{ color: consiente ? COLORS.green : COLORS.orange }}>
              {!consiente && <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
              <span>
                {consiente
                  ? `Aceptó mensajes de seguimiento el ${fechaLocal(contacto.whatsapp_consentimiento_marketing_at)}.`
                  : 'No aceptó mensajes de seguimiento: el número es solo para coordinar la llamada.'}
              </span>
            </div>
          )}
        </Bloque>

        {contacto.cita_inicio && (
          <Bloque titulo="CITA">
            <div style={{ textDecoration: cancelada ? 'line-through' : 'none' }}>{fechaLocal(contacto.cita_inicio)}</div>
            <div className="text-xs" style={{ color: cancelada ? COLORS.fail : COLORS.muted }}>
              {cancelada ? 'Cancelada' : contacto.cita_estado === 'reprogramada' ? 'Reprogramada' : 'Agendada'} · tu hora local
            </div>
            {!cancelada && contacto.meet_url && (
              <a href={contacto.meet_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 mt-1 rounded-md font-bold text-sm"
                style={{ background: 'transparent', color: COLORS.white, border: `1px solid ${COLORS.white}` }}>
                <Video size={14} /> Abrir Meet
              </a>
            )}
          </Bloque>
        )}

        {(respuestas.length > 0 || contacto.calificado !== null) && (
          <Bloque titulo="PRECALIFICACIÓN">
            {contacto.calificado !== null && (
              <div className="text-xs" style={{ color: contacto.calificado ? COLORS.green : COLORS.orange }}>
                {contacto.calificado ? 'Califica' : 'No califica'}
                {contacto.calificado_motivo ? ` · ${contacto.calificado_motivo}` : ''}
              </div>
            )}
            {respuestas.map((item) => (
              <div key={item.id}>
                <div className="text-xs" style={{ color: COLORS.muted }}>{item.pregunta}</div>
                <div>{item.respuesta || '—'}</div>
              </div>
            ))}
          </Bloque>
        )}

        {origenPartes.length > 0 && (
          <Bloque titulo="ORIGEN">
            <div className="text-xs" style={{ color: COLORS.muted }}>{origenPartes.join(' · ')}</div>
          </Bloque>
        )}
      </div>
    </div>
  );
}
