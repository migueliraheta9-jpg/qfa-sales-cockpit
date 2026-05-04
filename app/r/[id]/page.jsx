import { getLeadByPublicId } from '../../../lib/supabase';
import { COLORS } from '../../../lib/constants';
import DiagnosticoView from '../../../components/Diagnostico';
import { RutaView } from '../../../components/RutaStack';
import { QFAHeader } from '../../../components/Shared';

export const dynamic = 'force-dynamic';

export default async function PublicReport({ params }) {
  const { id } = params;
  let lead = null;
  try {
    lead = await getLeadByPublicId(id);
  } catch (e) {
    console.error('Error al cargar reporte:', e);
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: COLORS.bg }}>
        <div className="max-w-lg text-center">
          <div className="text-4xl mb-4" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white }}>
            Reporte no encontrado
          </div>
          <p className="text-sm" style={{ color: COLORS.muted }}>
            Este link puede haber expirado o no es válido. Contacta al equipo de Quantum Flow Academy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh' }}>
      <div className="px-12 pt-8">
        <QFAHeader />
      </div>
      <DiagnosticoView lead={lead} isPublic={true} />
      <RutaView />
      <div className="px-12 pb-12 text-center text-[10px] tracking-[0.3em]" style={{ color: COLORS.muted }}>
        QFA · {new Date().getFullYear()} · SAN SALVADOR, EL SALVADOR
      </div>
    </div>
  );
}
