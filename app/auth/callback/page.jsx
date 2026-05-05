'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { COLORS } from '../../../lib/constants';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase maneja el callback automáticamente vía detectSessionInUrl
    // Solo esperamos a que se procese y redirigimos al dashboard
    const handleCallback = async () => {
      // Da tiempo a Supabase para procesar el hash de la URL
      await new Promise((resolve) => setTimeout(resolve, 500));
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      } else {
        // Si no hay sesión por alguna razón, vuelve al login
        router.push('/');
      }
    };
    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg, color: COLORS.muted, fontFamily: 'Manrope, sans-serif' }}>
      <div className="text-center">
        <div className="text-2xl mb-2" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white }}>
          Iniciando sesión…
        </div>
        <div className="text-sm">Redirigiendo en un momento</div>
      </div>
    </div>
  );
}
