// components/shared/Paginador.jsx
import React from 'react';
//import styles from '@styles/general/Pagination.module.css'; // Asumiendo un archivo de estilos general

const Paginador = ({ paginaActual, totalPaginas, setPaginaActual }) => {
  const avanzar = () => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));
  const retroceder = () => setPaginaActual((prev) => Math.max(prev - 1, 1));

  return (
    <div className={styles.pagination}>
      <button
        onClick={retroceder}
        disabled={paginaActual === 1}
        aria-label="Página anterior"
      >
        Anterior
      </button>
      <span aria-live="polite">
        {paginaActual} de {totalPaginas}
      </span>
      <button
        onClick={avanzar}
        disabled={paginaActual === totalPaginas}
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Paginador;
