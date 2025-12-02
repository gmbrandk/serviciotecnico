// src/components/form-ingreso/EquipoSection.jsx
import { Autocomplete } from '@components/form-ingreso/Autocomplete.jsx';
import Collapsible from '@components/form-ingreso/Collapsible.jsx';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext.jsx';
import { useAutocompleteEquipo } from '@hooks/form-ingreso/useAutocompleteEquipo';
import { useEffect } from 'react';

// ⭐ Importamos los estilos unificados
import { inputsStyles as equipoSectionStyles } from '@styles/form-ingreso';

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
     📝 Edición manual de campos
  ====================================================== */
  const handleChange = (field, value) => {
    const updated = { ...selectedEquipo, [field]: value };
    setSelectedEquipo(updated);
    setEquipo(updated);
  };

  return (
    <>
      <div className="row">
        {/* AUTOCOMPLETE DE EQUIPO */}
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

        {/* CAMPOS GENERALES */}
        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>Tipo</label>
          <input
            type="text"
            name="tipo"
            value={selectedEquipo?.tipo || ''}
            onChange={(e) => handleChange('tipo', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>Marca</label>
          <input
            type="text"
            name="marca"
            value={selectedEquipo?.marca || ''}
            onChange={(e) => handleChange('marca', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>
      </div>

      <div className="row" style={{ marginTop: '10px' }}>
        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>Modelo</label>
          <input
            type="text"
            name="modelo"
            value={selectedEquipo?.modelo || ''}
            onChange={(e) => handleChange('modelo', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>SKU</label>
          <input
            type="text"
            name="sku"
            value={selectedEquipo?.sku || ''}
            onChange={(e) => handleChange('sku', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>MAC Address</label>
          <input
            type="text"
            name="macAddress"
            value={selectedEquipo?.macAddress || ''}
            onChange={(e) => handleChange('macAddress', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>IMEI</label>
          <input
            type="text"
            name="imei"
            value={selectedEquipo?.imei || ''}
            onChange={(e) => handleChange('imei', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>
      </div>

      {/* FICHA TÉCNICA */}
      <Collapsible title="Ficha técnica" main={false} initMode="collapsed">
        <div className="row">
          <div className="col">
            <label className={equipoSectionStyles.inputLabel}>CPU</label>
            <input
              type="text"
              name="procesador"
              value={selectedEquipo?.procesador || ''}
              onChange={(e) => handleChange('procesador', e.target.value)}
              className={equipoSectionStyles.inputField}
            />
          </div>

          <div className="col">
            <label className={equipoSectionStyles.inputLabel}>RAM</label>
            <input
              type="text"
              name="ram"
              value={selectedEquipo?.ram || ''}
              onChange={(e) => handleChange('ram', e.target.value)}
              className={equipoSectionStyles.inputField}
            />
          </div>
        </div>

        <div className="row" style={{ marginTop: '10px' }}>
          <div className="col">
            <label className={equipoSectionStyles.inputLabel}>
              Almacenamiento
            </label>
            <input
              type="text"
              name="almacenamiento"
              value={selectedEquipo?.almacenamiento || ''}
              onChange={(e) => handleChange('almacenamiento', e.target.value)}
              className={equipoSectionStyles.inputField}
            />
          </div>

          <div className="col">
            <label className={equipoSectionStyles.inputLabel}>GPU</label>
            <input
              type="text"
              name="gpu"
              value={selectedEquipo?.gpu || ''}
              onChange={(e) => handleChange('gpu', e.target.value)}
              className={equipoSectionStyles.inputField}
            />
          </div>
        </div>
      </Collapsible>
    </>
  );
}
