import React, { useState } from 'react';
import TablaHeader from './TablaHeader';
import TablaBody from './TablaBody';
import TablaPaginacion from './TablaPaginacion';
import TablaVacia from './TablaVacia';
import styles from '@styles/ListaCodigosAcceso.module.css';

const TablaDatos = ({ columns, data }) => {
  const itemsPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.ceil(data.length / itemsPorPagina);
  const datosPaginados = data.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  if (!data.length) return <TablaVacia />;

  return (
    <div style={{maxWidth :'500px'}}>
      <table className={styles.rwdTable} >
        <TablaHeader columns={columns} />
        <TablaBody data={datosPaginados} columns={columns} />
      </table>
      {totalPaginas > 1 && (
        <TablaPaginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
        />
      )}
    </div>
  );
};

export default TablaDatos;
