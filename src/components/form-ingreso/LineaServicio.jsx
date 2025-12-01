// ============================================================
// LineaServicio – versión con badges por campo y manejo isNew
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { useAutocompleteTipoTrabajo } from '@hooks/form-ingreso/useAutocompleteTipoTrabajo';
import { SelectAutocomplete } from '@components/form-ingreso/SelectAutocomplete.jsx';

export function LineaServicio({ index, data = {}, onDelete, onChange }) {
  const {
    updateLinea,
    deleteLinea,
    resetLinea,
    originalRef,
    resolveEstado,
    explainDiff,
  } = useIngresoForm();

  const originalLinea = originalRef.current?.orden?.lineas?.[data.uid] ?? null;
  const estado = resolveEstado(data, originalLinea);
  const diff = explainDiff(data, originalLinea);

  const isLineaNueva = data.isNew;

  function isPrecioModificado(lineaActual, lineaOriginal) {
    if (!lineaOriginal) return false;
    const a = Number(lineaActual?.precioUnitario);
    const b = Number(lineaOriginal?.precioUnitario);
    return !Number.isNaN(a) && !Number.isNaN(b) && a !== b;
  }

  const initialTrabajo = useMemo(() => {
    const tt = data.tipoTrabajo;
    if (!tt) return '';
    if (typeof tt === 'object') return tt;
    if (typeof tt === 'string') return { _id: tt };
    return '';
  }, [data.tipoTrabajo]);

  const {
    query,
    resultados,
    isOpen,
    selectedTrabajo,
    isInitialSelection,
    onChange: onQueryChange,
    abrirResultados,
    cerrarResultados,
    seleccionarTrabajo,
  } = useAutocompleteTipoTrabajo(initialTrabajo);

  const [localDescripcion, setLocalDescripcion] = useState(
    data.descripcion ?? ''
  );
  const [userEditedDescripcion, setUserEditedDescripcion] = useState(false);
  const precioOriginalRef = useRef(null);

  const precioActual = data.precioUnitario ?? '';
  const precioOriginal = precioOriginalRef.current;
  const precioModificado = isPrecioModificado(data, originalLinea);

  // ------------------------------------------
  // Sincronización descripción
  // ------------------------------------------
  useEffect(() => {
    if (!userEditedDescripcion && data.descripcion !== localDescripcion) {
      setLocalDescripcion(data.descripcion ?? '');
    }
  }, [data.descripcion]);

  // ------------------------------------------
  // Inicialización precio original
  // ------------------------------------------
  useEffect(() => {
    const n = Number(data.precioUnitario);
    if (data._fromReset || precioOriginalRef.current == null) {
      precioOriginalRef.current = Number.isNaN(n) ? null : n;
    }
  }, [data.precioUnitario, data._fromReset]);

  // ------------------------------------------
  // Sincronización tipoTrabajo externo → local query
  // ------------------------------------------
  useEffect(() => {
    const tt = data.tipoTrabajo;
    if (!tt) return;
    if (typeof tt === 'string') {
      if (tt !== query) onQueryChange(tt);
      return;
    }
    if (typeof tt === 'object') {
      if (!selectedTrabajo || selectedTrabajo._id !== tt._id) {
        onQueryChange(tt.nombre ?? '');
      }
    }
  }, [data.tipoTrabajo]);

  // ------------------------------------------
  // Cuando seleccionamos tipoTrabajo
  // ------------------------------------------
  useEffect(() => {
    if (!selectedTrabajo) return;

    const descripcionFinal = isInitialSelection
      ? data.descripcion ?? selectedTrabajo.descripcion ?? ''
      : !userEditedDescripcion && selectedTrabajo.descripcion
      ? selectedTrabajo.descripcion.trim()
      : localDescripcion;

    const precioFinal = isInitialSelection
      ? Number(data.precioUnitario)
      : Number(selectedTrabajo.precioBase);

    if (precioOriginalRef.current == null) {
      const ori = isInitialSelection
        ? Number(data.precioUnitario)
        : Number(selectedTrabajo.precioBase);
      precioOriginalRef.current = Number.isNaN(ori) ? null : ori;
    }

    const patch = {
      tipoTrabajo: selectedTrabajo,
      descripcion: descripcionFinal,
    };
    if (!isInitialSelection && !precioModificado) {
      patch.precioUnitario = precioFinal;
    }

    onChange?.(index, patch) ?? updateLinea(index, patch);
  }, [selectedTrabajo]);

  // ============================================================
  // Render + Badges por campo
  // ============================================================
  return (
    <div className={`row linea-servicio estado-${estado}`}>
      {/* Tipo trabajo */}
      <div className="col tipoTrabajo-wrapper">
        <div className="label-line">
          <label>Tipo de trabajo</label>
          {isLineaNueva && <span className="badge-campo badge-new">Nueva</span>}
          {!isLineaNueva &&
            diff.tipoTrabajo &&
            diff.tipoTrabajo.from?.nombre !== diff.tipoTrabajo.to?.nombre && (
              <span
                className="badge-campo badge-modified"
                title={`from: ${diff.tipoTrabajo?.from?.nombre ?? ''} → to: ${
                  diff.tipoTrabajo?.to?.nombre ?? ''
                }`}
              >
                Cambiado
              </span>
            )}
        </div>
        <SelectAutocomplete
          placeholder="Buscar tipo de trabajo..."
          query={query}
          onChange={onQueryChange}
          resultados={resultados}
          isOpen={isOpen}
          onSelect={seleccionarTrabajo}
          cerrarResultados={cerrarResultados}
          abrirResultados={abrirResultados}
          inputName={`tipoTrabajo-${index}`}
          renderItem={(t) => (
            <>
              <div className="autocomplete-title">{t.nombre}</div>
              <div className="autocomplete-sub">
                S/{t.precioBase} — {t.descripcion ?? ''}
              </div>
            </>
          )}
        />
      </div>

      {/* Descripción */}
      <div className="col">
        <div className="label-line">
          <label>Descripción</label>
          {isLineaNueva && <span className="badge-campo badge-new">Nueva</span>}
          {!isLineaNueva &&
            diff.descripcion &&
            diff.descripcion.from !== diff.descripcion.to && (
              <span
                className="badge-campo badge-modified"
                title={`from: ${diff.descripcion?.from ?? ''} → to: ${
                  diff.descripcion?.to ?? ''
                }`}
              >
                Cambiada
              </span>
            )}
        </div>
        <input
          type="text"
          className="input-field"
          value={localDescripcion}
          onChange={(e) => {
            const val = e.target.value;
            setUserEditedDescripcion(true);
            setLocalDescripcion(val);
            const patch = { descripcion: val };
            onChange?.(index, patch) ?? updateLinea(index, patch);
          }}
        />
      </div>

      {/* Precio */}
      <div className="col precio-col">
        <div className="label-line">
          <label>Precio</label>
          {isLineaNueva && <span className="badge-campo badge-new">Nueva</span>}
          {!isLineaNueva &&
            precioModificado &&
            precioOriginal !== precioActual && (
              <span
                className="badge-campo badge-modified"
                title={`from: ${precioOriginal ?? ''} → to: ${
                  precioActual ?? ''
                }`}
              >
                Modificado
              </span>
            )}
        </div>
        <input
          type="number"
          className={`input-field ${
            precioModificado ? 'precio-modificado' : ''
          }`}
          value={precioActual ?? ''}
          min="0"
          step="0.1"
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
              const patch = { precioUnitario: '' };
              onChange?.(index, patch) ?? updateLinea(index, patch);
              return;
            }
            const num = Number(val);
            if (isNaN(num) || num < 0) return;
            const patch = { precioUnitario: num };
            onChange?.(index, patch) ?? updateLinea(index, patch);
          }}
        />
      </div>

      {/* Botones */}
      <div
        className="col"
        style={{ width: '70px', display: 'flex', gap: '4px' }}
      >
        <button
          type="button"
          className="button-delete"
          onClick={() => (onDelete ? onDelete(index) : deleteLinea(index))}
        >
          🗑
        </button>
        <button
          type="button"
          className="button-reset"
          onClick={() => resetLinea(index)}
        >
          ↺
        </button>
      </div>
    </div>
  );
}
