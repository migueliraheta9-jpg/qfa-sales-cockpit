/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Escala estructural adaptada de Nocturne (6 niveles) a las fuentes
      // actuales del repo (Manrope / Instrument Serif / JetBrains Mono).
      // No son los px de Nocturne copiados: se calibraron contra los tamaños
      // que ya existen en los componentes (text-sm, text-2xl, text-[10px]...)
      // para no introducir un segundo sistema de tamaños en paralelo.
      fontSize: {
        // 10px, mono uppercase, tracking .14em — kickers/labels (ya usado
        // como text-[10px] en decenas de lugares; esto le pone nombre).
        kicker: ['0.625rem', { lineHeight: '1', letterSpacing: '0.14em', fontWeight: '600' }],
        // 14px — cuerpo interno (equivalente al text-sm que ya se usa en casi
        // todo el cockpit interno).
        body: ['0.875rem', { lineHeight: '1.6' }],
        // 18px — h3 / cuerpo del reporte cliente.
        h3: ['1.125rem', { lineHeight: '1.3' }],
        // 24px — h2, tamaño mínimo legible en pantalla compartida por video.
        h2: ['1.5rem', { lineHeight: '1.2' }],
        // 36px — h1 de pantalla compartida.
        h1: ['2.25rem', { lineHeight: '1.15' }],
        // Hero del reporte público — el clamp() que ya usa Diagnostico.jsx,
        // ahora como token reutilizable en vez de string mágico repetido.
        display: ['clamp(48px, 6vw, 80px)', { lineHeight: '1.05' }],
      },
    },
  },
  plugins: [],
};
