'use client';
import { COLORS } from '../lib/constants';
import { getCompletedPuertas, isPuertasComplete, getCuelloBotella } from '../lib/scoring';

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
            style={{ background: COLORS.green, color: COLORS.bg }}>
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
      <div className="rounded-lg border p-6 max-w-md w-full" style={{ background: COLORS.bgLight, borderColor: COLORS.orange + '66' }}>
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
            style={{ background: COLORS.orange, color: COLORS.bg }}>
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}
