import React, { useState } from 'react';
import CodigoAccesoItem from '@components/CodigoAccesoItems'; 
import styles from '@styles/ListaCodigosAcceso.module.css';
import { normalizedId } from '../utils/formatters';

const CodigoAccesoList = ({ codigos, reducirUso, spotlightActivoId, setSpotlightActivoId }) => {
  // Estado de la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 4; // Puedes ajustar esto según lo que desees

  // Función para cambiar de página
  const handleCambioPagina = (pagina) => {
    setPaginaActual(pagina);
  };

  // Calcular los elementos que deben mostrarse en la página actual
  const startIndex = (paginaActual - 1) * elementosPorPagina;
  const codigosPagina = codigos.slice(startIndex, startIndex + elementosPorPagina);

  // Número total de páginas
  const totalPaginas = Math.ceil(codigos.length / elementosPorPagina);

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
          {codigosPagina.filter(c=>c._id).map((codigoItem) => (
            <CodigoAccesoItem
              key={normalizedId(codigoItem)} // Usamos el ID real, no el index
              id={normalizedId(codigoItem)}  // Pasamos también el ID al item
              codigo={codigoItem.codigo}
              usosDisponibles={codigoItem.usosDisponibles}
              estado={codigoItem.estado}
              reducirUsos={() => reducirUso(codigoItem.codigo)}
              spotlightActivoId={spotlightActivoId} // 💥 Nuevo prop
            />
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className={styles.pagination}>
        <button 
          onClick={() => handleCambioPagina(1)} 
          disabled={paginaActual === 1}
        >
          {'<<'}
        </button>
        <button 
          onClick={() => handleCambioPagina(paginaActual - 1)} 
          disabled={paginaActual === 1}
        >
          {'<'}
        </button>
        <span>{paginaActual} de {totalPaginas}</span>
        <button 
          onClick={() => handleCambioPagina(paginaActual + 1)} 
          disabled={paginaActual === totalPaginas}
        >
          {'>'}
        </button>
        <button 
          onClick={() => handleCambioPagina(totalPaginas)} 
          disabled={paginaActual === totalPaginas}
        >
          {'>>'}
        </button>
      </div>
    </>
  );
};

export default CodigoAccesoList;
