import './globals.css';

export const metadata = {
  title: 'QF Sales Cockpit',
  description: 'Sales cockpit interno para sesiones estratégicas QFA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
