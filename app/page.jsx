'use client';
import { useState, useEffect, useRef } from 'react';
import Dashboard from '../components/Dashboard';
import Cockpit from '../components/Cockpit';
import ClientScreen from '../components/ClientScreen';
import { COLORS } from '../lib/constants';
import {
  listLeads, createLead, updateLead, deleteLead,
} from '../lib/supabase';

export default function Page() {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'cockpit'
  const [activeId, setActiveId] = useState(null);
  const [showClient, setShowClient] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Debounce de updates: si el usuario cambia 5 cosas en 2 segundos,
  // hacemos un solo round-trip al final.
  const pendingPatch = useRef({});
  const flushTimer = useRef(null);

  useEffect(() => {
    listLeads()
      .then((data) => {
        setLeads(data);
        setLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo conectar a la base de datos. Verifica las variables de entorno.');
        setLoaded(true);
      });
  }, []);

  const activeLead = leads.find((l) => l.id === activeId);

  const handleNewCall = async () => {
    try {
      const lead = await createLead();
      setLeads([lead, ...leads]);
      setActiveId(lead.id);
      setView('cockpit');
    } catch (err) {
      alert('Error creando la sesión: ' + err.message);
    }
  };

  const handleOpenLead = async (id) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    if (!lead.endedAt && lead.pausedAt) {
      // Reanudar
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
    // Optimistic: actualizar UI inmediatamente
    setLeads((prev) => prev.map((l) => (l.id === activeId ? { ...l, [key]: value } : l)));
    // Acumular para flush
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
    // Pausar la sesión activa (acumular segundos) si no está finalizada
    if (activeId) {
      const lead = leads.find((l) => l.id === activeId);
      if (lead && !lead.endedAt && !lead.pausedAt) {
        const sessionStart = lead.resumedAt || lead.callDate;
        const sessionSeconds = Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000);
        // Flush primero los pendientes y luego pausar
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

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg, color: COLORS.muted }}>
        Cargando…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: COLORS.bg }}>
        <div className="max-w-lg text-center">
          <div className="text-2xl mb-4" style={{ fontFamily: 'Instrument Serif, serif', color: COLORS.orange }}>
            Error de conexión
          </div>
          <p className="text-sm" style={{ color: COLORS.muted }}>{error}</p>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <Dashboard leads={leads} onNewCall={handleNewCall} onOpenLead={handleOpenLead} onDeleteLead={handleDelete} />
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
