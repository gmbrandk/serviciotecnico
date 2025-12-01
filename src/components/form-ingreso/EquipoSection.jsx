// src/components/form-ingreso/EquipoSection.jsx
import { useEffect } from 'react';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext.jsx';
import { useAutocompleteEquipo } from '@hooks/form-ingreso/useAutocompleteEquipo';
import { Autocomplete } from '@components/form-ingreso/Autocomplete.jsx';
import Collapsible from '@components/form-ingreso/Collapsible.jsx'; // ajusta la ruta según tu estructura

export function EquipoSection() {
  const { equipo, setEquipo } = useIngresoForm();

  const {
    query,
    resultados,
    selectedEquipo,
    seleccionarEquipo,
    onQueryChange,
    abrirResultados,
    cerrarResultados,
    isOpen,
    setSelectedEquipo,
  } = useAutocompleteEquipo(equipo);

  /* ======================================================
     🔄 Sincroniza con el contexto
  ====================================================== */
  useEffect(() => {
    setEquipo(selectedEquipo);
  }, [selectedEquipo, setEquipo]);

  /* ======================================================
     📝 Edición manual de campos (también actualiza contexto)
  ====================================================== */
  const handleChange = (field, value) => {
    const updated = { ...selectedEquipo, [field]: value };
    setSelectedEquipo(updated);
    setEquipo(updated);
  };

  return (
    <>
      <div className="row">
        {/* ======================================================
            🔎 AUTOCOMPLETADO EQUIPO
        ======================================================= */}
        <Autocomplete
          label="N° de Serie (buscar equipo)"
          placeholder="Ingresa N° de Serie, marca o modelo..."
          inputName="nroSerie"
          query={query}
          onChange={onQueryChange}
          resultados={resultados}
          isOpen={isOpen}
          onSelect={seleccionarEquipo}
          cerrarResultados={cerrarResultados}
          abrirResultados={abrirResultados}
          renderItem={(e) => (
            <>
              <strong>{e.nroSerie}</strong>
              <br />
              {e.marca} {e.modelo}
            </>
          )}
        />

        {/* ======================================================
            ⚙️ DATOS GENERALES
        ======================================================= */}
        <div className="col">
          <label className="input-label">Tipo</label>
          <input
            type="text"
            name="tipo"
            value={selectedEquipo?.tipo || ''}
            onChange={(e) => handleChange('tipo', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="col">
          <label className="input-label">Marca</label>
          <input
            type="text"
            name="marca"
            value={selectedEquipo?.marca || ''}
            onChange={(e) => handleChange('marca', e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="row" style={{ marginTop: '10px' }}>
        <div className="col">
          <label className="input-label">Modelo</label>
          <input
            type="text"
            name="modelo"
            value={selectedEquipo?.modelo || ''}
            onChange={(e) => handleChange('modelo', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="col">
          <label className="input-label">SKU</label>
          <input
            type="text"
            name="sku"
            value={selectedEquipo?.sku || ''}
            onChange={(e) => handleChange('sku', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="col">
          <label className="input-label">MAC Address</label>
          <input
            type="text"
            name="macAddress"
            value={selectedEquipo?.macAddress || ''}
            onChange={(e) => handleChange('macAddress', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="col">
          <label className="input-label">IMEI</label>
          <input
            type="text"
            name="imei"
            value={selectedEquipo?.imei || ''}
            onChange={(e) => handleChange('imei', e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* === SUBCOLLAPSIBLE: FICHA TÉCNICA === */}
      <Collapsible title="Ficha técnica" main={false} initMode="collapsed">
        <div className="row">
          <div className="col">
            <label className="input-label">CPU</label>
            <input
              type="text"
              name="procesador"
              value={selectedEquipo?.procesador || ''}
              onChange={(e) => handleChange('procesador', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="col">
            <label className="input-label">RAM</label>
            <input
              type="text"
              name="ram"
              value={selectedEquipo?.ram || ''}
              onChange={(e) => handleChange('ram', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="row" style={{ marginTop: '10px' }}>
          <div className="col">
            <label className="input-label">Almacenamiento</label>
            <input
              type="text"
              name="almacenamiento"
              value={selectedEquipo?.almacenamiento || ''}
              onChange={(e) => handleChange('almacenamiento', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="col">
            <label className="input-label">GPU</label>
            <input
              type="text"
              name="gpu"
              value={selectedEquipo?.gpu || ''}
              onChange={(e) => handleChange('gpu', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </Collapsible>
    </>
  );
}
