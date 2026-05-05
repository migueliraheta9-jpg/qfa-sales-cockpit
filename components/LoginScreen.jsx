'use client';
import { useState } from 'react';
import { COLORS } from '../lib/constants';
import { signInWithGoogle } from '../lib/supabase';
import { QFAHeader } from './Shared';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: COLORS.bg }}>
      <div className="px-10 py-8">
        <QFAHeader />
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-md w-full text-center">
          <div className="text-[10px] tracking-[0.4em] mb-4" style={{ color: COLORS.muted }}>
            ACCESO INTERNO · SALES COCKPIT
          </div>
          <h1
            className="text-5xl font-normal mb-4 leading-tight"
            style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.white, letterSpacing: '-0.02em' }}
          >
            Solo para el equipo de <em style={{ color: COLORS.cyan }}>Quantum Flow</em>.
          </h1>
          <p className="text-base mb-10 italic" style={{ color: COLORS.muted, fontFamily: 'Instrument Serif, serif' }}>
            Inicia sesión con tu cuenta autorizada
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full px-6 py-4 rounded-md font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ background: COLORS.white, color: COLORS.bg }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Conectando con Google…' : 'Iniciar sesión con Google'}
          </button>

          {error && (
            <div className="mt-6 p-4 rounded-md text-sm text-left" style={{ background: COLORS.orange + '15', border: `1px solid ${COLORS.orange}55`, color: COLORS.orange }}>
              {error}
            </div>
          )}

          <p className="text-xs mt-8" style={{ color: COLORS.mutedDim }}>
            Solo cuentas autorizadas pueden acceder.<br />
            Si no tienes acceso, contacta a Miguel.
          </p>
        </div>
      </div>

      <div className="px-10 py-6 text-[10px] tracking-[0.3em] flex items-center justify-between" style={{ color: COLORS.muted, borderTop: `1px solid ${COLORS.border}` }}>
        <span>QFA · 2026 / 03</span>
        <span>SAN SALVADOR, EL SALVADOR</span>
      </div>
    </div>
  );
}
