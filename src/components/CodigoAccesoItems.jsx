import React from 'react';
import styles from '@styles/CodigoAccesoItem.module.css'; // Importamos los estilos
import { normalizedId } from '../utils/formatters';

const CodigoAccesoItem = ({ id, codigo, usosDisponibles, estado, reducirUsos, spotlightActivoId }) => {
  const handleReducirUso = () => {
    //console.log('Reduciendo uso para el código:', codigo);
    reducirUsos(codigo);
  };

  //console.group(`🧩 Renderizando CódigoAccesoItem - ID: ${id}`);
  //console.log('SpotlightActivoId recibido:', spotlightActivoId);
  //if (id === spotlightActivoId) {
  //  console.log(`💡 Spotlight activo para este ID: ${id}`);
  //}
  //console.groupEnd();

  return (
    <tr className={`${styles.itemRow} ${id === spotlightActivoId ? styles.spotlight : ''}`}>
      <td data-th="Código de acceso">{codigo}</td>
      <td data-th="Usos disponibles">{usosDisponibles}</td>
      <td data-th="Estado">{estado === 'activo' ? 'Activo' : 'Inactivo'}</td>
      <td data-th="Acciones">
        <button
          className={styles.reduceButton}
          onClick={handleReducirUso}
          disabled={estado === 'inactivo' || usosDisponibles <= 0}
        >
          Reducir Uso
        </button>
      </td>
    </tr>
  );
};


export default CodigoAccesoItem;
