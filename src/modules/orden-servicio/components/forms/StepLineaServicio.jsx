// src/components/forms/StepLineaServicio.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useStepWizard } from '../../context/StepWizardContext';
import { createLineaServicio } from '../../domain/createLineaServicio';
import { buildLineaServicioFields } from '../../forms/lineaServicioFormSchema';
import { useTiposTrabajo } from '../../hooks/useTiposTrabajo';
import { SchemaForm } from './SchemaForm'; // 🚫 FallbackPanel eliminado

export function StepLineaServicio({ index }) {
  const { goPrev, goNext } = useStepWizard();
  const {
    orden,
    handleChangeLinea,
    handleAgregarLinea,
    handleRemoveLinea,
    isLineaBloqueada,
    bloquearLinea,
  } = useOrdenServicioContext();

  const { tiposTrabajo, loading, error, refetch } = useTiposTrabajo();

  const linea = orden.lineas?.[index] || createLineaServicio();
  const safeLinea = { tipo: 'servicio', ...linea };

  const esUltimaLinea = index === orden.lineas.length - 1;
  const bloqueado =
    index < orden.lineas.length - 1 ? true : isLineaBloqueada(index);

  const [pendingNext, setPendingNext] = useState(false);

  useEffect(() => {
    console.groupCollapsed(
      `%c[StepLineaServicio index=${index}]`,
      'color:#8e44ad;font-weight:bold'
    );
    console.log('🧩 Línea actual:', safeLinea);
    console.log('📊 Total líneas:', orden.lineas.length);
    console.log('🧩 Es última línea:', esUltimaLinea);
    console.log('🔒 Bloqueado:', bloqueado);
    console.groupEnd();
  }, [bloqueado, safeLinea, index, esUltimaLinea, orden.lineas.length]);

  // 🧩 Cambio de campos
  const handleFieldChange = useCallback(
    (field, value) => {
      if (field === 'tipo') {
        handleChangeLinea(index, 'tipoTrabajo', '');
      }
      handleChangeLinea(index, field, value);
    },
    [index, handleChangeLinea]
  );

  // ➕ Agregar nueva línea con flag pendingNext
  const handleAddLinea = useCallback(() => {
    console.log(`[StepLineaServicio index=${index}] ➕ handleAddLinea()`);

    if (bloqueado) {
      console.warn(`[StepLineaServicio index=${index}] 🚫 Línea bloqueada`);
      return;
    }

    if (!linea.tipoTrabajo) {
      alert('⚠️ Debes seleccionar un tipo de trabajo antes de continuar.');
      return;
    }

    console.log(`[StepLineaServicio index=${index}] 🧩 Creando nueva línea...`);

    try {
      handleAgregarLinea(() => {
        bloquearLinea(index, true);
        console.log(
          `[StepLineaServicio index=${index}] ✅ Línea agregada → pendingNext = true`
        );
        setPendingNext(true);
      });
    } catch (err) {
      console.error(
        `[StepLineaServicio index=${index}] ❌ Error al agregar línea:`,
        err
      );
    }
  }, [index, bloqueado, linea.tipoTrabajo, handleAgregarLinea, bloquearLinea]);

  // 🚀 Efecto: cuando el wizard ya tiene la nueva línea, avanzar
  useEffect(() => {
    if (pendingNext && orden.lineas.length > index + 1) {
      console.log(
        `[StepLineaServicio index=${index}] 🚀 Wizard sincronizado, ejecutando goNext()`
      );
      goNext();
      setPendingNext(false);
    }
  }, [pendingNext, orden.lineas.length, index, goNext]);

  // 🗑️ Eliminar línea
  const handleDeleteLinea = useCallback(async () => {
    goPrev();
    await new Promise((r) => setTimeout(r, 650));
    handleRemoveLinea(index);
  }, [index, goPrev, handleRemoveLinea]);

  const isFallback = loading || error;
  const fallbackMessage = error
    ? '⚠️ Error de conexión con el backend'
    : '⏳ Cargando tipos de trabajo...';

  const fields = useMemo(
    () =>
      buildLineaServicioFields({
        linea,
        tiposTrabajo,
        isFallback,
        fallbackMessage,
      }),
    [linea, tiposTrabajo, isFallback, fallbackMessage]
  );

  const gridTemplate = useMemo(
    () => (safeLinea.tipo === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
    [safeLinea.tipo]
  );

  const actionButtonStyle = {
    width: '100px',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    padding: '10px',
    margin: '10px 5px',
    fontSize: '14px',
    fontFamily: 'montserrat, arial, verdana',
    transition: 'box-shadow 0.2s ease-in-out',
  };

  console.log(
    `[Render StepLineaServicio index=${index}] bloqueado=${bloqueado} tipo=${
      safeLinea.tipo || 'N/A'
    } pendingNext=${pendingNext}`
  );

  if (!linea) {
    return (
      <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
        (Esta línea fue eliminada)
      </p>
    );
  }

  return (
    <div>
      <SchemaForm
        key={index}
        values={safeLinea}
        onChange={handleFieldChange}
        fields={fields}
        showDescriptions={false}
        gridTemplateColumns={gridTemplate}
        error={error}
        isFallback={isFallback}
        fallbackMessage={fallbackMessage}
        onRetry={refetch}
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleAddLinea}
          disabled={bloqueado}
          style={{
            ...actionButtonStyle,
            background: bloqueado ? '#95a5a6' : '#2980b9',
            cursor: bloqueado ? 'not-allowed' : 'pointer',
          }}
        >
          ➕ Agregar línea
        </button>

        <button
          type="button"
          onClick={handleDeleteLinea}
          style={{
            ...actionButtonStyle,
            background: '#c0392b',
            cursor: 'pointer',
          }}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}
