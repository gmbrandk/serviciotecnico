import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useStepWizard } from '../../context/StepWizardContext';
import { createLineaServicio } from '../../domain/createLineaServicio';
import { buildOrdenServicioFields } from '../../forms/ordenServicioFormSchema';
import { useOrdenServicioForm } from '../../hooks/useOrdenServicioForm';
import { useTiposTrabajo } from '../../hooks/useTiposTrabajo';
import { SchemaForm } from './SchemaForm';

export function StepOrdenServicio() {
  const {
    orden,
    handleChangeLinea,
    handleAgregarLinea,
    bloquearLinea,
    isLineaBloqueada,
    handleChangeOrden,
  } = useOrdenServicioContext();

  const { goNext } = useStepWizard();
  const { tiposTrabajo, loading, error, refetch } = useTiposTrabajo();

  const linea = orden.lineas?.[0] || createLineaServicio();
  const form = useOrdenServicioForm({ linea, handleChangeLinea });
  const bloqueado = isLineaBloqueada(0);

  const [isHover, setIsHover] = useState(false);
  const [pendingNext, setPendingNext] = useState(false); // 🚀 flag controlada

  // 🧠 Diagnóstico
  useEffect(() => {
    if (!window.DEBUG_WIZARD) return;
    console.groupCollapsed(
      '%c[DIAG 🧩 StepOrdenServicio]',
      'color:#2980b9;font-weight:bold'
    );
    console.log('🧾 Orden actual:', orden);
    console.log('🔢 Total líneas:', orden.lineas?.length);
    console.log('🔒 Bloqueado:', bloqueado);
    console.log('🚦 Tipo trabajo:', linea.tipoTrabajo);
    console.groupEnd();
  }, [orden, bloqueado, linea.tipoTrabajo]);

  // ➕ Acción principal con flag pendiente
  const handleAddLinea = useCallback(() => {
    console.log('[StepOrdenServicio] ➕ handleAddLinea()');

    if (bloqueado) {
      console.warn(
        '[StepOrdenServicio] 🚫 Línea bloqueada, no se puede agregar'
      );
      return;
    }

    if (!linea.tipoTrabajo) {
      alert('⚠️ Debes seleccionar un tipo de trabajo antes de continuar.');
      return;
    }

    console.log('[StepOrdenServicio] 🧩 Iniciando creación de nueva línea...');

    try {
      handleAgregarLinea(() => {
        bloquearLinea(0, true);
        console.log(
          '[StepOrdenServicio] ✅ Nueva línea agregada, pendingNext = true'
        );
        setPendingNext(true);
      });
    } catch (err) {
      console.error('[StepOrdenServicio] ❌ Error al agregar línea:', err);
    }
  }, [bloqueado, linea.tipoTrabajo, handleAgregarLinea, bloquearLinea]);

  // 🚀 Avanzar automáticamente cuando el wizard ya tenga el nuevo step
  useEffect(() => {
    if (pendingNext && orden.lineas.length > 1) {
      console.log(
        '[StepOrdenServicio] 🚀 Wizard sincronizado, ejecutando goNext()'
      );
      goNext();
      setPendingNext(false);
    }
  }, [pendingNext, orden.lineas.length, goNext]);

  // ⚙️ Estados derivados
  const isFallback = loading;
  const isNetworkError =
    error?.message?.includes('Network') || error?.status === 404;

  // 🧩 Campos del formulario
  const fields = useMemo(
    () => buildOrdenServicioFields({ linea, tiposTrabajo }),
    [linea, tiposTrabajo]
  );

  // 💅 Estilos
  const actionButtonStyle = {
    width: '180px',
    background: bloqueado ? '#95a5a6' : '#2980b9',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    cursor: bloqueado ? 'not-allowed' : 'pointer',
    padding: '10px',
    margin: '10px 5px',
    fontSize: '14px',
    fontFamily: 'montserrat, arial, verdana',
    transition: 'box-shadow 0.2s ease-in-out',
  };

  const actionButtonHover = {
    boxShadow: '0 0 0 2px white, 0 0 0 3px #2980b9',
  };

  // 🚨 Error de red
  if (isNetworkError) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: '#b00',
          padding: '2rem',
          border: '1px solid #fcc',
          borderRadius: '6px',
          background: '#fff8f8',
        }}
      >
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          🚨 No se pudo conectar con el servidor o no hay conexión a internet.
        </p>
        <button
          onClick={refetch}
          style={{
            background: '#c0392b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 18px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          🔄 Reintentar
        </button>
      </div>
    );
  }

  // ✅ Render principal
  console.log('[StepOrdenServicio] Render', {
    bloqueado,
    lineas: orden.lineas?.length,
    tipoTrabajo: linea.tipoTrabajo,
    pendingNext,
  });

  return (
    <div>
      <SchemaForm
        values={{
          ...linea,
          diagnosticoCliente: orden.diagnosticoCliente,
          observaciones: orden.observaciones,
        }}
        onChange={(field, value) => {
          if (field === 'diagnosticoCliente' || field === 'observaciones') {
            handleChangeOrden(field, value);
          } else {
            form.handleChangeLinea(0, field, value);
          }
        }}
        fields={fields}
        gridTemplateColumns={form.gridTemplate}
        isFallback={isFallback}
        error={!!error}
        fallbackMessage={
          isFallback
            ? '⏳ Cargando datos del formulario...'
            : error
            ? '⚠️ Error al obtener datos'
            : ''
        }
        onRetry={refetch}
      />

      {!isFallback && !isNetworkError && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleAddLinea}
            disabled={bloqueado}
            onMouseEnter={() => !bloqueado && setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            style={{
              ...actionButtonStyle,
              ...(isHover && !bloqueado ? actionButtonHover : {}),
            }}
          >
            ➕ Agregar línea de servicio
          </button>
        </div>
      )}
    </div>
  );
}
