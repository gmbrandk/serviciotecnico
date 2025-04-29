import React from 'react'; 
import CodigoAccesoItem from '@components/CodigoAccesoItems'; 
import styles from '@styles/ListaCodigosAcceso.module.css';

const CodigoAccesoList = ({ codigos, reducirUso, spotlightActivoId, setSpotlightActivoId }) => {
  return (
    <>
      {spotlightActivoId && (
        <div
          className={styles.overlay}
          onClick={() => setSpotlightActivoId(null)} // 👈 directamente aquí
        ></div>
      )}
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
        {codigos.map((codigoItem) => (
          <CodigoAccesoItem
            key={codigoItem.id} // Usamos el ID real, no el index
            id={codigoItem.id}  // Pasamos también el ID al item
            codigo={codigoItem.codigo}
            usosDisponibles={codigoItem.usosDisponibles}
            estado={codigoItem.estado}
            reducirUsos={() => reducirUso(codigoItem.codigo)}
            spotlightActivoId={spotlightActivoId} // 💥 Nuevo prop
          />
        ))}
      </tbody>
    </table>
    </>
   
  );
};

export default CodigoAccesoList;
