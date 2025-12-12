// src/components/form-ingreso/OrdenServicio.jsx
import { Autocomplete } from '@components/form-ingreso/Autocomplete';
import Collapsible from '@components/form-ingreso/Collapsible';
import { LineaServicio } from '@components/form-ingreso/LineaServicio';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { useAutocompleteTecnico } from '@hooks/form-ingreso/useAutocompleteTecnico';

// LOG mejorado: incluye timestamp + sección + payload
import { log } from '@utils/form-ingreso/log';

import { ROLES_PERMITIDOS_EDITAR_TECNICO } from '@utils/form-ingreso/roles';
import { useEffect, useRef } from 'react';

// ⭐ ESTILOS
import {
  buttonsStyles,
  inputsStyles as ordenServicioStyles,
} from '@styles/form-ingreso';

import SelfCheckLineaServicio from '../../debug/SelfCheckLineaServicio';

export function OrdenServicio({ role }) {
  // Render counter para detectar renders innecesarios
  const renderCount = useRef(0);
  renderCount.current++;

  // =======================================
  // LOG: Render + Props
  // =======================================
  log('UI:ORDEN', 'Render', {
    renderCount: renderCount.current,
    role,
  });

  const {
    tecnico,
    setTecnico,
    orden,
    setOrden,
    addLinea,
    deleteLinea,
    updateLinea,
  } = useIngresoForm();

  // LOG: Estado actual del formulario
  log('UI:ORDEN', 'Context snapshot', {
    tecnico,
    orden,
    lineasServicioCount: orden.lineasServicio?.length,
  });

  const readOnlyTecnico = role !== 'superadministrador';

  // =======================================
  // AUTOCOMPLETE HOOK
  // =======================================
  const {
    query,
    resultados,
    isOpen,
    onQueryChange,
    abrirResultados,
    cerrarResultados,
    seleccionarTecnico,
    selectedTecnico,
  } = useAutocompleteTecnico(tecnico);

  // LOG del estado del autocompletado
  log('UI:ORDEN', 'Autocomplete state', {
    query,
    resultadosCount: resultados?.length,
    isOpen,
    selectedTecnico,
    isReadOnly: readOnlyTecnico,
  });

  // =======================================
  // SYNC inicial → si el provider da un técnico distinto
  // =======================================
  useEffect(() => {
    if (tecnico && tecnico._id && selectedTecnico?._id !== tecnico._id) {
      log('UI:ORDEN', 'Sync técnico desde context → seleccionarTecnico()', {
        tecnicoContext: tecnico,
        selectedTecnico,
      });
      seleccionarTecnico(tecnico);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tecnico]);

  // =======================================
  // SYNC hacia provider
  // =======================================
  useEffect(() => {
    if (selectedTecnico && selectedTecnico._id) {
      log('UI:TECNICO', 'Sync hacia IngresoFormContext', {
        selectedTecnico,
      });
      setTecnico(selectedTecnico);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTecnico]);

  // =======================================
  // LÍNEAS DE SERVICIO
  // =======================================
  const agregarLinea = () => {
    log('UI:ORDEN', 'addLinea() llamado');
    addLinea();
  };

  const eliminarLinea = (i) => {
    log('UI:ORDEN', 'deleteLinea() llamado', { index: i });
    deleteLinea(i);
  };

  const actualizarLinea = (i, patch) => {
    log('UI:ORDEN', 'updateLinea() llamado', {
      index: i,
      patchType: typeof patch,
    });

    updateLinea(
      i,
      typeof patch === 'function'
        ? (prev) => {
            const out = patch(prev);
            log('UI:ORDEN', 'updateLinea() → función produce', {
              prev,
              out,
            });
            return out;
          }
        : (prev) => {
            const out = { ...prev, ...patch };
            log('UI:ORDEN', 'updateLinea() → objeto produce', {
              prev,
              patch,
              out,
            });
            return out;
          }
    );
  };

  const handleOrdenChange = (field, value) => {
    log('UI:ORDEN', 'Campo general modificado', { field, value });
    setOrden((prev) => {
      const out = { ...prev, [field]: value };
      log('UI:ORDEN', 'setOrden() → nuevo estado', { prev, out });
      return out;
    });
  };

  // =======================================
  // RENDER
  // =======================================
  return (
    <>
      {/* PERMISOS */}
      <div className="row">
        {!ROLES_PERMITIDOS_EDITAR_TECNICO.includes(role) && (
          <div className="alert-info" style={{ marginBottom: 10 }}>
            Tu rol no permite modificar el técnico asignado.
          </div>
        )}
      </div>

      {/* AUTOCOMPLETE TÉCNICO */}
      <div className="row">
        <Autocomplete
          disabled={readOnlyTecnico}
          label="Técnico"
          placeholder="Buscar técnico…"
          inputName="tecnico"
          query={query}
          onChange={
            readOnlyTecnico
              ? undefined
              : (v) => {
                  log('UI:ORDEN', 'Autocomplete onChange()', { value: v });
                  onQueryChange(v);
                }
          }
          resultados={resultados}
          isOpen={isOpen}
          onSelect={
            readOnlyTecnico
              ? undefined
              : (t) => {
                  log('UI:ORDEN', 'Autocomplete onSelect()', { item: t });
                  seleccionarTecnico(t);
                }
          }
          abrirResultados={
            readOnlyTecnico
              ? undefined
              : () => {
                  log('UI:ORDEN', 'Autocomplete abrirResultados()');
                  abrirResultados();
                }
          }
          cerrarResultados={() => {
            log('UI:ORDEN', 'Autocomplete cerrarResultados()');
            cerrarResultados();
          }}
          renderItem={(t) => (
            <>
              <strong>{t.nombreCompleto}</strong>
              <br />
              {t.email && <small>{t.email}</small>} —{' '}
              {t.role && <small>{t.role}</small>}
            </>
          )}
        />

        <div className="col">
          <label className={ordenServicioStyles.inputLabel}>Email</label>
          <input
            value={selectedTecnico?.email || ''}
            readOnly
            className={ordenServicioStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={ordenServicioStyles.inputLabel}>Teléfono</label>
          <input
            value={selectedTecnico?.telefono || ''}
            readOnly
            className={ordenServicioStyles.inputField}
          />
        </div>
      </div>

      {/* LÍNEAS DE SERVICIO */}
      <Collapsible
        title="Líneas de servicio"
        main={false}
        mode="lineaServicio"
        initMode={orden.lineasServicio.length > 0 ? 'expanded' : 'collapsed'}
      >
        {orden.lineasServicio.map((linea, i) => (
          <>
            <LineaServicio
              key={linea.uid}
              index={i}
              data={linea}
              onDelete={(idx) => {
                log('UI:ORDEN', 'LineaServicio → onDelete()', { idx });
                eliminarLinea(idx);
              }}
              onChange={(idx, patch) => {
                log('UI:ORDEN', 'LineaServicio → onChange()', {
                  idx,
                  patch,
                });
                actualizarLinea(idx, patch);
              }}
            />
            <SelfCheckLineaServicio index={i} linea={linea} />
          </>
        ))}

        <button
          type="button"
          className={buttonsStyles.button}
          onClick={agregarLinea}
        >
          + Agregar línea
        </button>
      </Collapsible>

      {/* CAMPOS GENERALES */}
      <div className="col" style={{ marginTop: 15 }}>
        <label className={ordenServicioStyles.inputLabel}>
          Diagnóstico del cliente
        </label>
        <textarea
          value={orden.diagnosticoCliente || ''}
          onChange={(e) =>
            handleOrdenChange('diagnosticoCliente', e.target.value)
          }
          className={ordenServicioStyles.textareaField}
        />
      </div>

      <div className="col" style={{ marginTop: 10 }}>
        <label className={ordenServicioStyles.inputLabel}>Observaciones</label>
        <textarea
          value={orden.observaciones || ''}
          onChange={(e) => handleOrdenChange('observaciones', e.target.value)}
          className={ordenServicioStyles.textareaField}
        />
      </div>
    </>
  );
}

export default OrdenServicio;
