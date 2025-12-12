import { createContext, useContext, useEffect, useState } from 'react';

import useIngresoAutosave from '../../hooks/form-ingreso/useIngresoAutosave.js';
import useIngresoDiff from '../../hooks/form-ingreso/useIngresoDiff';
import useIngresoInitialLoad from '../../hooks/form-ingreso/useIngresoInitialLoad.js';
import useIngresoLineas from '../../hooks/form-ingreso/useIngresoLineas';

const IngresoFormContext = createContext(null);

/*───────────────────────────────────────────────
  ✔ Conversión segura de valores a texto
───────────────────────────────────────────────*/
function formatValue(v) {
  if (v === null || v === undefined) return '—';

  if (typeof v === 'object') {
    if (v.nombre) return v.nombre; // tipoTrabajo, técnico, etc.
    return JSON.stringify(v); // fallback legible
  }

  return String(v);
}

/*───────────────────────────────────────────────
  ⭐ Renderizado del diff (cliente/equipo/técnico/líneas)
───────────────────────────────────────────────*/
/*───────────────────────────────────────────────
  ✔ Renderizado unificado del diff
───────────────────────────────────────────────*/
function renderDiff(d) {
  if (!d) return <li>No se detectaron cambios</li>;

  const items = [];

  const renderFieldList = (title, fields) => (
    <li key={title}>
      <strong>{title}</strong>
      <ul style={{ marginTop: 6 }}>
        {fields.map((f) => (
          <li key={f.field}>
            {f.field}: <em>{formatValue(f.old)}</em> →{' '}
            <strong>{formatValue(f.new)}</strong>
          </li>
        ))}
      </ul>
    </li>
  );

  /*───────────────────────────────
    CLIENTE
  ───────────────────────────────*/
  if (d.cliente?.fields?.length > 0) {
    items.push(renderFieldList('Cliente', d.cliente.fields));
  }

  /*───────────────────────────────
    EQUIPO
  ───────────────────────────────*/
  if (d.equipo?.fields?.length > 0) {
    items.push(renderFieldList('Equipo', d.equipo.fields));
  }

  /*───────────────────────────────
    TÉCNICO
  ───────────────────────────────*/
  if (d.tecnico?.fields?.length > 0) {
    items.push(renderFieldList('Técnico', d.tecnico.fields));
  }

  /*───────────────────────────────
    LÍNEAS
  ───────────────────────────────*/
  if (d.lineas) {
    const { added = [], removed = [], modified = [] } = d.lineas;

    // -------- AGREGADAS ----------
    if (added.length > 0) {
      items.push(
        <li key="lineas-added">
          <strong>Líneas agregadas:</strong> {added.length}
          <ul style={{ marginTop: 6 }}>
            {added.map((l) => (
              <li key={l.uid}>
                <strong>Línea nueva</strong> ({l.uid.slice(0, 6)})
                <ul>
                  <li>Descripción: {formatValue(l.descripcion)}</li>
                  <li>Cantidad: {formatValue(l.cantidad)}</li>
                  <li>Precio unitario: {formatValue(l.precioUnitario)}</li>
                  <li>Tipo de trabajo: {formatValue(l.tipoTrabajo?.nombre)}</li>
                </ul>
              </li>
            ))}
          </ul>
        </li>
      );
    }

    // -------- ELIMINADAS ----------
    if (removed.length > 0) {
      items.push(
        <li key="lineas-removed">
          <strong>Líneas eliminadas:</strong> {removed.length}
          <ul style={{ marginTop: 6 }}>
            {removed.map((uid) => (
              <li key={uid}>Línea {uid.slice(0, 6)}</li>
            ))}
          </ul>
        </li>
      );
    }

    // -------- MODIFICADAS ----------
    if (modified.length > 0) {
      items.push(
        <li key="lineas-modified">
          <strong>Líneas modificadas:</strong>
          <ul style={{ marginTop: 6 }}>
            {modified.map((l) => (
              <li key={l.uid}>
                Línea {l.uid.slice(0, 6)}
                <ul>
                  {l.changes.map((c) => (
                    <li key={c.field}>
                      {c.field}: <em>{formatValue(c.old)}</em> →{' '}
                      <strong>{formatValue(c.new)}</strong>
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
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          width: '500px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 10px 26px rgba(0,0,0,0.25)',
          animation: 'popIn 0.2s ease-out',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '20px 24px 10px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <h3 style={{ margin: 0 }}>🔄 Recuperar formulario guardado</h3>
          <p style={{ marginTop: 6, fontSize: 14, color: '#444' }}>
            Se encontró un progreso guardado automáticamente.
          </p>
        </div>

        {/* CONTENT SCROLLABLE */}
        <div
          style={{
            padding: '16px 24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <strong>Fecha de guardado:</strong>
          <br />
          {new Date(savedDraft.timestamp).toLocaleString()}

          <hr style={{ margin: '16px 0' }} />

          <strong style={{ fontSize: 15 }}>Detalles del cambio:</strong>

          <ul
            style={{
              margin: '10px 0 0 18px',
              paddingRight: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {(!savedDraft?.data ||
              Object.keys(savedDraft.data).length === 0) && <li>Ninguno</li>}

            {savedDraft?.data && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {renderDiff(savedDraft.data)}
              </div>
            )}
          </ul>
        </div>

        {/* FOOTER FIXED */}
        <div
          style={{
            borderTop: '1px solid #e5e5e5',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: '#fafafa',
          }}
        >
          <button
            onClick={discardSavedDraft}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: '#d0d0d0',
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
