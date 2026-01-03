import { Autocomplete } from '@components/form-ingreso/Autocomplete';
import Collapsible from '@components/form-ingreso/Collapsible';
import { useIngresoForm } from '@context/form-ingreso/IngresoFormContext';
import { useEquipoNroSerie } from '@hooks/form-ingreso/equipo/useEquipoNroSerie';
import { useAutocompleteEquipo } from '@hooks/form-ingreso/useAutocompleteEquipo';
import { inputsStyles as equipoSectionStyles } from '@styles/form-ingreso';

export function EquipoSection() {
  const { equipo, setEquipo } = useIngresoForm();

  // 🧠 Dominio
  const { nroSerie, onChangeNroSerie, setNroSerie, lastActionRef } =
    useEquipoNroSerie();

  // 🎨 UX
  const {
    resultados,
    isOpen,
    abrirResultados,
    cerrarResultados,
    seleccionarEquipo,
  } = useAutocompleteEquipo({
    query: nroSerie,
    setQuery: setNroSerie,
    sourceRef: lastActionRef,
  });

  const handleSelect = async (item) => {
    const full = await seleccionarEquipo(item);
    if (!full?._id) return;

    setEquipo({
      ...full,
      isNew: false,
    });
  };

  const activeEquipo = equipo;

  const updateField = (field, value) => {
    setEquipo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <div className="row">
        {/* AUTOCOMPLETE DE EQUIPO */}
        <Autocomplete
          label="N° de Serie"
          placeholder="Buscar o crear equipo..."
          inputName="nroSerie"
          query={nroSerie}
          onChange={onChangeNroSerie}
          resultados={resultados}
          isOpen={isOpen}
          onFocus={abrirResultados}
          cerrarResultados={cerrarResultados}
          onSelect={handleSelect}
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
            value={activeEquipo?.tipo || ''}
            onChange={(e) => updateField('tipo', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>Marca</label>
          <input
            type="text"
            name="marca"
            value={activeEquipo?.marca || ''}
            onChange={(e) => updateField('tipo', e.target.value)}
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
            value={activeEquipo?.modelo || ''}
            onChange={(e) => updateField('tipo', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>SKU</label>
          <input
            type="text"
            name="sku"
            value={activeEquipo?.sku || ''}
            onChange={(e) => updateField('tipo', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>MAC Address</label>
          <input
            type="text"
            name="macAddress"
            value={activeEquipo?.macAddress || ''}
            onChange={(e) => updateField('tipo', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>

        <div className="col">
          <label className={equipoSectionStyles.inputLabel}>IMEI</label>
          <input
            type="text"
            name="imei"
            value={activeEquipo?.imei || ''}
            onChange={(e) => updateField('tipo', e.target.value)}
            className={equipoSectionStyles.inputField}
          />
        </div>
      </div>

      {/* FICHA TÉCNICA */}
      <Collapsible
        title="Ficha técnica"
        main={false}
        initMode="collapsed"
        mode="ficha"
      >
        <div className="row">
          <div className="col">
            <label className={equipoSectionStyles.inputLabel}>CPU</label>
            <input
              type="text"
              name="procesador"
              value={activeEquipo?.procesador || ''}
              onChange={(e) => updateField('tipo', e.target.value)}
              className={equipoSectionStyles.inputField}
            />
          </div>

          <div className="col">
            <label className={equipoSectionStyles.inputLabel}>RAM</label>
            <input
              type="text"
              name="ram"
              value={activeEquipo?.ram || ''}
              onChange={(e) => updateField('tipo', e.target.value)}
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
              value={activeEquipo?.almacenamiento || ''}
              onChange={(e) => updateField('tipo', e.target.value)}
              className={equipoSectionStyles.inputField}
            />
          </div>

          <div className="col">
            <label className={equipoSectionStyles.inputLabel}>GPU</label>
            <input
              type="text"
              name="gpu"
              value={activeEquipo?.gpu || ''}
              onChange={(e) => updateField('tipo', e.target.value)}
              className={equipoSectionStyles.inputField}
            />
          </div>
        </div>
      </Collapsible>
    </>
  );
}
