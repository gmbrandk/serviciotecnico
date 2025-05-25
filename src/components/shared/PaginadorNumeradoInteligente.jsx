import React from 'react';
import { defaultPaginadorStyles } from '@styles'; // ✅ Tu estilo retro por defecto

const generarRangoNumerado = ({
  paginaActual,
  totalPaginas,
  maxVisible = 5,
}) => {
  if (totalPaginas <= maxVisible) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  const rango = [];
  const numBotonesMedios = maxVisible - 2;
  let start = Math.max(2, paginaActual - Math.floor(numBotonesMedios / 2));
  let end = start + numBotonesMedios - 1;

  if (end >= totalPaginas) {
    end = totalPaginas - 1;
    start = end - numBotonesMedios + 1;
  }

  rango.push(1);

  if (start > 2) {
    rango.push('...');
  }

  for (let i = start; i <= end; i++) {
    rango.push(i);
  }

  if (end < totalPaginas - 1) {
    rango.push('...');
  }

  rango.push(totalPaginas);

  return rango;
};

const PaginadorNumeradoInteligente = ({
  paginaActual,
  totalPaginas,
  setPaginaActual,
  esMovil = false,
  maxVisible = 5,
  estilos = {}, // ✅ estilos inyectados externamente
}) => {
  const styles = {
    pagination: estilos?.pagination || defaultPaginadorStyles.pagination,
    button: estilos?.button || defaultPaginadorStyles.button,
    activo: estilos?.activo || defaultPaginadorStyles.activo,
    puntos: estilos?.puntos || defaultPaginadorStyles.puntos,
  };

  const rango = generarRangoNumerado({
    paginaActual,
    totalPaginas,
    maxVisible,
  });

  const irPrimera = () => setPaginaActual(1);
  const irAnterior = () => setPaginaActual((prev) => Math.max(prev - 1, 1));
  const irSiguiente = () =>
    setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));
  const irUltima = () => setPaginaActual(totalPaginas);

  return (
    <div className={styles.pagination}>
      {!esMovil && paginaActual > 1 && (
        <>
          <button className={styles.button} onClick={irPrimera}>
            « Primera
          </button>
          <button className={styles.button} onClick={irAnterior}>
            ← Anterior
          </button>
        </>
      )}

      {rango.map((item, index) =>
        item === '...' ? (
          <span key={`ellipsis-${index}`} className={styles.puntos}>
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => setPaginaActual(item)}
            className={`${styles.button} ${
              paginaActual === item ? styles.activo : ''
            }`}
          >
            {item}
          </button>
        )
      )}

      {!esMovil && paginaActual < totalPaginas && (
        <>
          <button className={styles.button} onClick={irSiguiente}>
            Siguiente →
          </button>
          <button className={styles.button} onClick={irUltima}>
            Última »
          </button>
        </>
      )}
    </div>
  );
};

export default PaginadorNumeradoInteligente;
