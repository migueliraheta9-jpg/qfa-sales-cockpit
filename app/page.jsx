'use client';
import { useState, useEffect, useRef } from 'react';
import Dashboard from '../components/Dashboard';
import Cockpit from '../components/Cockpit';
import ClientScreen from '../components/ClientScreen';
import LoginScreen from '../components/LoginScreen';
import { Skeleton, ErrorState } from '../components/Shared';
import { NewLeadDialog } from '../components/Dialogs';
import { COLORS } from '../lib/constants';
import {
  listLeads, createLead, updateLead, deleteLead, crearContactoManual,
  getCurrentUser, onAuthChange, signOut, isAdmin,
} from '../lib/supabase';

export default function Page() {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('dashboard');
  const [activeId, setActiveId] = useState(null);
  const [showClient, setShowClient] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [showNewLead, setShowNewLead] = useState(false);

  const pendingPatch = useRef({});
  const flushTimer = useRef(null);

  // Auth state — con timeout: si getCurrentUser() nunca resuelve (red caída,
  // Supabase sin responder), esto no se queda pegado en "Cargando…" para
  // siempre, cae a un estado de error con reintentar.
  useEffect(() => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setAuthError('No se pudo verificar tu sesión. La conexión está tardando demasiado.');
        setAuthLoaded(true);
      }
    }, 10000);

    getCurrentUser()
      .then((u) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        setUser(u);
        setAuthLoaded(true);
      })
      .catch((err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        console.error(err);
        setAuthError('No se pudo verificar tu sesión. ' + err.message);
        setAuthLoaded(true);
      });

    const sub = onAuthChange((u) => setUser(u));
    return () => {
      clearTimeout(timeout);
      sub?.unsubscribe();
    };
  }, [retryKey]);

  // Load leads cuando hay usuario autenticado
  useEffect(() => {
    if (!user) {
      setLoaded(false);
      setLeads([]);
      return;
    }
    setError(null);
    listLeads()
      .then((data) => {
        setLeads(data);
        setLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo conectar a la base de datos. ' + err.message);
        setLoaded(true);
      });
  }, [user, retryKey]);

  const activeLead = leads.find((l) => l.id === activeId);

  const handleNewCall = () => setShowNewLead(true);

  // Alta manual. El lead se crea en `leads` solo con el nombre; el teléfono y las
  // respuestas van aparte, a lead_contacto (nunca dentro del objeto lead).
  // abrir = true: empieza la sesión ahora (como antes). abrir = false: queda en pausa.
  const handleCreateLead = async ({ nombre, whatsapp, respuestas, abrir }) => {
    const now = new Date().toISOString();
    const lead = await createLead(abrir ? { name: nombre } : { name: nombre, resumedAt: null, pausedAt: now });
    setLeads((prev) => [lead, ...prev]);
    setShowNewLead(false);
    if (abrir) {
      setActiveId(lead.id);
      setView('cockpit');
    }
    if (whatsapp || Object.keys(respuestas).length > 0) {
      try {
        await crearContactoManual(lead.id, { nombre, whatsapp, respuestas });
      } catch (err) {
        // El lead ya existe: no se pierde. El teléfono se puede añadir desde su ficha.
        alert('El lead se creó, pero no se pudieron guardar el teléfono ni las respuestas: ' + err.message + '\nPuedes añadirlos desde la ficha del lead.');
      }
    }
  };

  const handleOpenLead = async (id) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    if (!lead.endedAt && lead.pausedAt) {
      const updated = await updateLead(id, { pausedAt: null, resumedAt: new Date().toISOString() });
      setLeads(leads.map((l) => (l.id === id ? updated : l)));
    }
    setActiveId(id);
    setView('cockpit');
  };

  const flushPending = async () => {
    if (!activeId) return;
    const patch = pendingPatch.current;
    if (Object.keys(patch).length === 0) return;
    pendingPatch.current = {};
    try {
      const updated = await updateLead(activeId, patch);
      setLeads((prev) => prev.map((l) => (l.id === activeId ? updated : l)));
    } catch (err) {
      console.error('Error guardando:', err);
    }
  };

  const handleUpdate = (key, value) => {
    setLeads((prev) => prev.map((l) => (l.id === activeId ? { ...l, [key]: value } : l)));
    pendingPatch.current[key] = value;
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flushPending, 500);
  };

  const handleDelete = async (id) => {
    try {
      await deleteLead(id);
      setLeads(leads.filter((l) => l.id !== id));
      if (id === activeId) {
        setView('dashboard');
        setActiveId(null);
        setShowClient(false);
      }
    } catch (err) {
      alert('Error borrando: ' + err.message);
    }
  };

  const handleFinalize = async (id) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.endedAt) return;
    const sessionStart = lead.resumedAt || lead.callDate;
    const sessionSeconds = lead.pausedAt
      ? 0
      : Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000);
    try {
      const updated = await updateLead(id, {
        accumulatedSeconds: (lead.accumulatedSeconds || 0) + sessionSeconds,
        endedAt: new Date().toISOString(),
        pausedAt: null,
        resumedAt: null,
      });
      setLeads(leads.map((l) => (l.id === id ? updated : l)));
    } catch (err) {
      console.error('Error finalizando:', err);
    }
  };

  const handleClose = async () => {
    if (activeId) {
      const lead = leads.find((l) => l.id === activeId);
      if (lead && !lead.endedAt && !lead.pausedAt) {
        const sessionStart = lead.resumedAt || lead.callDate;
        const sessionSeconds = Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000);
        await flushPending();
        try {
          const updated = await updateLead(activeId, {
            accumulatedSeconds: (lead.accumulatedSeconds || 0) + sessionSeconds,
            pausedAt: new Date().toISOString(),
            resumedAt: null,
          });
          setLeads((prev) => prev.map((l) => (l.id === activeId ? updated : l)));
        } catch (err) {
          console.error('Error pausando:', err);
        }
      }
    }
    setView('dashboard');
    setActiveId(null);
    setShowClient(false);
  };

  const handleLogout = async () => {
    await signOut();
    setView('dashboard');
    setActiveId(null);
    setShowClient(false);
  };

  // ============ Render ============

  if (!authLoaded) {
    return (
      <div className="min-h-screen p-10" style={{ background: COLORS.bg }}>
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8" style={{ width: '220px' }} />
            <Skeleton className="h-10" style={{ width: '160px' }} />
          </div>
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <ErrorState
        title="No pudimos verificar tu sesión"
        message={authError}
        code={`ERR_AUTH_TIMEOUT · ${new Date().toLocaleTimeString('es-SV')}`}
        onRetry={() => { setAuthError(null); setAuthLoaded(false); setRetryKey((k) => k + 1); }}
      />
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!loaded) {
    return (
      <div className="min-h-screen p-10" style={{ background: COLORS.bg }}>
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8" style={{ width: '260px' }} />
            <Skeleton className="h-10" style={{ width: '160px' }} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Error de conexión"
        message={error}
        code={`ERR_FETCH_LEADS · ${new Date().toLocaleTimeString('es-SV')}`}
        onRetry={() => { setError(null); setLoaded(false); setRetryKey((k) => k + 1); }}
        retryLabel="Reintentar"
      />
    );
  }

  if (view === 'dashboard') {
    return (
      <>
        <Dashboard
          leads={leads}
          user={user}
          onNewCall={handleNewCall}
          onOpenLead={handleOpenLead}
          onDeleteLead={handleDelete}
          onLogout={handleLogout}
        />
        {showNewLead && <NewLeadDialog onCreate={handleCreateLead} onCancel={() => setShowNewLead(false)} />}
      </>
    );
  }

  return (
    <>
      <Cockpit
        lead={activeLead}
        onUpdate={handleUpdate}
        onClose={handleClose}
        onShareScreen={() => setShowClient(true)}
        onDelete={handleDelete}
        onFinalize={handleFinalize}
      />
      {showClient && activeLead && <ClientScreen lead={activeLead} onClose={() => setShowClient(false)} />}
    </>
  );
}
