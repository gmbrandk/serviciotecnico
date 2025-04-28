import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import Spinner from '@components/shared/Spinner';
import useCodigosAcceso from '@hooks/useCodigosAcceso';
import useClipboard from '@hooks/useClipboard';
import useLoading from '@hooks/useLoading';
import ListaCodigosAcceso from '@components/ListaCodigosAcceso';
import styles from '@styles/CrearCodigo.module.css';

const CrearCodigo = () => {
  const { codigos, generarNuevoCodigo, reducirUso, hayCodigoActivo } = useCodigosAcceso();
  const [usosSeleccionados, setUsosSeleccionados] = useState(1);
  const { loading, startLoading, stopLoading } = useLoading(); // 🚀 Hook de loading
  
  // Obtener el código activo actual (si existe)
  const codigoActivo = codigos.find(codigo => codigo.estado === 'activo');
  
  const { copiado, handleCopiar } = useClipboard(codigoActivo?.codigo || '');

  const handleGenerar = () => {
    startLoading();
    setTimeout(() => { // Simulamos un delay (luego será real cuando llames al backend)
      generarNuevoCodigo(usosSeleccionados);
      stopLoading();
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Generar Código de Acceso</h1>

      {/* Bloquear generación si hay código activo */}
      <div className={styles.inputGroup}>
        <select
          value={usosSeleccionados}
          onChange={(e) => setUsosSeleccionados(parseInt(e.target.value, 10))}
          className={styles.selectUsos}
          disabled={hayCodigoActivo}
        >
          {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num} uso</option>)}
        </select>

        <button
          className={styles.generateButton}
          onClick={handleGenerar}
          disabled={hayCodigoActivo || loading}
        >
          {loading ? <Spinner size={20} /> : hayCodigoActivo ? 'Código Activo' : 'Generar'}
        </button>

        {/* Botón copiar solo si hay código activo */}
        <div className={styles.inputCopyWrapper}>
          <input value={codigoActivo?.codigo || ''} readOnly disabled className={styles.inputField} />
          <button
            className={styles.copyButton}
            onClick={handleCopiar}
            disabled={!codigoActivo}
            title={copiado ? "¡Copiado!" : "Copiar"}
          >
            {copiado ? <FiCheck /> : <FiCopy />}
          </button>
        </div>
      </div>

      {/* Lista de todos los códigos */}
      <ListaCodigosAcceso codigos={codigos} reducirUso={reducirUso} />
    </div>
  );
};

export default CrearCodigo;
