import React, { useState, useEffect } from 'react'; 
import CodigoAccesoItem from '@components/CodigoAccesoItems'; 
import styles from '@styles/ListaCodigosAcceso.module.css';
import { normalizedId } from '../utils/formatters';

const CodigoAccesoList = ({ codigos, reducirUso, spotlightActivoId, setSpotlightActivoId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Cantidad de códigos por página
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480); // Detectamos si es móvil

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtrar los códigos activos
  const codigosActivos = codigos.filter(c => c.estado === 'activo');
  console.log('Códigos activos:', codigosActivos); // Log para ver los códigos activos

  // Mostrar solo los códigos activos en móviles
  const codigosAmostrar = isMobile ? codigosActivos.slice(0, 1) : codigos;
  console.log('Códigos a mostrar:', codigosAmostrar); // Log para ver qué códigos se están mostrando

  // Obtener los índices de inicio y fin de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Dividir la lista de códigos según la paginación
  const currentItems = codigosAmostrar.slice(indexOfFirstItem, indexOfLastItem);
  console.log('🧮Ítems actuales (paginados):', currentItems); // Log para ver los ítems actuales

  // Cambiar de página
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  console.log('Códigos antes de filtrar:', currentItems);
  return (
    <>
      {spotlightActivoId && (
        <div
          className={styles.overlay}
          onClick={() => setSpotlightActivoId(null)}
        ></div>
      )}

      {isMobile && codigosAmostrar.length === 0 ? (
        <div className={styles.emptyState}>
          <img
            src="/empty-box.svg"
            alt="Sin códigos activos"
            className={styles.emptyImage}
          />
          <p className={styles.emptyMessage}>
            <strong>No hay códigos activos por ahora.</strong><br />
            Genera uno nuevo para compartir acceso de forma segura.
          </p>
        </div>
      ) : (
        <table className={styles.rwdTable}>
          <thead>
            <tr>
              <th>Código de Acceso</th>
              <th>Usos Disponibles</th>
              <th>Estado</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>       
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="4" className={styles.emptyRow}>
                  No hay códigos disponibles en este momento.
                </td>
              </tr>
            ) : (
              currentItems.filter(c => c.id).map((codigoItem) => {
                const id = normalizedId(codigoItem);
                console.log('📦 Renderizando item con ID:', id, 'Datos:', codigoItem);
                return (
                  <CodigoAccesoItem
                    key={id}
                    id={id}
                    codigo={codigoItem.codigo}
                    usosDisponibles={codigoItem.usosDisponibles}
                    estado={codigoItem.estado}
                    creadoPor={codigoItem.creadoPor?.nombre ?? 'N/A'}
                    reducirUsos={() => reducirUso(codigoItem.codigo)}
                    spotlightActivoId={spotlightActivoId}
                  />
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* Mostrar la paginación si hay más de un código */}
      {codigosAmostrar.length > itemsPerPage && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>{currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(codigosAmostrar.length / itemsPerPage)}
          >
            Siguiente
          </button>
        </div>
      )}
    </>
  );
};

export default CodigoAccesoList;
