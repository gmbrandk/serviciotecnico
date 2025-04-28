import React from 'react';
import styles from '@styles/CodigoAccesoItem.module.css'; // Importamos los estilos

const CodigoAccesoItem = ({ codigo, usosDisponibles, estado, reducirUsos }) => {
  return (
    <tr className={styles.itemRow}>
      <td data-th="Código de acceso">{codigo}</td>
      <td data-th="Usos disponibles">{usosDisponibles}</td>
      <td data-th="Estado">{estado === 'activo' ? 'Activo' : 'Inactivo'}</td>
      <td data-th="Acciones">
        <button
          className={styles.reduceButton}
          onClick={reducirUsos}
          disabled={estado === 'inactivo' || usosDisponibles <= 0}
        >
          Reducir Uso
        </button>
      </td>
    </tr>
  );
};

export default CodigoAccesoItem;
