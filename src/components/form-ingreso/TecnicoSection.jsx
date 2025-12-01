// src/components/form-ingreso/TecnicoSection.jsx
import { useAutocompleteTecnico } from '@hooks/form-ingreso/useAutocompleteTecnico.js';

export function TecnicoSection() {
  const {
    query,
    resultados,
    selectedTecnico,
    seleccionarTecnico,
    isOpen,
    onChange,
    cerrarResultados,
  } = useAutocompleteTecnico();

  return (
    <fieldset className="collapsible" data-main="true">
      <legend>Orden de Servicio</legend>
      <div className="fieldset-content">
        <div className="form-row">
          <label htmlFor="tecnicoSearch">Técnico:</label>
          <div className="autocomplete-wrapper">
            <input
              id="tecnicoSearch"
              type="text"
              value={query}
              onChange={onChange}
              onBlur={() => setTimeout(cerrarResultados, 150)}
              placeholder="Buscar técnico por nombre o email..."
              autoComplete="off"
            />
            {isOpen && resultados.length > 0 && (
              <div className="autocomplete-list">
                {resultados.map((t) => (
                  <div
                    key={t.id}
                    className="autocomplete-item"
                    onMouseDown={() => seleccionarTecnico(t)}
                  >
                    <strong>
                      {t.nombres} {t.apellidos}
                    </strong>
                    <br />
                    <small>{t.email}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-grid">
          <div>
            <label>Email técnico:</label>
            <input type="email" value={selectedTecnico?.email || ''} readOnly />
          </div>
          <div>
            <label>Teléfono técnico:</label>
            <input
              type="tel"
              value={selectedTecnico?.telefono || ''}
              readOnly
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}
