import React from 'react';
import TablaHeader from './TablaHeader';
import TablaBody from './TablaBody';
import tableStyles from '@styles/ListaCodigosAcceso.module.css';
import rowStyles from '@styles/CodigoAccesoItem.module.css';


const TablaDatos = ({ columns, data, spotlightId }) => {
  if (!data.length) {
    return (
      <div className="emptyState">
        <img src="/empty.png" alt="No hay datos" className="emptyImage" />
        <p className="emptyMessage">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    
    <table className={tableStyles.rwdTable}>
      <TablaHeader columns={columns} />
      <TablaBody data={data} columns={columns} className={rowStyles} spotlightId={spotlightId} />
    </table>
  );
};

export default TablaDatos;
