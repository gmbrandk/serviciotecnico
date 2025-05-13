import React from 'react';
import styles from '../../../styles/ListaCodigosAcceso.module.css';

const TablaPaginacion = ({ paginaActual, totalPaginas, setPaginaActual }) => {
  const avanzar = () => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));
  const retroceder = () => setPaginaActual((prev) => Math.max(prev - 1, 1));

  return (
    <div className={styles.pagination}>
      <button onClick={retroceder} disabled={paginaActual === 1}>
        Anterior
      </button>
      <span>{paginaActual} de {totalPaginas}</span>
      <button onClick={avanzar} disabled={paginaActual === totalPaginas}>
        Siguiente
      </button>
    </div>
  );
};

export default TablaPaginacion;
