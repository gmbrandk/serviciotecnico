import React, { useState } from 'react';
import Spinner from '@components/shared/Spinner';
import CopyInput from '@components/shared/CopyInput';
import ListaCodigosAcceso from '@components/ListaCodigosAcceso';
import { useCodigosAccesoContext } from '@context/codigoAccesoContext'; // Usamos el contexto aquí
import { handleGenerarCodigo } from '@logic/handleGenerarCodigo';
import { activarSpotlight } from '@logic/activarSpotlight';
import styles from '@styles/CrearCodigo.module.css';

const CrearCodigo = () => {
  const { codigos, setCodigos, reducirUsoCodigo, hayCodigoActivo, loading } = useCodigosAccesoContext(); // Usamos el hook del contexto
  const [usosSeleccionados, setUsosSeleccionados] = useState(1);
  const [spotlightActivoId, setSpotlightActivoId] = useState(null);

  // Obtenemos el código activo actual (si existe)
  const codigoActivo = codigos.find(codigo => codigo.estado === 'activo');

  const generarCodigo = () => {
    if (loading) return;
    handleGenerarCodigo({
      hayCodigoActivo,
      codigos,
      setCodigos,
      startLoading: () => {},
      stopLoading: () => {},
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
      <ListaCodigosAcceso
        codigos={codigos}
        reducirUso={reducirUsoCodigo}
        spotlightActivoId={spotlightActivoId}
        setSpotlightActivoId={setSpotlightActivoId}
      />
    </div>
  );
};

export default CrearCodigo;
