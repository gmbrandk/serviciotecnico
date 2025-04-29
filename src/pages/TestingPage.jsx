import React, { useState, useEffect } from 'react';
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
  const { loading, startLoading, stopLoading } = useLoading();
  const [spotlightActivoId, setSpotlightActivoId] = useState(null); // ⭐ Para manejar el spotlight

  // Obtenemos el código activo actual (si existe)
  const codigoActivo = codigos.find(codigo => codigo.estado === 'activo');
  const { copiado, handleCopiar } = useClipboard(codigoActivo?.codigo || '');

  // Activamos el spotlight sobre un código específico
  const activarSpotlight = (codigoId) => {
    console.group('💡 activarSpotlight');
    console.log('✨ Activando spotlight para el código ID:', codigoId);
    setSpotlightActivoId(codigoId);
    setTimeout(() => {
      console.log('🛑 Desactivando spotlight');
      setSpotlightActivoId(null);
      console.groupEnd();
    }, 2500);
  };

  // Función principal del botón Generar
  const handleGenerar = async () => {
    console.group('🛎️ handleGenerar');
  
    const hayCodigoActivo = codigos.some((c) => c.estado === 'activo');
    console.log('¿Hay código activo?', hayCodigoActivo);
  
    if (hayCodigoActivo && codigoActivo?.id) {
      console.log('✅ Hay un código activo, activando spotlight para id:', codigoActivo.id);
      activarSpotlight(codigoActivo.id);
      console.groupEnd();
      return;
    }
  
    console.log('🆕 No hay código activo, generando nuevo código...');
    
    startLoading(); // Empieza la carga
  
    try {
      // Generar el nuevo código con el número de usos seleccionados
      await generarNuevoCodigo(usosSeleccionados);
      console.log('✅ Código generado correctamente');
    } catch (error) {
      console.error('❌ Error al generar el código:', error);
    } finally {
      // Agregar un pequeño retraso antes de detener el spinner
      setTimeout(() => {
        stopLoading(); // Detiene la carga después del retraso
      }, 500); // Retraso de 500ms para dar tiempo al spinner a mostrar
    }
  
    console.groupEnd();
  };
  

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
          className={`${styles.generateButton} ${loading ? styles.loading : ''}${hayCodigoActivo ? styles.disabled : ''}`}
          onClick={handleGenerar}
         
        >
          {loading ? <Spinner size={20} /> : hayCodigoActivo ? 'Generar' : 'Generar'}
        </button>

        {/* Input + botón copiar */}
        <div className={styles.inputCopyWrapper}>
          <input
            value={codigoActivo?.codigo || ''}
            readOnly
            disabled
            className={styles.inputField}
          />
          <button
            className={styles.copyButton}
            onClick={handleCopiar}
            disabled={!codigoActivo}
            title={copiado ? '¡Copiado!' : 'Copiar'}
          >
            {copiado ? <FiCheck /> : <FiCopy />}
          </button>
        </div>
      </div>

      {/* Lista de códigos, enviamos spotlightActivoId */}
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
