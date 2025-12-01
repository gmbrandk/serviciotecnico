import { useEffect } from 'react';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { useAutocompleteTecnico } from '@hooks/form-ingreso/useAutocompleteTecnico';
import { log } from '@utils/form-ingreso/log';
import { ROLES_PERMITIDOS_EDITAR_TECNICO } from '@utils/form-ingreso/roles';
import { Autocomplete } from '@components/form-ingreso/Autocomplete';
import Collapsible from '@components/form-ingreso/Collapsible';
import { LineaServicio } from '@components/form-ingreso/LineaServicio';

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

  const readOnlyTecnico = role !== 'superadministrador'; // 🔒 PERMISO
  // ============================
  // AUTOCOMPLETE TÉCNICO
  // ============================
  const {
    query,
    resultados,
    isOpen,
    onQueryChange,
    abrirResultados,
    cerrarResultados,
    seleccionarTecnico,
    selectedTecnico, // ← FALTABA
  } = useAutocompleteTecnico(tecnico);

  // ============================
  // SYNC: Autocomplete → Context
  // ============================
  useEffect(() => {
    if (selectedTecnico && selectedTecnico._id) {
      log('UI:TECNICO', 'Sync hacia IngresoFormContext', selectedTecnico);
      setTecnico(selectedTecnico);
    }
  }, [selectedTecnico]);

  useEffect(() => {
    if (readOnlyTecnico) return; // 🔒 blindaje lógico

    if (selectedTecnico && selectedTecnico._id) {
      log('UI:TECNICO', 'Sync hacia IngresoFormContext', selectedTecnico);
      setTecnico(selectedTecnico);
    }
  }, [selectedTecnico]);

  // ============================
  // LÍNEAS
  // ============================
  const agregarLinea = () => addLinea();

  const eliminarLinea = (i) => deleteLinea(i);

  const actualizarLinea = (i, patch) => {
    updateLinea(
      i,
      typeof patch === 'function'
        ? patch
        : (prev) => ({
            ...prev,
            ...patch,
          })
    );
  };

  const handleOrdenChange = (field, value) =>
    setOrden((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      {/* TÉCNICO */}
      <div className="row">
        {!ROLES_PERMITIDOS_EDITAR_TECNICO.includes(role) && (
          <div className="alert-info" style={{ marginBottom: 10 }}>
            Tu rol no permite modificar el técnico asignado.
          </div>
        )}
      </div>

      <div className="row">
        <Autocomplete
          disabled={readOnlyTecnico} // 🟡 UI bloqueada
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
              {t.email && <small>{t.email}</small>} —
              {t.role && <small>{t.role}</small>}
            </>
          )}
        />

        <div className="col">
          <label>Email</label>
          <input
            value={selectedTecnico?.email || ''}
            readOnly
            className="input-field"
          />
        </div>

        <div className="col">
          <label>Teléfono</label>
          <input
            value={selectedTecnico?.telefono || ''}
            readOnly
            className="input-field"
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
            key={linea.uid} // ← YA NO SE ROMPE EL ESTADO
            index={i}
            data={linea}
            onDelete={eliminarLinea}
            onChange={actualizarLinea}
          />
        ))}

        <button type="button" className="button-add" onClick={agregarLinea}>
          + Agregar línea
        </button>
      </Collapsible>

      {/* CAMPOS GENERALES */}
      <div className="col" style={{ marginTop: 15 }}>
        <label>Diagnóstico del cliente</label>
        <textarea
          value={orden.diagnosticoCliente || ''}
          onChange={(e) =>
            handleOrdenChange('diagnosticoCliente', e.target.value)
          }
          className="input-field"
        />
      </div>

      <div className="col" style={{ marginTop: 10 }}>
        <label>Observaciones</label>
        <textarea
          value={orden.observaciones || ''}
          onChange={(e) => handleOrdenChange('observaciones', e.target.value)}
          className="input-field"
        />
      </div>
    </>
  );
}

export default OrdenServicio;
