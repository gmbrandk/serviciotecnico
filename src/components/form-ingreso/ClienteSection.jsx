import { Autocomplete } from '@components/form-ingreso/Autocomplete';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { useAutocompleteCliente } from '@hooks/form-ingreso/useAutocompleteCliente';
import { inputsStyles as clienteSectionStyles } from '@styles/form-ingreso';
import { useEffect } from 'react';

let __LOG_SEQ__ = 0;
const log = (tag, who, why, payload = {}) => {
  __LOG_SEQ__ += 1;
  console.log(
    `%c[${__LOG_SEQ__}] ${tag} | ${who} | ${why}`,
    'color:#f90;font-weight:bold',
    payload
  );
};

export function ClienteSection() {
  const { cliente, setCliente } = useIngresoForm();

  const {
    query,
    resultados,
    selectedCliente,
    seleccionarCliente,
    isOpen,
    onQueryChange,
    abrirResultados,
    cerrarResultados,
  } = useAutocompleteCliente(cliente);

  // ============================================================
  // Sync hook → provider
  // ============================================================
  useEffect(() => {
    // 🚫 no propagar estados "no seleccionados"
    if (!selectedCliente || !selectedCliente._id) return;

    setCliente(selectedCliente);
  }, [selectedCliente, setCliente]);

  const handleFieldChange = (field, value) => {
    log('SELECTED', 'UI', 'manual-field-change', {
      field,
      value,
    });

    setCliente((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <div className="row">
        <Autocomplete
          label="DNI"
          placeholder="Buscar cliente por DNI o nombre..."
          inputName="dni"
          query={query}
          onChange={onQueryChange}
          onFocus={abrirResultados}
          resultados={resultados}
          isOpen={isOpen}
          onSelect={seleccionarCliente}
          cerrarResultados={cerrarResultados}
          renderItem={(c) => (
            <>
              <strong>
                {c.nombres} {c.apellidos}
              </strong>
              <br />
              DNI: {c.dni}
            </>
          )}
        />

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Nombres</label>
          <input
            value={selectedCliente.nombres}
            onChange={(e) => handleFieldChange('nombres', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Apellidos</label>
          <input
            value={selectedCliente.apellidos}
            onChange={(e) => handleFieldChange('apellidos', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Teléfono</label>
          <input
            value={selectedCliente.telefono}
            onChange={(e) => handleFieldChange('telefono', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Email</label>
          <input
            value={selectedCliente.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Dirección</label>
          <input
            value={selectedCliente.direccion}
            onChange={(e) => handleFieldChange('direccion', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>
      </div>
    </>
  );
}
