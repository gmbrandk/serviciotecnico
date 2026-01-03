import { createContext, useContext, useEffect, useState } from 'react';

import useIngresoAutosave from '../../hooks/form-ingreso/useIngresoAutosave.js';
import useIngresoDiff from '../../hooks/form-ingreso/useIngresoDiff';
import useIngresoInitialLoad from '../../hooks/form-ingreso/useIngresoInitialLoad.js';
import useIngresoLineas from '../../hooks/form-ingreso/useIngresoLineas';

import useDirtyNavigationGuard from '@hooks/navigation/useDirtyNavigationGuard';

import { useAuth } from '@context/AuthContext';

import { buildIngresoAutosaveKeyScoped } from '@utils/form-ingreso/autoSaveKey';

const IngresoFormContext = createContext(null);

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

  const { usuario } = useAuth();

  // 👇 UUID real de la OS (backend o payload)
  const ordenServicioUuid =
    initialPayload?.ordenServicioUuid ??
    initialPayload?.orden?.ordenServicioUuid ??
    null;

  //console.log('ordenServicioUuid', ordenServicioUuid);

  const autosaveKey = buildIngresoAutosaveKeyScoped({
    userId: usuario?._id,
    ordenServicioUuid,
  });

  //console.log('Key para Local Storage construido: ', autosaveKey);
  const {
    autosave,
    autosaveReady,
    persistEnabled,
    setPersistEnabled,
    loadAutosave,
    discardAutosave,
  } = useIngresoAutosave({
    key: autosaveKey,
    buildDiff,
    enabledInitial: true,
  });

  // ---------------------------------------------------------
  // 🔥 Estado de modal de recuperación
  // ---------------------------------------------------------
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [savedDraft, setSavedDraft] = useState(null);

  const isDirty = hasChanges() || !!loadAutosave();
  const [navigationAllowed, setNavigationAllowed] = useState(false);

  const { showExitDialog, stay, leaveKeepDraft, leaveDiscard } =
    useDirtyNavigationGuard({
      isDirty,
      onDiscard: discardAutosave,
      enabled: !navigationAllowed,
    });

  // ---------------------------------------------------------
  // 🔥 Detecta AUTOSAVE al montar
  // ---------------------------------------------------------
  // 🔥 Detecta AUTOSAVE al montar (solo si hay UUID real)
  useEffect(() => {
    if (!loaded || !ordenServicioUuid) return;

    const saved = loadAutosave();
    if (saved && saved.timestamp) {
      console.log('💾 AUTOSAVE DETECTADO →', saved);
      setSavedDraft(saved);
      setShowRestoreDialog(true);
    }
  }, [loaded, ordenServicioUuid, loadAutosave]);

  useEffect(() => {
    if (!autosaveKey) {
      console.warn('🟡 [Autosave] Sin UUID de OS → autosave deshabilitado');
      return;
    }

    console.log('🧩 [Autosave] Key activa:', autosaveKey);
  }, [autosaveKey]);

  useEffect(() => {
    if (!loaded || !autosaveReady || !autosaveKey) return;
    autosave();
  }, [loaded, autosaveReady, autosaveKey, cliente, equipo, tecnico, orden]);

  useEffect(() => {
    if (!loaded || !ordenServicioUuid) return;

    const saved = loadAutosave();
    if (saved && saved.timestamp) {
      setSavedDraft(saved);
      setShowRestoreDialog(true);
    }
  }, [loaded, ordenServicioUuid, loadAutosave]);

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

  useEffect(() => {
    console.log(
      '%c[CTX] cliente CAMBIÓ',
      'color:#4caf50;font-weight:bold',
      cliente
    );
  }, [cliente]);

  // ---------------------------------------------------------
  // Context value
  // ---------------------------------------------------------
  const contextValue = {
    // dominio existente
    cliente,
    equipo,
    tecnico,
    orden,

    setCliente,
    setEquipo,
    setTecnico,
    setOrden,

    addLinea,
    deleteLinea,
    updateLinea,
    resetLinea,
    makeLinea,
    resolveEstado,

    buildDiff,
    hasChanges,
    applyDiff,
    explainDiff,

    autosave,
    autosaveReady,
    discardAutosave,

    persistEnabled,
    setPersistEnabled,

    loaded,
    initialSource,
    originalRef,

    // navegación sucia
    showExitDialog,
    stay,
    leaveKeepDraft,
    leaveDiscard,

    // restore draft
    showRestoreDialog,
    savedDraft,
    restoreSavedDraft,
    discardSavedDraft,

    setNavigationAllowed,
  };

  return (
    <IngresoFormContext.Provider value={contextValue}>
      {children}
    </IngresoFormContext.Provider>
  );
}

export const useIngresoForm = () => useContext(IngresoFormContext);
export default IngresoFormProvider;
