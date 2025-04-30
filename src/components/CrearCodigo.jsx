import React, { useState } from 'react';
import Spinner from '@components/shared/Spinner';
import CopyInput from '@components/shared/CopyInput';
import ListaCodigosAcceso from '@components/ListaCodigosAcceso';
import useCodigosAcceso from '@hooks/useCodigosAcceso';
import useClipboard from '@hooks/useClipboard';
import useLoading from '@hooks/useLoading';
import useResetBotonGenerado from '../hooks/useResetBotonGenerado';
import { handleGenerarCodigo } from '../logic/handleGenerarCodigo';
import { activarSpotlight } from '../logic/activarSpotlight';
import styles from '@styles/CrearCodigo.module.css';

const CrearCodigo = () => {
  const { codigos, generarNuevoCodigo, reducirUso, hayCodigoActivo } = useCodigosAcceso();
  const [usosSeleccionados, setUsosSeleccionados] = useState(1);
  const { loading, startLoading, stopLoading } = useLoading();
  const [spotlightActivoId, setSpotlightActivoId] = useState(null); // ⭐ Para manejar el spotlight

  // Obtenemos el código activo actual (si existe)
  const codigoActivo = codigos.find(codigo => codigo.estado === 'activo');
  const { copiado, handleCopiar } = useClipboard(codigoActivo?.codigo || '');

  // Función principal del botón Generar
  const [botonGenerado, setBotonGenerado] = useState(false);

  useResetBotonGenerado(codigos, setBotonGenerado);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Generar Código de Acceso</h1>

      <div className={styles.inputGroup}>
        {/* Select de usos */}
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

        {/* Botón generar */}
        <button
          className={`${styles.generateButton} 
            ${loading ? styles.loading : ''} 
            ${botonGenerado ? styles.disabled : ''}`}
            onClick={() =>
              handleGenerarCodigo({
                hayCodigoActivo,
                codigoActivo,
                startLoading,
                stopLoading,
                generarNuevoCodigo,
                usosSeleccionados,
                activarSpotlight,
                setBotonGenerado,
                setSpotlightActivoId // 👈 Asegúrate de incluir esto
              })
            }
            
        >
          {loading ? <Spinner size={20} /> : botonGenerado ? '✔ Generado' : 'Generar'}
        </button>

        {/* Input + botón copiar */}
        <CopyInput
          value={codigoActivo?.codigo || ''}
          onCopy={handleCopiar}
          copiado={copiado}
          disabled={!codigoActivo}
        />
      </div>

      {/* Lista de códigos, enviamos spotlightActivoId */}
      <h2>Codigos disponibles</h2>
      <ListaCodigosAcceso 
        codigos={codigos} 
        reducirUso={reducirUso} 
        spotlightActivoId={spotlightActivoId} 
        setSpotlightActivoId={setSpotlightActivoId}
      />
    </div>
  );
};

export default CrearCodigo;
