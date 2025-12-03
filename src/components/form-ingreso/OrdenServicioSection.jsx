// src/components/form-ingreso/OrdenServicio.jsx
import { Autocomplete } from '@components/form-ingreso/Autocomplete';
import Collapsible from '@components/form-ingreso/Collapsible';
import { LineaServicio } from '@components/form-ingreso/LineaServicio';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { useAutocompleteTecnico } from '@hooks/form-ingreso/useAutocompleteTecnico';
import { log } from '@utils/form-ingreso/log';
import { ROLES_PERMITIDOS_EDITAR_TECNICO } from '@utils/form-ingreso/roles';
import { useEffect } from 'react';

// ⭐ ESTILOS (alias como pediste)
import {
  buttonsStyles,
  inputsStyles as ordenServicioStyles,
} from '@styles/form-ingreso';

export function OrdenServicio({ role }) {
  const {
    tecnico,
    setTecnico,
    orden,
    setOrden,
    addLinea,
    deleteLinea,
    updateLinea,
  } = useIngresoForm();

  const readOnlyTecnico = role !== 'superadministrador';

  // AUTOCOMPLETE
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

  // SYNC hacia contexto
  useEffect(() => {
    if (selectedTecnico && selectedTecnico._id) {
      log('UI:TECNICO', 'Sync hacia IngresoFormContext', selectedTecnico);
      setTecnico(selectedTecnico);
    }
  }, [selectedTecnico]);

  // LÍNEAS
  const agregarLinea = () => addLinea();
  const eliminarLinea = (i) => deleteLinea(i);
  const actualizarLinea = (i, patch) =>
    updateLinea(
      i,
      typeof patch === 'function' ? patch : (prev) => ({ ...prev, ...patch })
    );

  const handleOrdenChange = (field, value) =>
    setOrden((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      {/* AVISO PERMISOS */}
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
          onChange={readOnlyTecnico ? undefined : onQueryChange}
          resultados={resultados}
          isOpen={isOpen}
          onSelect={readOnlyTecnico ? undefined : seleccionarTecnico}
          abrirResultados={readOnlyTecnico ? undefined : abrirResultados}
          cerrarResultados={cerrarResultados}
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
          <LineaServicio
            key={linea.uid}
            index={i}
            data={linea}
            onDelete={eliminarLinea}
            onChange={actualizarLinea}
          />
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
