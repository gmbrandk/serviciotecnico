import React from 'react';
import CodigoAccesoItem from '@components/CodigoAccesoItems'; // Importamos el item de código
import styles from '@styles/ListaCodigosAcceso.module.css'; // Estilos para la lista completa

const CodigoAccesoList = ({ codigos }) => {
  return (
    <table className={styles.rwdTable}>
      <thead>
        <tr>
          <th>Código de Acceso</th>
          <th>Usos Disponibles</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {codigos.map((codigo, index) => (
          <CodigoAccesoItem
            key={index}
            codigo={codigo.codigo}
            usosDisponibles={codigo.usosDisponibles}
            estado={codigo.estado}
            reducirUsos={codigo.reducirUsos}
          />
        ))}
      </tbody>
    </table>
  );
};

export default CodigoAccesoList;
