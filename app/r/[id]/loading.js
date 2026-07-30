import { Skeleton } from '../../../components/Shared';
import { COLORS } from '../../../lib/constants';

// Next.js muestra esto automáticamente mientras PublicReport (Server
// Component, page.jsx) espera getLeadByPublicId(). Reproduce la silueta
// real del reporte (hero + radar + tarjetas), no un spinner genérico.
export default function LoadingReport() {
  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh' }}>
      <div className="px-12 pt-8 pb-4">
        <Skeleton className="h-10" style={{ width: '220px' }} />
      </div>
      <div className="px-12 pb-32 pt-4">
        <div className="max-w-3xl mx-auto text-center mb-12 flex flex-col items-center gap-4">
          <Skeleton className="h-3" style={{ width: '160px' }} />
          <Skeleton className="h-16" style={{ width: '80%' }} />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-12 md:col-span-7">
              <Skeleton style={{ height: '480px' }} />
            </div>
            <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
