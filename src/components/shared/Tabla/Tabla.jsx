import React, { useState } from 'react';
import { TablaHeader, TablaBody, TablaPaginacion, TablaVacia } from '@components/shared/Tabla'
import styles from '../../../styles/general/tabla/Tabla.module.css';


const Tabla = ({ columns, data, spotlightActivoId, setSpotlightActivoId }) => {
  const itemsPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.ceil(data.length / itemsPorPagina);
  const datosPaginados = data.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  if (!data.length) return <TablaVacia />;

  return (
    <>
      {spotlightActivoId && (
        <div
          className={styles.overlay}
          onClick={() => setSpotlightActivoId(null)}
        ></div>
      )}
      <div style={{ maxWidth: '500px' }}>
        <table className={styles.rwdTable}>
          <TablaHeader columns={columns} />
          <TablaBody 
            data={datosPaginados} 
            columns={columns} 
            spotlightActivoId={spotlightActivoId}
            setSpotlightActivoId={setSpotlightActivoId}
          />
        </table>
        {totalPaginas > 1 && (
          <TablaPaginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            setPaginaActual={setPaginaActual}
          />
        )}
      </div>
    </>
  );
};

export default Tabla;
