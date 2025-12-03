import {
  buttonsStyles,
  inputsStyles as inputLineaStyles,
  lineaServicioStyles,
} from '@styles/form-ingreso';

import { SelectAutocomplete } from '@components/form-ingreso/SelectAutocomplete.jsx';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { useAutocompleteTipoTrabajo } from '@hooks/form-ingreso/useAutocompleteTipoTrabajo';
import { useEffect, useMemo, useRef, useState } from 'react';

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

  const estadoClass =
    lineaServicioStyles[`estado${estado[0].toUpperCase() + estado.slice(1)}`] ||
    '';

  function isPrecioModificado(actual, original) {
    if (!original) return false;
    const a = Number(actual?.precioUnitario);
    const b = Number(original?.precioUnitario);
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

  /* ============================================
     SYNC DESCRIPCIÓN
     ============================================ */
  useEffect(() => {
    if (!userEditedDescripcion && data.descripcion !== localDescripcion) {
      setLocalDescripcion(data.descripcion ?? '');
    }
  }, [data.descripcion]);

  /* ============================================
     REGISTRAR PRECIO ORIGINAL (solo 1 vez o reset)
     ============================================ */
  useEffect(() => {
    const n = Number(data.precioUnitario);

    // Primero mount → fijar original solo una vez
    if (precioOriginalRef.current == null) {
      precioOriginalRef.current = Number.isNaN(n) ? null : n;
      return;
    }

    // Si hubo reset → actualizar referencia
    if (data._fromReset) {
      precioOriginalRef.current = Number.isNaN(n) ? null : n;
    }
  }, [data.precioUnitario, data._fromReset]);

  /* ============================================
     SYNC tipoTrabajo con autocompletado
     ============================================ */
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

  /* ============================================
     CUANDO CAMBIA selectedTrabajo
     ============================================ */
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

    const patch = {
      tipoTrabajo: selectedTrabajo,
      descripcion: descripcionFinal,
    };

    // solo aplicar precio si NO fue modificado manual
    if (!precioModificado && !isInitialSelection) {
      patch.precioUnitario = precioFinal;
    }

    onChange?.(index, patch) ?? updateLinea(index, patch);
  }, [selectedTrabajo]);

  return (
    <div className={`${lineaServicioStyles.lineaServicio} ${estadoClass}`}>
      {/* Tipo de trabajo */}
      <div className={lineaServicioStyles.col}>
        <div className={lineaServicioStyles.tipoTrabajoWrapper}>
          <div className={lineaServicioStyles.labelLine}>
            <label className={inputLineaStyles.inputLabel}>
              Tipo de trabajo
            </label>

            {isLineaNueva && (
              <span
                className={`${lineaServicioStyles.badgeCampo} ${lineaServicioStyles.badgeNew}`}
              >
                Nueva
              </span>
            )}

            {!isLineaNueva &&
              diff.tipoTrabajo &&
              diff.tipoTrabajo.from?.nombre !== diff.tipoTrabajo.to?.nombre && (
                <span
                  className={`${lineaServicioStyles.badgeCampo} ${lineaServicioStyles.badgeModified}`}
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
      </div>

      {/* Descripción */}
      <div className={lineaServicioStyles.col}>
        <div className={lineaServicioStyles.labelLine}>
          <label className={inputLineaStyles.inputLabel}>Descripción</label>

          {isLineaNueva && (
            <span
              className={`${lineaServicioStyles.badgeCampo} ${lineaServicioStyles.badgeNew}`}
            >
              Nueva
            </span>
          )}

          {!isLineaNueva &&
            diff.descripcion &&
            diff.descripcion.from !== diff.descripcion.to && (
              <span
                className={`${lineaServicioStyles.badgeCampo} ${lineaServicioStyles.badgeModified}`}
              >
                Cambiada
              </span>
            )}
        </div>

        <input
          type="text"
          className={inputLineaStyles.inputField}
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
      <div
        className={`${lineaServicioStyles.col} ${lineaServicioStyles.precioCol}`}
      >
        <div className={lineaServicioStyles.labelLine}>
          <label className={inputLineaStyles.inputLabel}>Precio</label>

          {isLineaNueva && (
            <span
              className={`${lineaServicioStyles.badgeCampo} ${lineaServicioStyles.badgeNew}`}
            >
              Nueva
            </span>
          )}

          {!isLineaNueva && precioModificado && (
            <span
              className={`${lineaServicioStyles.badgeCampo} ${lineaServicioStyles.badgeModified}`}
            >
              Modificado
            </span>
          )}
        </div>

        <input
          type="number"
          className={`${inputLineaStyles.inputField} ${
            precioModificado ? lineaServicioStyles.precioModificado : ''
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
        className={[lineaServicioStyles.col, buttonsStyles.actions]}
        style={{ width: '70px', display: 'flex', gap: '4px' }}
      >
        <button
          type="button"
          className={lineaServicioStyles.buttonDelete}
          onClick={() => (onDelete ? onDelete(index) : deleteLinea(index))}
        >
          🗑
        </button>

        <button
          type="button"
          className={lineaServicioStyles.buttonReset}
          onClick={() => resetLinea(index)}
        >
          ↺
        </button>
      </div>
    </div>
  );
}
