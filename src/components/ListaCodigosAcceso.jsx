import React from 'react';
import CodigoAccesoItem from '@components/CodigoAccesoItems'; 
import styles from '@styles/ListaCodigosAcceso.module.css';

const CodigoAccesoList = ({ codigos, reducirUso }) => {
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
        {codigos.map((codigoItem, index) => (
          <CodigoAccesoItem
            key={index}
            codigo={codigoItem.codigo}
            usosDisponibles={codigoItem.usosDisponibles}
            estado={codigoItem.estado}
            reducirUsos={() => reducirUso(codigoItem.codigo)} // 💥 Corrección
          />
        ))}
      </tbody>
    </table>
  );
};

export default CodigoAccesoList;
