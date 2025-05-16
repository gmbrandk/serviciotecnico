import React, { useState } from 'react';
import { Tabla } from '@components/shared/Tabla';
import Spinner from '@components/shared/Spinner';
import CopyInput from '@components/shared/CopyInput';
import { useCodigosAccesoContext } from '@context/codigoAccesoContext';
import { handleGenerarCodigo } from '@logic/handleGenerarCodigo';
import { activarSpotlight } from '@logic/activarSpotlight';
import styles from '@styles/CrearCodigo.module.css';
import { animationStyles, tableStyles } from '@styles';
import { columnasCodigos } from '@data/tabla/columnasCodigos';
import { normalizedId } from '@utils/formatters';

const CrearCodigo = () => {
  const { codigos, setCodigos, reducirUsoCodigo, hayCodigoActivo, loading, setLoading } = useCodigosAccesoContext();
  const [usosSeleccionados, setUsosSeleccionados] = useState(1);
  const [spotlightActivoId, setSpotlightActivoId] = useState(null);
  const [botonGenerado, setBotonGenerado] = useState(false);

  const codigoActivo = codigos.find(codigo => codigo.estado === 'activo');

  const generarCodigo = () => {
    if (loading) return;
    handleGenerarCodigo({
      hayCodigoActivo,
      codigos,
      setCodigos,
      setBotonGenerado,
      startLoading: () => setLoading(true),
      stopLoading: () => setLoading(false),
      usosSeleccionados,
      activarSpotlight,
      setSpotlightActivoId
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Generar Código de Acceso</h1>
      <div className={styles.inputGroup}>
        <div className={styles.generateComponent}>
          <select
            value={usosSeleccionados}
            onChange={(e) => setUsosSeleccionados(parseInt(e.target.value, 10))}
            className={styles.selectUsos}
            disabled={hayCodigoActivo}
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>
                {num} uso{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.generateComponent}>
          <button
            className={`${styles.generateButton} 
              ${loading ? styles.loading : ''} 
              ${hayCodigoActivo ? styles.disabled : ''}`}
            onClick={generarCodigo}
          >
            {loading ? <Spinner color="#fff" size={20} /> : hayCodigoActivo ? '✔ Generado' : 'Generar'}
          </button>
          <CopyInput
            value={codigoActivo?.codigo || ''}
            onCopy={() => {}}
            copiado={false}
            disabled={!codigoActivo}
          />
        </div>
      </div>

      <h2>Codigos disponibles</h2>

      {spotlightActivoId && (
        <div
          className={tableStyles.overlay}
          onClick={() => setSpotlightActivoId(null)}
        />
      )}

      <Tabla
        columns={columnasCodigos}
        data={codigos}
        rowClassNameCallback={(item) =>
          normalizedId(item) === spotlightActivoId ? 'spotlight' : ''
        }
        rowStyles={animationStyles}
        renderAcciones={(item) => (
          <>
            <button onClick={() => reducirUsoCodigo(item._id)}>➖ Usos</button>
          </>
        )}
        className={tableStyles.rwdTable}
      />
    </div>
  );
};

export default CrearCodigo;
