import React from 'react';
import styles from '@styles/CodigoAccesoItem.module.css'; // Importamos los estilos

const CodigoAccesoItem = ({ codigo, usosDisponibles, estado, reducirUsos }) => {

  const handleReducirUso = () => {
    console.log('Reduciendo uso para el código:', codigo); // <-- Aquí registramos
    reducirUsos(codigo); // Le pasamos el código al handler
  };

  return (
    <tr className={styles.itemRow}>
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
