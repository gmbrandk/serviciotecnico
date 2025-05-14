import React from 'react';
import styles from '../../../styles/general/tabla/emptyTable.module.css';

const TablaVacia = () => {
  return (
    <div className={styles.emptyState}>
      <img src="/empty.svg" alt="Sin datos" className={styles.emptyImage} />
      <p className="emptyMessage">No hay datos disponibles</p>
    </div>
  );
};

export default TablaVacia;
