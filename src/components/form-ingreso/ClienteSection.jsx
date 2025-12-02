// src/components/form-ingreso/ClienteSection.jsx
import { Autocomplete } from '@components/form-ingreso/Autocomplete.jsx';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext.jsx';
import { useAutocompleteCliente } from '@hooks/form-ingreso/useAutocompleteCliente.js';
import { useEffect } from 'react';

// ⭐ CSS Modules
import { inputsStyles as clienteSectionStyles } from '@styles/form-ingreso';

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
    setSelectedCliente,
  } = useAutocompleteCliente(cliente);

  useEffect(() => {
    setCliente(selectedCliente);
  }, [selectedCliente, setCliente]);

  const handleFieldChange = (field, value) => {
    const updated = { ...selectedCliente, [field]: value };
    setSelectedCliente(updated);
    setCliente(updated);
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
            name="nombres"
            type="text"
            value={selectedCliente?.nombres || ''}
            onChange={(e) => handleFieldChange('nombres', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Apellidos</label>
          <input
            name="apellidos"
            type="text"
            value={selectedCliente?.apellidos || ''}
            onChange={(e) => handleFieldChange('apellidos', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>
      </div>

      <div className="row" style={{ marginTop: '10px' }}>
        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Teléfono</label>
          <input
            type="text"
            value={selectedCliente?.telefono || ''}
            onChange={(e) => handleFieldChange('telefono', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Email</label>
          <input
            type="email"
            value={selectedCliente?.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={clienteSectionStyles.inputLabel}>Dirección</label>
          <input
            type="text"
            value={selectedCliente?.direccion || ''}
            onChange={(e) => handleFieldChange('direccion', e.target.value)}
            className={clienteSectionStyles.inputField}
          />
        </div>
      </div>
    </>
  );
}
