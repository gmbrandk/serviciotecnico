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

  // === referencias originales y cálculo de estado/diff ===
  const originalLinea = originalRef.current?.orden?.lineas?.[data.uid] ?? null;

  // Log inicial de montaje: contexto de la línea
  console.debug(
    `[Linea ${index}] MOUNT → uid=${data.uid} isNew=${!!data.isNew}`,
    {
      dataSnapshot: {
        descripcion: data.descripcion,
        precioUnitario: data.precioUnitario,
        tipoTrabajo: data.tipoTrabajo
          ? data.tipoTrabajo._id ?? data.tipoTrabajo
          : null,
      },
      originalExists: !!originalLinea,
    }
  );

  const estado = resolveEstado(data, originalLinea);
  const diff = explainDiff(data, originalLinea);
  const isLineaNueva = !!data.isNew;

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

  // Local description state to allow edit without immediately mutating provider state
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
     - Si el provider actualiza description y el usuario no editó localmente,
       actualizamos el input local.
     ============================================ */
  useEffect(() => {
    if (!userEditedDescripcion && data.descripcion !== localDescripcion) {
      console.debug(
        `[Linea ${index}] SYNC DESCRIPCION → provider cambió descripcion`,
        { from: localDescripcion, to: data.descripcion }
      );
      setLocalDescripcion(data.descripcion ?? '');
    }
  }, [data.descripcion]);

  /* ============================================
     REGISTRAR PRECIO ORIGINAL (solo 1 vez o reset)
     - precioOriginalRef guarda la referencia original que se usa para badges
     ============================================ */
  useEffect(() => {
    const n = Number(data.precioUnitario);

    // Primer mount → fijar original solo una vez
    if (precioOriginalRef.current == null) {
      precioOriginalRef.current = Number.isNaN(n) ? null : n;
      console.debug(`[Linea ${index}] PRECIO ORIGINAL registrado`, {
        precioOriginal: precioOriginalRef.current,
      });
      return;
    }

    // Si hubo reset → actualizar referencia
    if (data._fromReset) {
      precioOriginalRef.current = Number.isNaN(n) ? null : n;
      console.info(`[Linea ${index}] PRECIO ORIGINAL actualizado por reset`, {
        precioOriginal: precioOriginalRef.current,
      });
    }
  }, [data.precioUnitario, data._fromReset]);

  /* ============================================
     SYNC tipoTrabajo con autocompletado
     - Cuando provider cambia data.tipoTrabajo directamente, intentamos
       reflejarlo en el query del autocomplete.
     ============================================ */
  useEffect(() => {
    const tt = data.tipoTrabajo;
    if (!tt) return;

    if (typeof tt === 'string') {
      if (tt !== query) {
        console.debug(
          `[Linea ${index}] SYNC tipoTrabajo (string) -> actualizando query`,
          { tt, oldQuery: query }
        );
        onQueryChange(tt);
      }
      return;
    }

    if (typeof tt === 'object') {
      if (!selectedTrabajo || selectedTrabajo._id !== tt._id) {
        console.debug(
          `[Linea ${index}] SYNC tipoTrabajo (object) -> actualizando query a nombre del tipoTrabajo`,
          {
            tipoTrabajoId: tt._id,
            tipoTrabajoNombre: tt.nombre,
          }
        );
        onQueryChange(tt.nombre ?? '');
      }
    }
  }, [data.tipoTrabajo]);

  /* ============================================
     CUANDO CAMBIA selectedTrabajo (resultado del autocomplete)
     - Decisiones: descripción final, precio final y cuándo aplicar patch
     ============================================ */
  useEffect(() => {
    if (!selectedTrabajo) return;

    // Log de entrada
    console.info(`[Linea ${index}] selectedTrabajo cambió`, {
      selectedTrabajoId: selectedTrabajo._id ?? null,
      isInitialSelection,
      precioModificado,
      userEditedDescripcion,
    });

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

    // Solo aplicar precio si NO fue modificado manual ni es selección inicial
    if (!precioModificado && !isInitialSelection) {
      patch.precioUnitario = precioFinal;
    }

    console.debug(`[Linea ${index}] Aplicando patch por selectedTrabajo`, {
      patch,
      estadoPrevio: { precioActual, precioOriginal },
    });

    // Propagar update: preferimos onChange del padre si existe
    onChange ? onChange(index, patch) : updateLinea(index, patch);

    // small log de confirmación
    console.debug(`[Linea ${index}] patch aplicado (selectedTrabajo)`, {
      index,
      uid: data.uid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrabajo]);

  /* ============================================
     HANDLERS UI: descripción y precio
     - Logs en cada acción del usuario
     ============================================ */

  const handleDescripcionChange = (e) => {
    const val = e.target.value;
    setUserEditedDescripcion(true);
    setLocalDescripcion(val);
    const patch = { descripcion: val };
    console.debug(`[Linea ${index}] INPUT descripcion -> usuario escribió`, {
      val,
    });
    onChange ? onChange(index, patch) : updateLinea(index, patch);
  };

  const handlePrecioChange = (e) => {
    const val = e.target.value;

    // caso borrar contenido -> valor vacío
    if (val === '') {
      console.debug(`[Linea ${index}] INPUT precio -> usuario borró el valor`);
      const patch = { precioUnitario: '' };
      onChange ? onChange(index, patch) : updateLinea(index, patch);
      return;
    }

    const num = Number(val);
    if (isNaN(num) || num < 0) {
      console.warn(`[Linea ${index}] INPUT precio -> valor inválido ignorado`, {
        raw: val,
      });
      return;
    }

    const patch = { precioUnitario: num };
    console.debug(`[Linea ${index}] INPUT precio -> nuevo número válido`, {
      num,
      precioOriginal,
      precioPrevio: precioActual,
    });
    onChange ? onChange(index, patch) : updateLinea(index, patch);
  };

  const handleDelete = () => {
    console.info(`[Linea ${index}] BOTON eliminar pulsado`, { uid: data.uid });
    onDelete ? onDelete(index) : deleteLinea(index);
  };

  const handleReset = () => {
    console.info(
      `[Linea ${index}] BOTON reset pulsado — solicitando reset al provider`,
      { uid: data.uid }
    );
    resetLinea(index);
  };

  // Log cada render relevante (puede filtrar por debug en consola)
  console.debug(
    `[Linea ${index}] RENDER → estado=${estado} isNew=${isLineaNueva}`,
    {
      diff,
      precioModificado,
      isInitialSelection,
      query,
      resultadosCount: resultados?.length ?? 0,
    }
  );

  return (
    <div
      className={`${lineaServicioStyles.lineaServicio} ${estadoClass}`}
      data-uid={data.uid}
    >
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
            onChange={(v) => {
              console.debug(
                `[Linea ${index}] SelectAutocomplete onChange(query)`,
                { query: v }
              );
              onQueryChange(v);
            }}
            resultados={resultados}
            isOpen={isOpen}
            onSelect={(t) => {
              console.info(
                `[Linea ${index}] SelectAutocomplete onSelect -> seleccionando tipoTrabajo`,
                { id: t?._id ?? null, nombre: t?.nombre }
              );
              seleccionarTrabajo(t);
            }}
            cerrarResultados={() => {
              console.debug(
                `[Linea ${index}] SelectAutocomplete cerrarResultados invoked`
              );
              cerrarResultados();
            }}
            abrirResultados={() => {
              console.debug(
                `[Linea ${index}] SelectAutocomplete abrirResultados invoked`
              );
              abrirResultados();
            }}
            inputName={`tipoTrabajo-${index}`}
            renderItem={(t) => (
              <>
                <div className="autocomplete-title">{t.nombre}</div>
                <div className="autocomplete-sub">
                  S/{t.precioBase} — {t.descripcion ?? ''}
                </div>
              </>
            )}
            isInitialSelection={isInitialSelection}
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
          onChange={handleDescripcionChange}
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
          onChange={handlePrecioChange}
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
          onClick={handleDelete}
          title="Eliminar línea"
        >
          🗑
        </button>

        <button
          type="button"
          className={lineaServicioStyles.buttonReset}
          onClick={handleReset}
          title="Resetear línea"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
