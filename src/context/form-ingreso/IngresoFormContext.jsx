import { createContext, useContext, useEffect, useState } from 'react';

import useIngresoAutosave from '../../hooks/form-ingreso/useIngresoAutosave.js';
import useIngresoDiff from '../../hooks/form-ingreso/useIngresoDiff';
import useIngresoInitialLoad from '../../hooks/form-ingreso/useIngresoInitialLoad.js';
import useIngresoLineas from '../../hooks/form-ingreso/useIngresoLineas';

const IngresoFormContext = createContext(null);

/*───────────────────────────────────────────────
  ⭐ Renderizado del diff (cliente/equipo/técnico/líneas)
───────────────────────────────────────────────*/
function renderDiff(d) {
  if (!d) return <li>No se detectaron cambios</li>;

  const items = [];

  // Cliente
  if (d.cliente?.fields?.length > 0) {
    items.push(
      <li key="cliente">
        <strong>Cliente</strong>
        <ul>
          {d.cliente.fields.map((f) => (
            <li key={f.field}>
              {f.field}: <em>{String(f.old)}</em> →{' '}
              <strong>{String(f.new)}</strong>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  // Equipo
  if (d.equipo?.fields?.length > 0) {
    items.push(
      <li key="equipo">
        <strong>Equipo</strong>
        <ul>
          {d.equipo.fields.map((f) => (
            <li key={f.field}>
              {f.field}: <em>{String(f.old)}</em> →{' '}
              <strong>{String(f.new)}</strong>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  // Técnico
  if (d.tecnico?.fields?.length > 0) {
    items.push(
      <li key="tecnico">
        <strong>Técnico</strong>
        <ul>
          {d.tecnico.fields.map((f) => (
            <li key={f.field}>
              {f.field}: <em>{String(f.old)}</em> →{' '}
              <strong>{String(f.new)}</strong>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  // Líneas
  if (d.lineas) {
    const { added, removed, modified } = d.lineas;

    if (added?.length > 0) {
      items.push(
        <li key="lineas-added">
          <strong>Líneas agregadas:</strong> {added.length}
        </li>
      );
    }

    if (removed?.length > 0) {
      items.push(
        <li key="lineas-removed">
          <strong>Líneas eliminadas:</strong> {removed.length}
        </li>
      );
    }

    if (modified?.length > 0) {
      items.push(
        <li key="lineas-modified">
          <strong>Líneas modificadas:</strong>
          <ul>
            {modified.map((l) => (
              <li key={l.uid}>
                Línea {l.uid.slice(0, 6)}
                <ul>
                  {l.changes.map((c) => (
                    <li key={c.field}>
                      {c.field}: <em>{String(c.old)}</em> →{' '}
                      <strong>{String(c.new)}</strong>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </li>
      );
    }
  }

  if (items.length === 0) return <li>No se detectaron cambios</li>;
  return items;
}

/*───────────────────────────────────────────────*/

export function IngresoFormProvider({ children, initialPayload = null }) {
  const {
    cliente,
    setCliente,
    equipo,
    setEquipo,
    tecnico,
    setTecnico,
    orden,
    setOrden,
    loadPayload,
    initialSource,
    loaded,
    loadingPayload,
    originalRef,
  } = useIngresoInitialLoad({ initialPayload });

  const {
    makeLinea,
    addLinea,
    deleteLinea,
    updateLinea,
    resetLinea,
    resolveEstado,
  } = useIngresoLineas({ orden, setOrden, originalRef });

  const { buildDiff, hasChanges, applyDiff, explainDiff } = useIngresoDiff({
    cliente,
    equipo,
    tecnico,
    orden,
    setCliente,
    setEquipo,
    setTecnico,
    setOrden,
    originalRef,
    makeLinea,
  });

  const {
    autosave,
    autosaveReady,
    persistEnabled,
    setPersistEnabled,
    loadAutosave,
    discardAutosave,
  } = useIngresoAutosave({
    key: 'formIngresoAutosave_v3',
    buildDiff,
    enabledInitial: true,
  });

  // ---------------------------------------------------------
  // 🔥 Estado de modal de recuperación
  // ---------------------------------------------------------
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [savedDraft, setSavedDraft] = useState(null);

  // ---------------------------------------------------------
  // 🔥 Detecta AUTOSAVE al montar
  // ---------------------------------------------------------
  useEffect(() => {
    if (!loaded) return;

    const saved = loadAutosave();
    if (saved && saved.timestamp) {
      console.log('💾 AUTOSAVE DETECTADO →', saved);

      setSavedDraft(saved);
      setShowRestoreDialog(true);
    }
  }, [loaded, loadAutosave]);

  // ---------------------------------------------------------
  // 🔥 Restaurar DIFF correctamente
  // ---------------------------------------------------------
  const restoreSavedDraft = () => {
    if (!savedDraft) return;

    console.log('🔄 Restaurando autosave (DIFF)…', savedDraft);
    applyDiff(savedDraft.data); // DIFF → applyDiff()

    setShowRestoreDialog(false);
  };

  const discardSavedDraft = () => {
    console.log('🗑️ Descartando autosave…');
    discardAutosave();
    setShowRestoreDialog(false);
  };

  // ---------------------------------------------------------
  // 🟩 AUTOSAVE automático al modificar datos
  // ---------------------------------------------------------
  useEffect(() => {
    if (!loaded || !autosaveReady) return;
    autosave();
  }, [loaded, autosaveReady, cliente, equipo, tecnico, orden]);

  // ---------------------------------------------------------
  // 🔥 MODAL DE RECUPERACIÓN (nuevo y preciso)
  // ---------------------------------------------------------
  // 🔥 Modal de recuperación
  const restoreDialogUI = showRestoreDialog ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          minWidth: 400,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          animation: 'popIn 0.2s',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>🔄 Recuperar formulario guardado</h3>
        <p style={{ marginTop: 0 }}>
          Se encontró un progreso guardado automáticamente.
        </p>

        <div
          style={{
            background: '#f7f7f7',
            padding: 12,
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          <strong>Fecha de guardado:</strong>
          <br />
          {new Date(savedDraft.timestamp).toLocaleString()}

          <hr />

          <strong>Detalles del cambio:</strong>
          <ul style={{ margin: '8px 0 0 20px' }}>
            {Object.entries(savedDraft.data).length === 0 && <li>Ninguno</li>}

            {Object.entries(savedDraft.data).map(([section, value]) => (
              <li key={section}>
                <strong>{section}</strong>
                {typeof value === 'object' && value !== null ? (
                  <ul style={{ margin: '4px 0 0 16px' }}>
                    {Object.entries(value).map(([k, v]) => {
                      // v puede ser objeto anidado (lineasServicio)
                      if (typeof v === 'object' && v !== null) {
                        return (
                          <li key={k}>
                            {k}:
                            <ul style={{ margin: '2px 0 0 12px' }}>
                              {Object.entries(v).map(([subKey, subVal]) => (
                                <li key={subKey}>
                                  {subKey}: {JSON.stringify(subVal)}
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      }
                      return (
                        <li key={k}>
                          {k}: {v?.toString() ?? 'null'}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  ` → ${value?.toString() ?? 'null'}`
                )}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={discardSavedDraft}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: '#ccc',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ❌ Descartar
          </button>

          <button
            onClick={restoreSavedDraft}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: '#4caf50',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🔄 Restaurar
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ---------------------------------------------------------
  // Context value
  // ---------------------------------------------------------
  const contextValue = {
    cliente,
    setCliente,
    equipo,
    setEquipo,
    tecnico,
    setTecnico,
    orden,
    setOrden,

    addLinea,
    deleteLinea,
    updateLinea,
    resetLinea,
    makeLinea,

    buildDiff,
    hasChanges,
    applyDiff,
    discardAutosave,
    initialSource,

    resolveEstado,
    originalRef,
    explainDiff,

    persistEnabled,
    setPersistEnabled,
    autosave,
    autosaveReady,
    loaded,
  };

  return (
    <IngresoFormContext.Provider value={contextValue}>
      {children}
      {restoreDialogUI}
    </IngresoFormContext.Provider>
  );
}

export const useIngresoForm = () => useContext(IngresoFormContext);
export default IngresoFormProvider;
