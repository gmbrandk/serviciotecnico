// src/components/form-ingreso/ClienteSection.jsx
import { useEffect } from 'react';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext.jsx';
import { useAutocompleteCliente } from '@hooks/form-ingreso/useAutocompleteCliente.js';
import { Autocomplete } from '@components/form-ingreso/Autocomplete.jsx';

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

  // 🧩 Sincroniza el cliente del contexto con el del hook
  useEffect(() => {
    setCliente(selectedCliente);
  }, [selectedCliente, setCliente]);

  const handleFieldChange = (field, value) => {
    const updated = { ...selectedCliente, [field]: value };
    setSelectedCliente(updated);
    setCliente(updated); // actualiza también el contexto
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
          <label>Nombres</label>
          <input
            name="nombres"
            type="text"
            value={selectedCliente?.nombres || ''}
            onChange={(e) => handleFieldChange('nombres', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="col">
          <label>Apellidos</label>
          <input
            name="apellidos"
            type="text"
            value={selectedCliente?.apellidos || ''}
            onChange={(e) => handleFieldChange('apellidos', e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="row" style={{ marginTop: '10px' }}>
        <div className="col">
          <label>Teléfono</label>
          <input
            type="text"
            value={selectedCliente?.telefono || ''}
            onChange={(e) => handleFieldChange('telefono', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="col">
          <label>Email</label>
          <input
            type="email"
            value={selectedCliente?.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="col">
          <label>Dirección</label>
          <input
            type="text"
            value={selectedCliente?.direccion || ''}
            onChange={(e) => handleFieldChange('direccion', e.target.value)}
            className="input-field"
          />
        </div>
      </div>
    </>
  );
}
