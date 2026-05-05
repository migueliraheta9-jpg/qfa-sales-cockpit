# QFA Sales Cockpit

Sales cockpit interno para sesiones estratégicas de Quantum Flow Academy.

## Stack

- **Next.js 14** (App Router) — frontend y rutas
- **Supabase** — base de datos (Postgres) + auth
- **Tailwind CSS** — estilos
- **Recharts** — radar del diagnóstico
- **Lucide React** — íconos

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores reales de Supabase.

### 3. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy en Railway

1. Push del código a GitHub
2. En Railway: "New Project" → "Deploy from GitHub repo"
3. Selecciona `qfa-sales-cockpit`
4. En "Variables", agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Railway detecta Next.js automáticamente y deploya

## Estructura

```
app/
  layout.js           # layout raíz
  page.jsx            # dashboard + cockpit (orquestador)
  globals.css         # estilos globales + fonts
  r/[id]/page.jsx     # reporte público para clientes
components/
  Dashboard.jsx       # listado de leads
  Cockpit.jsx         # vista de la sesión activa
  ClientScreen.jsx    # pantalla compartida en la call
  Diagnostico.jsx     # vista de radar (compartida cockpit/público)
  RutaStack.jsx       # vistas de ruta y stack
  Dialogs.jsx         # modales de confirmación
  Shared.jsx          # header y badges
lib/
  constants.js        # colores, puertas, objeciones
  scoring.js          # cálculos de diagnóstico y temperatura
  supabase.js         # cliente y operaciones de BD
```

## Tabla en Supabase

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  data jsonb default '{}',
  owner_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Con RLS habilitada y 4 políticas (SELECT, INSERT, UPDATE, DELETE).

## Reporte público

Cada lead tiene un `publicId` único (campo dentro de `data`). El cliente puede acceder a su diagnóstico en:

```
https://tu-dominio/r/{publicId}
```
